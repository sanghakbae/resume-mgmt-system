const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5678",
  "http://localhost:5678",
  "https://resume.sanghak.kr",
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_PDF_SNAPSHOT_BYTES = 30 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if (request.method === "POST" && url.pathname === "/api/assets/upload") {
      return uploadAsset(request, env);
    }

    if (request.method === "GET" && url.pathname === "/api/snapshots/latest") {
      return getLatestPdfSnapshot(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/snapshots/upload") {
      return uploadPdfSnapshot(request, env);
    }

    if ((request.method === "GET" || request.method === "HEAD") && url.pathname.startsWith("/assets/")) {
      return getAsset(url.pathname.slice("/assets/".length), env, request);
    }

    return jsonResponse({ error: "Not found" }, 404, request);
  },
};

async function uploadAsset(request, env) {
  if (!env.RESUME_BUCKET) {
    return jsonResponse({ error: "R2 bucket binding is not configured." }, 500, request);
  }

  const authError = await validateUploadAccess(request, env);
  if (authError) {
    return jsonResponse({ error: authError }, 401, request);
  }

  const form = await request.formData();
  const file = form.get("file");
  const ownerId = sanitizePathPart(String(form.get("ownerId") || "public-resume"));
  const kind = sanitizePathPart(String(form.get("kind") || "experience"));

  if (!(file instanceof File)) {
    return jsonResponse({ error: "file is required." }, 400, request);
  }

  if (!file.type.startsWith("image/")) {
    return jsonResponse({ error: "Only image files are allowed." }, 400, request);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonResponse({ error: "File is too large." }, 413, request);
  }

  const extension = getFileExtension(file.name, file.type);
  const key = `${kind}/${ownerId}/${Date.now()}-${crypto.randomUUID()}${extension}`;
  const cacheControl = "public, max-age=31536000, immutable";

  await env.RESUME_BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl,
    },
    customMetadata: {
      originalName: file.name,
      ownerId,
      kind,
    },
  });

  const publicUrl = `${new URL(request.url).origin}/assets/${key}`;
  return jsonResponse({ key, publicUrl }, 201, request);
}

async function uploadPdfSnapshot(request, env) {
  if (!env.RESUME_BUCKET) {
    return jsonResponse({ error: "R2 bucket binding is not configured." }, 500, request);
  }

  const authError = await validateUploadAccess(request, env);
  if (authError) {
    return jsonResponse({ error: authError }, 401, request);
  }

  const form = await request.formData();
  const file = form.get("file");
  const ownerId = sanitizePathPart(String(form.get("ownerId") || "public-resume"));
  const month = sanitizeMonth(String(form.get("month") || getCurrentMonthKey()));

  if (!(file instanceof File)) {
    return jsonResponse({ error: "file is required." }, 400, request);
  }

  if (file.type !== "application/pdf") {
    return jsonResponse({ error: "Only PDF snapshots are allowed." }, 400, request);
  }

  if (file.size > MAX_PDF_SNAPSHOT_BYTES) {
    return jsonResponse({ error: "PDF snapshot is too large." }, 413, request);
  }

  const key = `snapshots/${ownerId}/${month}.pdf`;
  const fileName = encodeURIComponent(`${ownerId}-${month}.pdf`);

  await env.RESUME_BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: "application/pdf",
      cacheControl: "public, max-age=3600",
      contentDisposition: `attachment; filename*=UTF-8''${fileName}`,
    },
    customMetadata: {
      ownerId,
      month,
      kind: "pdf-snapshot",
    },
  });

  const publicUrl = `${new URL(request.url).origin}/assets/${key}`;
  return jsonResponse({ key, publicUrl, month }, 201, request);
}

async function getLatestPdfSnapshot(request, env) {
  if (!env.RESUME_BUCKET) {
    return jsonResponse({ error: "R2 bucket binding is not configured." }, 500, request);
  }

  const url = new URL(request.url);
  const ownerId = sanitizePathPart(url.searchParams.get("ownerId") || "public-resume");
  const prefix = `snapshots/${ownerId}/`;
  const listed = await env.RESUME_BUCKET.list({ prefix, limit: 100 });
  const latest = listed.objects
    .filter((object) => object.key.endsWith(".pdf"))
    .sort((a, b) => b.key.localeCompare(a.key))[0];

  if (!latest) {
    return jsonResponse({ error: "PDF snapshot not found." }, 404, request);
  }

  const month = latest.key.slice(prefix.length).replace(/\.pdf$/i, "");
  return jsonResponse(
    {
      key: latest.key,
      publicUrl: `${url.origin}/assets/${latest.key}`,
      month,
      uploadedAt: latest.uploaded?.toISOString?.() || null,
    },
    200,
    request,
  );
}

async function getAsset(key, env, request) {
  if (!env.RESUME_BUCKET) {
    return jsonResponse({ error: "R2 bucket binding is not configured." }, 500, request);
  }

  const safeKey = decodeURIComponent(key).replace(/^\/+/, "");
  const object = await env.RESUME_BUCKET.get(safeKey);

  if (!object) {
    return jsonResponse({ error: "Asset not found." }, 404, request);
  }

  const headers = new Headers(corsHeaders(request));
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", object.httpMetadata?.cacheControl || "public, max-age=3600");
  if (safeKey.startsWith("snapshots/")) {
    const downloadName = new URL(request.url).searchParams.get("downloadName") || "resume.pdf";
    headers.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
  }

  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://resume.sanghak.kr";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "vary": "Origin",
  };
}

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function sanitizeMonth(value) {
  const trimmed = value.trim();
  return /^\d{4}-\d{2}$/.test(trimmed) ? trimmed : getCurrentMonthKey();
}

async function validateUploadAccess(request, env) {
  if (!env.FIREBASE_API_KEY || !env.EDITOR_EMAILS) {
    return "Upload authentication is not configured.";
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return "Login session is required.";
  }

  const idToken = authorization.slice("bearer ".length).trim();

  // Verify the Firebase ID token via the Identity Toolkit lookup endpoint.
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    return "Invalid login session.";
  }

  const payload = await response.json();
  const user = Array.isArray(payload.users) ? payload.users[0] : null;
  const email = String(user?.email || "").toLowerCase();
  const allowedEmails = String(env.EDITOR_EMAILS)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !allowedEmails.includes(email)) {
    return "This account is not allowed to upload assets.";
  }

  return "";
}

function jsonResponse(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function sanitizePathPart(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "default";
}

function getFileExtension(fileName, mimeType) {
  const matched = fileName.match(/\.[a-z0-9]{1,8}$/i);
  if (matched) return matched[0].toLowerCase();
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/gif") return ".gif";
  if (mimeType === "image/webp") return ".webp";
  return ".jpg";
}

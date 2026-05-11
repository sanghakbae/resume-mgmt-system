const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:5678",
  "http://localhost:5678",
  "https://resume.sanghak.kr",
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if (request.method === "POST" && url.pathname === "/api/assets/upload") {
      return uploadAsset(request, env);
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

async function validateUploadAccess(request, env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.EDITOR_EMAILS) {
    return "Upload authentication is not configured.";
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return "Login session is required.";
  }

  const response = await fetch(`${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization,
    },
  });

  if (!response.ok) {
    return "Invalid login session.";
  }

  const user = await response.json();
  const email = String(user.email || "").toLowerCase();
  const allowedEmails = String(env.EDITOR_EMAILS)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails.includes(email)) {
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

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const WORKER_URL = "https://resume-assets.totoriverce.workers.dev";
const SUPABASE_BUCKET_MARKER = "/storage/v1/object/public/resume-assets/";

const env = readEnv(".env");
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.");
}

const rows = await supabaseFetch("/rest/v1/resume_workspaces?select=owner_id,profile,experiences");
const urls = collectResumeAssetUrls(rows);
const uniqueUrls = [...new Set(urls)];

console.log(`Found ${uniqueUrls.length} resume-assets object(s).`);

const tmp = mkdtempSync(join(tmpdir(), "resume-r2-migrate-"));
const urlMap = new Map();

try {
  for (const sourceUrl of uniqueUrls) {
    const key = getObjectKey(sourceUrl);
    const targetUrl = `${WORKER_URL}/assets/${encodeURI(key).replace(/%2F/g, "/")}`;
    const outputPath = join(tmp, basename(key));
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error(`Failed to download ${sourceUrl}: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(outputPath, buffer);

    execFileSync(
      "npx",
      [
        "wrangler",
        "r2",
        "object",
        "put",
        `resume/${key}`,
        "--file",
        outputPath,
        "--content-type",
        contentType,
        "--cache-control",
        "public, max-age=31536000, immutable",
        "--remote",
        "--force",
      ],
      { stdio: "inherit" },
    );

    urlMap.set(sourceUrl, targetUrl);
    console.log(`Migrated ${sourceUrl} -> ${targetUrl}`);
  }

  for (const row of rows) {
    const nextProfile = replaceStrings(row.profile, urlMap);
    const nextExperiences = replaceStrings(row.experiences, urlMap);

    await supabaseFetch(`/rest/v1/resume_workspaces?owner_id=eq.${encodeURIComponent(row.owner_id)}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        profile: nextProfile,
        experiences: nextExperiences,
        updated_at: new Date().toISOString(),
      }),
    });

    console.log(`Updated workspace ${row.owner_id}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log("Migration complete.");

function readEnv(path) {
  const parsed = {};
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\n/)) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 0) continue;
    parsed[line.slice(0, index)] = line.slice(index + 1).replace(/^"|"$/g, "");
  }
  return parsed;
}

async function supabaseFetch(path, init = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function collectResumeAssetUrls(workspaces) {
  const urls = [];
  for (const workspace of workspaces) {
    if (workspace.profile?.photo?.includes(SUPABASE_BUCKET_MARKER)) {
      urls.push(workspace.profile.photo);
    }

    for (const item of workspace.experiences ?? []) {
      if (item.image?.includes(SUPABASE_BUCKET_MARKER)) {
        urls.push(item.image);
      }

      for (const image of item.images ?? []) {
        if (image.includes(SUPABASE_BUCKET_MARKER)) {
          urls.push(image);
        }
      }
    }
  }

  return urls;
}

function getObjectKey(url) {
  return decodeURIComponent(url.split(SUPABASE_BUCKET_MARKER)[1] || "").replace(/^\/+/, "");
}

function replaceStrings(value, replacements) {
  if (typeof value === "string") {
    return replacements.get(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceStrings(item, replacements));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceStrings(item, replacements)]));
  }

  return value;
}

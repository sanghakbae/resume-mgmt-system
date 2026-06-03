#!/usr/bin/env node
/**
 * One-time data migration: Supabase (PostgreSQL) -> Firebase (Firestore).
 *
 * Migrates three tables into Firestore collections, preserving JSON shapes:
 *   resume_workspaces      -> resume_workspaces/{ownerId}
 *   resume_visit_counters  -> resume_visit_counters/{ownerId}
 *   resume_visit_logs      -> resume_visit_logs/{autoId}  (original id kept in `legacyId`)
 *
 * Reads Supabase rows over the public REST API (anon key, public-read tables),
 * and writes to Firestore using the Admin SDK (service-account credentials).
 *
 * Required environment variables:
 *   SUPABASE_URL              e.g. https://xxxx.supabase.co
 *   SUPABASE_ANON_KEY         the anon/public API key
 *   FIREBASE_SERVICE_ACCOUNT  path to the downloaded service-account JSON key
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... FIREBASE_SERVICE_ACCOUNT=./svc.json \
 *     node scripts/migrate-supabase-to-firestore.mjs
 *
 * Safe to re-run: it overwrites documents by deterministic id and de-duplicates
 * visit logs by their original Supabase row id.
 */

import { readFile } from "node:fs/promises";
import admin from "firebase-admin";

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ACCOUNT_PATH) {
  console.error("Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, FIREBASE_SERVICE_ACCOUNT are all required.");
  process.exit(1);
}

const serviceAccount = JSON.parse(await readFile(SERVICE_ACCOUNT_PATH, "utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function fetchAll(table, select = "*") {
  const rows = [];
  const pageSize = 1000;
  let offset = 0;

  for (;;) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        range: `${offset}-${offset + pageSize - 1}`,
        "range-unit": "items",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to read ${table}: ${response.status} ${await response.text()}`);
    }

    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

// Firestore reserves document ids matching __.*__ (e.g. dummy connectivity-test rows).
function isReservedDocId(id) {
  return typeof id === "string" && /^__.*__$/.test(id);
}

async function commitInBatches(makeRef, items, toData, getId) {
  let batch = db.batch();
  let count = 0;
  let total = 0;
  let skipped = 0;

  for (const item of items) {
    if (getId && isReservedDocId(getId(item))) {
      skipped += 1;
      continue;
    }
    batch.set(makeRef(item), toData(item), { merge: true });
    count += 1;
    total += 1;
    if (count === 450) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) await batch.commit();
  if (skipped > 0) console.log(`  (skipped ${skipped} row(s) with reserved/invalid ids)`);
  return total;
}

async function migrateWorkspaces() {
  const rows = await fetchAll("resume_workspaces");
  const total = await commitInBatches(
    (row) => db.collection("resume_workspaces").doc(row.owner_id),
    rows,
    (row) => ({
      ownerId: row.owner_id,
      editorEmail: row.editor_email ?? null,
      profile: row.profile ?? {},
      companies: row.companies ?? [],
      experiences: row.experiences ?? [],
      updatedAt: row.updated_at ?? new Date().toISOString(),
    }),
    (row) => row.owner_id,
  );
  console.log(`resume_workspaces: ${total} documents`);
}

async function migrateCounters() {
  const rows = await fetchAll("resume_visit_counters");
  const total = await commitInBatches(
    (row) => db.collection("resume_visit_counters").doc(row.owner_id),
    rows,
    (row) => ({
      count: Number(row.count ?? 0),
      updatedAt: row.updated_at ? admin.firestore.Timestamp.fromDate(new Date(row.updated_at)) : admin.firestore.Timestamp.now(),
    }),
    (row) => row.owner_id,
  );
  console.log(`resume_visit_counters: ${total} documents`);
}

async function migrateLogs() {
  const rows = await fetchAll("resume_visit_logs");
  // Use the original Supabase uuid as the Firestore doc id so re-runs are idempotent.
  const total = await commitInBatches(
    (row) => db.collection("resume_visit_logs").doc(row.id),
    rows,
    (row) => ({
      legacyId: row.id,
      ownerId: row.owner_id,
      mode: row.mode,
      ownerName: row.owner_name,
      userLabel: row.user_label,
      userEmail: row.user_email ?? null,
      visitedAt: row.visited_at
        ? admin.firestore.Timestamp.fromDate(new Date(row.visited_at))
        : admin.firestore.Timestamp.now(),
    }),
  );
  console.log(`resume_visit_logs: ${total} documents`);
}

console.log("Starting Supabase -> Firestore migration...");
await migrateWorkspaces();
await migrateCounters();
await migrateLogs();
console.log("Migration complete.");
process.exit(0);

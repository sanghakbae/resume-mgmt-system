import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit as limitQuery,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

const COUNTERS_COLLECTION = "resume_visit_counters";
const LOGS_COLLECTION = "resume_visit_logs";

export function shouldCountPublicVisit(isPublicResumeMode: boolean, isLoggedIn: boolean) {
  if (!isPublicResumeMode || isLoggedIn || typeof window === "undefined") return false;
  return !isLocalHost(window.location.hostname);
}

export async function getPublicVisitCount(ownerId: string) {
  if (!isFirebaseConfigured || !db) return null;

  const snapshot = await getDoc(doc(db, COUNTERS_COLLECTION, ownerId));
  if (!snapshot.exists()) return 0;

  const data = snapshot.data() as { count?: number };
  return data.count ?? 0;
}

export async function incrementPublicVisitCount(ownerId: string) {
  if (!isFirebaseConfigured || !db) return null;

  const counterRef = doc(db, COUNTERS_COLLECTION, ownerId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const current = snapshot.exists() ? Number((snapshot.data() as { count?: number }).count ?? 0) : 0;
    const nextCount = current + 1;
    transaction.set(counterRef, { count: nextCount, updatedAt: Timestamp.now() }, { merge: true });
    return nextCount;
  });
}

export async function recordPublicVisitLog(input: {
  ownerId: string;
  mode: string;
  ownerName: string;
  userLabel: string;
  userEmail?: string;
}) {
  if (!isFirebaseConfigured || !db) return null;

  const dbRef = db;
  const counterRef = doc(dbRef, COUNTERS_COLLECTION, input.ownerId);

  // Add the log entry first, then atomically bump the aggregate counter.
  await addDoc(collection(dbRef, LOGS_COLLECTION), {
    ownerId: input.ownerId,
    mode: input.mode,
    ownerName: input.ownerName,
    userLabel: input.userLabel,
    userEmail: input.userEmail?.trim() || null,
    visitedAt: Timestamp.now(),
  });

  return runTransaction(dbRef, async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const current = snapshot.exists() ? Number((snapshot.data() as { count?: number }).count ?? 0) : 0;
    const nextCount = current + 1;
    transaction.set(counterRef, { count: nextCount, updatedAt: Timestamp.now() }, { merge: true });
    return nextCount;
  });
}

export async function recordPublicDownloadLog(input: {
  ownerId: string;
  ownerName: string;
  userLabel: string;
  userEmail?: string;
}) {
  if (!isFirebaseConfigured || !db) return null;

  const docRef = await addDoc(collection(db, LOGS_COLLECTION), {
    ownerId: input.ownerId,
    mode: "PDF 다운로드",
    ownerName: input.ownerName,
    userLabel: input.userLabel,
    userEmail: input.userEmail?.trim() || null,
    visitedAt: Timestamp.now(),
  });

  return docRef.id;
}

type VisitLogDoc = {
  ownerId: string;
  visitedAt?: Timestamp;
  mode: string;
  ownerName: string;
  userLabel: string;
};

export async function fetchPublicVisitLogs(ownerId: string, limit = 50) {
  if (!isFirebaseConfigured || !db) return [];

  const logsQuery = query(
    collection(db, LOGS_COLLECTION),
    where("ownerId", "==", ownerId),
    orderBy("visitedAt", "desc"),
    limitQuery(limit),
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs.map((entry) => {
    const data = entry.data() as VisitLogDoc;
    return {
      id: entry.id,
      visitedAt: data.visitedAt ? data.visitedAt.toDate().toISOString() : new Date().toISOString(),
      mode: data.mode,
      ownerName: data.ownerName,
      userLabel: data.userLabel,
      userEmail: "",
    };
  });
}

function isLocalHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1" || normalized.endsWith(".local");
}

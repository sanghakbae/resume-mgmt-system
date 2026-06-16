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

type VisitorNetworkInfo = {
  ipAddress?: string;
  countryCode?: string;
  locationLabel?: string;
  referrer?: string;
};

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
  visitorInfo?: VisitorNetworkInfo;
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
    ipAddress: input.visitorInfo?.ipAddress || null,
    countryCode: input.visitorInfo?.countryCode || null,
    locationLabel: input.visitorInfo?.locationLabel || null,
    referrer: input.visitorInfo?.referrer || null,
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
  visitorInfo?: VisitorNetworkInfo;
}) {
  if (!isFirebaseConfigured || !db) return null;

  const docRef = await addDoc(collection(db, LOGS_COLLECTION), {
    ownerId: input.ownerId,
    mode: "PDF 다운로드",
    ownerName: input.ownerName,
    userLabel: input.userLabel,
    userEmail: input.userEmail?.trim() || null,
    ipAddress: input.visitorInfo?.ipAddress || null,
    countryCode: input.visitorInfo?.countryCode || null,
    locationLabel: input.visitorInfo?.locationLabel || null,
    referrer: input.visitorInfo?.referrer || null,
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
  userEmail?: string | null;
  ipAddress?: string | null;
  countryCode?: string | null;
  locationLabel?: string | null;
  referrer?: string | null;
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
      userEmail: data.userEmail ?? "",
      ipAddress: data.ipAddress ?? undefined,
      countryCode: data.countryCode ?? undefined,
      locationLabel: data.locationLabel ?? undefined,
      referrer: data.referrer ?? undefined,
    };
  });
}

export async function getVisitorNetworkInfo(): Promise<VisitorNetworkInfo> {
  const referrer = getReadableReferrer();

  if (typeof window === "undefined") {
    return { referrer };
  }

  const cloudflareInfo = await getCloudflareVisitorInfo(referrer);
  if (cloudflareInfo.ipAddress) return cloudflareInfo;

  const fallbackInfo = await getPublicIpFallbackInfo(referrer);
  if (fallbackInfo.ipAddress) return fallbackInfo;

  return { referrer };
}

async function getCloudflareVisitorInfo(referrer: string): Promise<VisitorNetworkInfo> {
  try {
    const response = await fetch("/cdn-cgi/trace", {
      cache: "no-store",
      credentials: "omit",
    });

    if (!response.ok) {
      return { referrer };
    }

    const trace = parseCloudflareTrace(await response.text());
    if (!trace.ip) {
      return { referrer };
    }

    const countryCode = trace.loc?.toUpperCase();

    return {
      ipAddress: trace.ip,
      countryCode,
      locationLabel: countryCode ? formatCountryLabel(countryCode) : undefined,
      referrer,
    };
  } catch {
    return { referrer };
  }
}

async function getPublicIpFallbackInfo(referrer: string): Promise<VisitorNetworkInfo> {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      cache: "no-store",
      credentials: "omit",
    });

    if (!response.ok) {
      return { referrer };
    }

    const data = await response.json();
    const ipAddress = typeof data.ip === "string" ? data.ip : "";
    if (!ipAddress) {
      return { referrer };
    }

    const countryCode = typeof data.country_code === "string" ? data.country_code.toUpperCase() : undefined;
    const countryName = typeof data.country_name === "string" ? data.country_name : countryCode ? formatCountryLabel(countryCode) : "";
    const region = typeof data.region === "string" ? data.region : "";
    const city = typeof data.city === "string" ? data.city : "";
    const locationLabel = [countryName, region, city].filter(Boolean).join(" / ") || countryCode;

    return {
      ipAddress,
      countryCode,
      locationLabel,
      referrer,
    };
  } catch {
    return { referrer };
  }
}

function parseCloudflareTrace(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex <= 0) return result;
      const key = line.slice(0, separatorIndex).trim();
      const entryValue = line.slice(separatorIndex + 1).trim();
      if (key && entryValue) result[key] = entryValue;
      return result;
    }, {});
}

function getReadableReferrer() {
  if (typeof document === "undefined") return "";

  const referrer = document.referrer.trim();
  if (!referrer) return "직접 접속";

  try {
    const parsed = new URL(referrer);
    return parsed.hostname.replace(/^www\./, "") || referrer;
  } catch {
    return referrer;
  }
}

function formatCountryLabel(countryCode: string) {
  if (countryCode === "XX" || countryCode === "T1") return countryCode;

  try {
    const displayNames = new Intl.DisplayNames(["ko"], { type: "region" });
    return displayNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function isLocalHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1" || normalized.endsWith(".local");
}

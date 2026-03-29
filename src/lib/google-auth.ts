import type { GoogleUser } from "@/types/resume";

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

function repairMojibake(value: string) {
  if (!/[Ã-ÿ]/.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return value;
  }
}

export function parseGoogleCredential(credential: string): GoogleUser {
  const payload = credential.split(".")[1];

  if (!payload) {
    throw new Error("Invalid Google credential");
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  const decodedBytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
  const decodedText = new TextDecoder("utf-8").decode(decodedBytes);
  const json = JSON.parse(decodedText) as JwtPayload;

  return {
    sub: json.sub,
    email: json.email,
    name: repairMojibake(json.name),
    picture: json.picture,
  };
}

export function normalizeGoogleUser(user: GoogleUser): GoogleUser {
  return {
    ...user,
    name: repairMojibake(user.name),
  };
}

//pre-written code
type JwtPayload = {
  exp?: number; // Unix timestamp in seconds
  sub?: string;
  role?: string;
};

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Convert Base64URL (- and _) to standard Base64 (+ and /)
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    const json =
      typeof window === "undefined"
        ? Buffer.from(padded, "base64").toString("utf-8")
        : atob(padded);

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(
  token: string | null | undefined,
  bufferSeconds = 15,
): boolean {
  if (!token) return true;

  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true; // Treat tokens without exp as expired/invalid

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds + bufferSeconds;
}

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function verifySystemAccess(request: NextRequest) {
  const apiKey = request.headers.get("x-system-key");
  if (!apiKey || apiKey !== process.env.SYSTEM_API_KEY) {
    throw new Error("Unauthorized");
  }
}
interface JwtPayload {
  id?: string;
  userId?: string;
  // add other claims if you expect them
}

export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "object" && decoded !== null) {
      const payload = decoded as JwtPayload;
      return payload.id ?? payload.userId ?? null;
    }

    return null;
  } catch {
    return null;
  }
}

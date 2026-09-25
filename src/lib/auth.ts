import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, Role } from "./types";
import { db } from "./db";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "ecosphere-super-secret-jwt-access-key-production-strength-32chars";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: Role;
}

export function signAccessToken(payload: JWTPayload): string {
  const options: SignOptions = { expiresIn: "15m" };
  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export interface AuthContext {
  user: User;
  tenantId: string;
}

export function authenticateRequest(req: Request): AuthContext | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);
  if (!payload) return null;

  const user = db.findUserById(payload.tenantId, payload.userId);
  if (!user) return null;

  return { user, tenantId: payload.tenantId };
}

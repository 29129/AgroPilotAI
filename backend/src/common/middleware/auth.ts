import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';

export interface AuthUser { id: string; role: 'PRODUCER' | 'TECHNICIAN' | 'ADMIN'; }
declare module 'express-serve-static-core' {
  interface Request { user?: AuthUser; }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const [scheme, token] = req.header('authorization')?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) return next(new AppError(401, 'UNAUTHORIZED', 'Debes iniciar sesión.'));
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    req.user = { id: String(payload.sub), role: payload.role } as AuthUser;
    next();
  } catch { next(new AppError(401, 'TOKEN_INVALID', 'La sesión expiró o no es válida.')); }
};

export const authorize = (...roles: AuthUser['role'][]): RequestHandler => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.'));
  next();
};

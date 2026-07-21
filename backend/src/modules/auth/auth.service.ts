import { createHash, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/app-error.js';

const publicUser = (user: { id: string; name: string; email: string; role: string; createdAt: Date; updatedAt: Date }) => user;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

async function issueTokens(user: { id: string; role: string }) {
  const accessToken = jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, { subject: user.id, expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'] });
  const nonce = randomUUID();
  const refreshToken = jwt.sign({ nonce }, env.JWT_REFRESH_SECRET, { subject: user.id, expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` });
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000) } });
  return { accessToken, refreshToken, expiresIn: env.ACCESS_TOKEN_TTL };
}

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash } });
    return { user: publicUser(user), tokens: await issueTokens(user) };
  },
  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
    return { user: publicUser(user), tokens: await issueTokens(user) };
  },
  async refresh(token: string) {
    let payload: jwt.JwtPayload;
    try { payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload; } catch { throw new AppError(401, 'REFRESH_TOKEN_INVALID', 'El token de renovación no es válido.'); }
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || stored.userId !== payload.sub) throw new AppError(401, 'REFRESH_TOKEN_INVALID', 'El token de renovación no es válido.');
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
    return issueTokens(user);
  },
  async logout(token: string) { await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } }); },
  async me(userId: string) { const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } }); return publicUser(user); },
};

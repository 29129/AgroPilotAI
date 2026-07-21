import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate } from '../../common/middleware/auth.js';
import { ok } from '../../common/http/response.js';
import { authService } from './auth.service.js';
import { loginSchema, registerSchema, tokenSchema } from './auth.schemas.js';

export const authRouter = Router();
authRouter.post('/register', validate(registerSchema), asyncHandler(async (req, res) => ok(res, await authService.register(req.body), 201)));
authRouter.post('/login', validate(loginSchema), asyncHandler(async (req, res) => ok(res, await authService.login(req.body))));
authRouter.post('/refresh', validate(tokenSchema), asyncHandler(async (req, res) => ok(res, await authService.refresh(req.body.refreshToken))));
authRouter.post('/logout', validate(tokenSchema), asyncHandler(async (req, res) => { await authService.logout(req.body.refreshToken); return ok(res, { loggedOut: true }); }));
authRouter.get('/me', authenticate, asyncHandler(async (req, res) => ok(res, await authService.me(req.user!.id))));

import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { ok } from '../../common/http/response.js';
import { conversationIdSchema, createSchema, messageSchema } from './conversation.schemas.js';
import { conversationService as service } from './conversation.service.js';

export const conversationRouter = Router();
conversationRouter.use(authenticate);
conversationRouter.post('/', asyncHandler(async (req, res) => ok(res, await service.create(req.user!, createSchema.parse(req.body)), 201)));
conversationRouter.get('/', asyncHandler(async (req, res) => ok(res, await service.list(req.user!))));
conversationRouter.get('/:conversationId', asyncHandler(async (req, res) => ok(res, await service.get(conversationIdSchema.parse(req.params).conversationId, req.user!))));
conversationRouter.post('/:conversationId/messages', asyncHandler(async (req, res) => ok(res, await service.message(conversationIdSchema.parse(req.params).conversationId, req.user!, messageSchema.parse(req.body).content), 201)));

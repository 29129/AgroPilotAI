import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { ok } from '../../common/http/response.js';
import { analysisSchema, cropIdSchema, marketSchema, planIdSchema, recommendationIdSchema } from './intelligence.schemas.js';
import { intelligenceService as service } from './intelligence.service.js';

export const intelligenceRouter = Router();
intelligenceRouter.get('/crops/:cropId/weather', authenticate, asyncHandler(async (req, res) => ok(res, await service.weather(cropIdSchema.parse(req.params).cropId, req.user!))));
intelligenceRouter.get('/market/prices', authenticate, asyncHandler(async (req, res) => { const input = marketSchema.parse(req.query); return ok(res, service.market(input.product, input.province)); }));
intelligenceRouter.post('/crops/:cropId/analysis', authenticate, asyncHandler(async (req, res) => ok(res, await service.analyze(cropIdSchema.parse(req.params).cropId, req.user!, analysisSchema.parse(req.body)), 201)));
intelligenceRouter.get('/crops/:cropId/recommendations', authenticate, asyncHandler(async (req, res) => ok(res, await service.listRecommendations(cropIdSchema.parse(req.params).cropId, req.user!))));
intelligenceRouter.get('/recommendations/:recommendationId', authenticate, asyncHandler(async (req, res) => ok(res, await service.recommendation(recommendationIdSchema.parse(req.params).recommendationId, req.user!))));
for (const status of ['APPROVED', 'REJECTED', 'COMPLETED'] as const) intelligenceRouter.post(`/recommendations/:recommendationId/${status.toLowerCase()}`, authenticate, asyncHandler(async (req, res) => ok(res, await service.transition(recommendationIdSchema.parse(req.params).recommendationId, req.user!, status))));
intelligenceRouter.post('/crops/:cropId/weekly-plans/generate', authenticate, asyncHandler(async (req, res) => ok(res, await service.generatePlan(cropIdSchema.parse(req.params).cropId, req.user!), 201)));
intelligenceRouter.get('/crops/:cropId/weekly-plans/current', authenticate, asyncHandler(async (req, res) => ok(res, await service.currentPlan(cropIdSchema.parse(req.params).cropId, req.user!))));
intelligenceRouter.get('/weekly-plans/:planId', authenticate, asyncHandler(async (req, res) => ok(res, await service.plan(planIdSchema.parse(req.params).planId, req.user!))));

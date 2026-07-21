import type { Prisma, RecommendationCategory } from '@prisma/client';
import { prisma } from '../../database/prisma.js';
import { AppError, notFound } from '../../common/errors/app-error.js';
import { ownedCrop } from '../agriculture/agriculture.service.js';
import { getOpenMeteoForecast } from '../../integrations/open-meteo.service.js';

type Actor = { id: string; role: 'PRODUCER' | 'TECHNICIAN' | 'ADMIN' };
type Agent = 'CLIMATE' | 'HEALTH' | 'IRRIGATION' | 'MARKET';
const categories: Record<Agent, RecommendationCategory> = { CLIMATE: 'CLIMATE', HEALTH: 'HEALTH', IRRIGATION: 'IRRIGATION', MARKET: 'MARKET' };
const action = (label: string, description: string) => ({ id: crypto.randomUUID(), label, description });

export const intelligenceService = {
  async weather(cropId: string, actor: Actor) {
    const crop = await ownedCrop(cropId, actor.id, actor.role);
    return { cropId, ...(await getOpenMeteoForecast(crop.plot.farm)) };
  },
  market(product: string, province: string) { return { product, province, currency: 'USD', unit: 'quintal', price: 145, observedAt: new Date().toISOString(), source: 'AgroPilot market adapter (demo)' }; },
  async analyze(cropId: string, actor: Actor, input: { analysisType: 'FULL' | 'QUICK'; include?: Agent[]; userContext?: { currentConcern?: string } }) {
    const crop = await ownedCrop(cropId, actor.id, actor.role);
    const selected = input.include ?? ['CLIMATE', 'HEALTH', 'IRRIGATION', 'MARKET'];
    const concern = input.userContext?.currentConcern;
    const definitions: Record<Agent, { title: string; summary: string; explanation: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; confidence: number; evidence: Prisma.InputJsonValue; action: { label: string; description: string } }> = {
      CLIMATE: { title: 'Vigilar déficit de precipitación', summary: 'El pronóstico indica lluvias limitadas durante los próximos días.', explanation: 'Inferencia basada en el pronóstico local; valida la humedad observada en campo.', priority: 'MEDIUM', confidence: 0.78, evidence: [{ type: 'WEATHER', label: 'Precipitación prevista', value: '2 mm', source: 'AgroPilot forecast adapter', observedAt: new Date().toISOString() }], action: { label: 'Revisar humedad del suelo', description: 'Medir humedad antes de programar riego.' } },
      HEALTH: { title: 'Inspeccionar sanidad del cultivo', summary: concern ?? 'Realiza una inspección visual de hojas y frutos.', explanation: 'La recomendación es preventiva y no reemplaza un diagnóstico técnico.', priority: 'MEDIUM', confidence: 0.7, evidence: [{ type: 'USER_INPUT', label: 'Contexto del productor', value: concern ?? 'Sin novedad reportada', observedAt: new Date().toISOString() }], action: { label: 'Inspección de campo', description: 'Revisar 10 plantas representativas y registrar hallazgos.' } },
      IRRIGATION: { title: 'Ajustar riego según humedad', summary: 'Evita riegos automáticos hasta confirmar la humedad del suelo.', explanation: 'Inferencia preventiva que combina pronóstico y necesidad de medición en parcela.', priority: 'HIGH', confidence: 0.81, evidence: [{ type: 'SOIL', label: 'Humedad de suelo', value: 'Pendiente de medición', observedAt: new Date().toISOString() }], action: { label: 'Medir humedad', description: 'Tomar una lectura de humedad antes del próximo riego.' } },
      MARKET: { title: 'Revisar precio de referencia', summary: `El precio demo de ${crop.cropType} requiere confirmación antes de negociar.`, explanation: 'Dato de mercado de referencia; contrástalo con compradores y mercado local.', priority: 'LOW', confidence: 0.62, evidence: [{ type: 'MARKET', label: 'Precio de referencia', value: 145, source: 'AgroPilot market adapter', observedAt: new Date().toISOString() }], action: { label: 'Confirmar cotizaciones', description: 'Solicitar cotizaciones a al menos dos compradores.' } },
    };
    const recommendations = await prisma.$transaction(selected.map((agent) => {
      const item = definitions[agent];
      return prisma.recommendation.create({ data: { cropId, category: categories[agent], title: item.title, summary: item.summary, priority: item.priority, confidence: item.confidence, explanation: item.explanation, evidence: item.evidence, actions: [action(item.action.label, item.action.description)], requiresApproval: true } });
    }));
    const agentResults = selected.map((agent) => ({ agent, status: 'COMPLETED', summary: definitions[agent].summary, confidence: definitions[agent].confidence }));
    const analysis = await prisma.analysis.create({ data: { cropId, analysisType: input.analysisType, status: 'COMPLETED', summary: `Análisis ${input.analysisType.toLowerCase()} generado para ${crop.cropType}.`, agentResults } });
    return { analysisId: analysis.id, status: analysis.status, summary: analysis.summary, recommendations, agentResults, generatedAt: analysis.generatedAt };
  },
  async listRecommendations(cropId: string, actor: Actor) { await ownedCrop(cropId, actor.id, actor.role); return prisma.recommendation.findMany({ where: { cropId }, orderBy: { createdAt: 'desc' } }); },
  async recommendation(id: string, actor: Actor) { const item = await prisma.recommendation.findUnique({ where: { id } }); if (!item) throw notFound('Recomendación'); await ownedCrop(item.cropId, actor.id, actor.role); return item; },
  async transition(id: string, actor: Actor, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') { const item = await this.recommendation(id, actor); if (status === 'COMPLETED' && item.status !== 'APPROVED') throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'Solo se pueden completar recomendaciones aprobadas.'); if (item.status !== 'PENDING' && status !== 'COMPLETED') throw new AppError(409, 'INVALID_STATUS_TRANSITION', 'La recomendación ya fue procesada.'); return prisma.recommendation.update({ where: { id }, data: { status } }); },
  async generatePlan(cropId: string, actor: Actor) { await ownedCrop(cropId, actor.id, actor.role); const recommendations = await prisma.recommendation.findMany({ where: { cropId, status: { in: ['PENDING', 'APPROVED'] } }, orderBy: { priority: 'desc' } }); const weekStart = new Date(); weekStart.setUTCHours(0, 0, 0, 0); const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekStart.getUTCDate() + 6); const tasks: Prisma.InputJsonValue = recommendations.map((recommendation, index) => ({ id: crypto.randomUUID(), title: recommendation.title, day: new Date(weekStart.getTime() + Math.min(index, 6) * 86_400_000).toISOString(), priority: recommendation.priority, reason: recommendation.summary, recommendationId: recommendation.id, status: 'PENDING' })); return prisma.weeklyPlan.create({ data: { cropId, weekStart, weekEnd, summary: `${tasks.length} tareas generadas a partir de recomendaciones pendientes o aprobadas.`, tasks } }); },
  async currentPlan(cropId: string, actor: Actor) { await ownedCrop(cropId, actor.id, actor.role); const plan = await prisma.weeklyPlan.findFirst({ where: { cropId, weekStart: { lte: new Date() }, weekEnd: { gte: new Date() } }, orderBy: { generatedAt: 'desc' } }); if (!plan) throw notFound('Plan semanal actual'); return plan; },
  async plan(id: string, actor: Actor) { const plan = await prisma.weeklyPlan.findUnique({ where: { id } }); if (!plan) throw notFound('Plan semanal'); await ownedCrop(plan.cropId, actor.id, actor.role); return plan; },
};

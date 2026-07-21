import type { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.js';
import { notFound } from '../../common/errors/app-error.js';
import { ownedCrop } from '../agriculture/agriculture.service.js';

type Actor = { id: string; role: 'PRODUCER' | 'TECHNICIAN' | 'ADMIN' };

function diagnose(symptoms?: string) {
  const normalized = symptoms?.toLowerCase() ?? '';
  if (/(amarill|clorosis|yellow)/.test(normalized)) {
    return { finding: 'Posible deficiencia nutricional o estrés hídrico', confidence: 0.67, explanation: 'Las hojas amarillas reportadas son compatibles con varios factores. La imagen debe ser revisada por un técnico antes de aplicar un tratamiento.', requiresTechnicalReview: true };
  }
  return { finding: 'Hallazgo visual pendiente de confirmación técnica', confidence: 0.45, explanation: 'El diagnóstico automatizado es preliminar. Contrasta el resultado con una inspección de campo antes de ejecutar acciones.', requiresTechnicalReview: true };
}

export const diagnosisService = {
  async create(cropId: string, actor: Actor, imageUrl: string, symptoms?: string) {
    await ownedCrop(cropId, actor.id, actor.role);
    const result = diagnose(symptoms);
    const evidence: Prisma.InputJsonValue = [
      { type: 'IMAGE', label: 'Imagen de cultivo', value: imageUrl, observedAt: new Date().toISOString() },
      ...(symptoms ? [{ type: 'USER_INPUT', label: 'Síntomas reportados', value: symptoms, observedAt: new Date().toISOString() }] : []),
    ];
    return prisma.diagnosis.create({ data: { cropId, imageUrl, symptoms, status: 'REVIEW_REQUIRED', evidence, ...result } });
  },
  async list(cropId: string, actor: Actor) {
    await ownedCrop(cropId, actor.id, actor.role);
    return prisma.diagnosis.findMany({ where: { cropId }, orderBy: { createdAt: 'desc' } });
  },
  async get(id: string, actor: Actor) {
    const diagnosis = await prisma.diagnosis.findUnique({ where: { id } });
    if (!diagnosis) throw notFound('Diagnóstico');
    await ownedCrop(diagnosis.cropId, actor.id, actor.role);
    return diagnosis;
  },
};

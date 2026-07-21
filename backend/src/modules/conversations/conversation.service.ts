import type { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.js';
import { forbidden, notFound } from '../../common/errors/app-error.js';
import { ownedCrop } from '../agriculture/agriculture.service.js';

type Actor = { id: string; role: 'PRODUCER' | 'TECHNICIAN' | 'ADMIN' };
async function ownedConversation(id: string, actor: Actor) { const conversation = await prisma.conversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: 'asc' } } } }); if (!conversation) throw notFound('Conversación'); if (conversation.userId !== actor.id && actor.role === 'PRODUCER') throw forbidden(); return conversation; }

export const conversationService = {
  async create(actor: Actor, input: { title: string; cropId?: string }) { if (input.cropId) await ownedCrop(input.cropId, actor.id, actor.role); return prisma.conversation.create({ data: { userId: actor.id, ...input, messages: { create: { role: 'SYSTEM', content: 'Conversación iniciada. Las recomendaciones requieren aprobación humana.' } } }, include: { messages: true } }); },
  list(actor: Actor) { return prisma.conversation.findMany({ where: actor.role === 'PRODUCER' ? { userId: actor.id } : {}, include: { _count: { select: { messages: true } } }, orderBy: { updatedAt: 'desc' } }); },
  get: ownedConversation,
  async message(id: string, actor: Actor, content: string) {
    const conversation = await ownedConversation(id, actor);
    const userMessage = await prisma.message.create({ data: { conversationId: conversation.id, role: 'USER', content } });
    const response = 'He registrado tu consulta. Revisa las recomendaciones y evidencia disponibles; confirma cualquier acción agrícola antes de ejecutarla.';
    const structuredData: Prisma.InputJsonValue = { type: 'DECISION_SUPPORT', requiresApproval: true, cropId: conversation.cropId };
    const assistantMessage = await prisma.message.create({ data: { conversationId: conversation.id, role: 'ASSISTANT', content: response, structuredData } });
    return { userMessage, assistantMessage };
  },
};

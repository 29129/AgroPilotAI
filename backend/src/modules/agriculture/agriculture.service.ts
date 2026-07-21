import type { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.js';
import { forbidden, notFound } from '../../common/errors/app-error.js';

type Paging = { page: number; limit: number; sortBy?: string; sortOrder: 'asc' | 'desc' };
const dateFields = (data: Record<string, any>) => ({ ...data, ...(data.sowingDate && { sowingDate: new Date(data.sowingDate) }), ...(data.expectedHarvestDate && { expectedHarvestDate: new Date(data.expectedHarvestDate) }) });

async function ownedFarm(farmId: string, userId: string, role: string) {
  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) throw notFound('Finca');
  if (farm.ownerId !== userId && role !== 'ADMIN' && role !== 'TECHNICIAN') throw forbidden();
  return farm;
}
async function ownedPlot(plotId: string, userId: string, role: string) {
  const plot = await prisma.plot.findUnique({ where: { id: plotId }, include: { farm: true } });
  if (!plot) throw notFound('Parcela');
  if (plot.farm.ownerId !== userId && role !== 'ADMIN' && role !== 'TECHNICIAN') throw forbidden();
  return plot;
}
export async function ownedCrop(cropId: string, userId: string, role: string) {
  const crop = await prisma.crop.findUnique({ where: { id: cropId }, include: { plot: { include: { farm: true } } } });
  if (!crop) throw notFound('Cultivo');
  if (crop.plot.farm.ownerId !== userId && role !== 'ADMIN' && role !== 'TECHNICIAN') throw forbidden();
  return crop;
}

export const agricultureService = {
  async listFarms(userId: string, role: string, p: Paging) {
    const where = role === 'ADMIN' || role === 'TECHNICIAN' ? {} : { ownerId: userId };
    const allowed = ['name', 'province', 'createdAt', 'updatedAt']; const sortBy = allowed.includes(p.sortBy ?? '') ? p.sortBy! : 'createdAt';
    const [data, total] = await prisma.$transaction([prisma.farm.findMany({ where, skip: (p.page - 1) * p.limit, take: p.limit, orderBy: { [sortBy]: p.sortOrder }, include: { _count: { select: { plots: true } } } }), prisma.farm.count({ where })]);
    return { data, total };
  },
  createFarm(userId: string, data: Prisma.FarmUncheckedCreateInput) { return prisma.farm.create({ data: { ...data, ownerId: userId } }); },
  getFarm: ownedFarm,
  async updateFarm(id: string, userId: string, role: string, data: Prisma.FarmUpdateInput) { await ownedFarm(id, userId, role); return prisma.farm.update({ where: { id }, data }); },
  async deleteFarm(id: string, userId: string, role: string) { await ownedFarm(id, userId, role); await prisma.farm.delete({ where: { id } }); },
  async listPlots(farmId: string, userId: string, role: string) { await ownedFarm(farmId, userId, role); return prisma.plot.findMany({ where: { farmId }, orderBy: { createdAt: 'desc' } }); },
  async createPlot(farmId: string, userId: string, role: string, data: Prisma.PlotUncheckedCreateInput) { await ownedFarm(farmId, userId, role); return prisma.plot.create({ data: { ...data, farmId } }); },
  async updatePlot(id: string, userId: string, role: string, data: Prisma.PlotUpdateInput) { await ownedPlot(id, userId, role); return prisma.plot.update({ where: { id }, data }); },
  async deletePlot(id: string, userId: string, role: string) { await ownedPlot(id, userId, role); await prisma.plot.delete({ where: { id } }); },
  async listCrops(userId: string, role: string, p: Paging) {
    const where = role === 'ADMIN' || role === 'TECHNICIAN' ? {} : { plot: { farm: { ownerId: userId } } };
    const allowed = ['cropType', 'status', 'createdAt', 'updatedAt']; const sortBy = allowed.includes(p.sortBy ?? '') ? p.sortBy! : 'createdAt';
    const [data, total] = await prisma.$transaction([prisma.crop.findMany({ where, skip: (p.page - 1) * p.limit, take: p.limit, orderBy: { [sortBy]: p.sortOrder }, include: { plot: { select: { id: true, name: true, farmId: true } } } }), prisma.crop.count({ where })]);
    return { data, total };
  },
  async createCrop(userId: string, role: string, data: any) { await ownedPlot(data.plotId, userId, role); return prisma.crop.create({ data: dateFields(data) }); },
  getCrop: ownedCrop,
  async updateCrop(id: string, userId: string, role: string, data: any) { await ownedCrop(id, userId, role); return prisma.crop.update({ where: { id }, data: dateFields(data) }); },
  async deleteCrop(id: string, userId: string, role: string) { await ownedCrop(id, userId, role); return prisma.crop.update({ where: { id }, data: { status: 'CANCELLED' } }); },
};

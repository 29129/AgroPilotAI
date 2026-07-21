import { z } from 'zod';
import { isoDate, pagination, uuid } from '../../common/schemas.js';

const farmFields = { name: z.string().trim().min(2).max(120), province: z.string().trim().min(2).max(100), canton: z.string().trim().min(2).max(100), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), totalAreaHa: z.number().positive().optional() };
const plotFields = { name: z.string().trim().min(1).max(120), areaHa: z.number().positive().optional(), soilType: z.string().trim().max(100).optional(), irrigationType: z.string().trim().max(100).optional() };
const cropFields = { cropType: z.string().trim().min(2).max(100), variety: z.string().trim().max(100).optional(), sowingDate: isoDate.optional(), expectedHarvestDate: isoDate.optional(), growthStage: z.string().trim().max(100).optional(), status: z.enum(['ACTIVE', 'HARVESTED', 'CANCELLED']).optional() };

export const listSchema = z.object({ body: z.any().optional(), params: z.any(), query: pagination });
export const farmCreateSchema = z.object({ body: z.object(farmFields), params: z.any(), query: z.any() });
export const farmUpdateSchema = z.object({ body: z.object(farmFields).partial().refine((v) => Object.keys(v).length > 0), params: z.object({ farmId: uuid }), query: z.any() });
export const farmIdSchema = z.object({ body: z.any().optional(), params: z.object({ farmId: uuid }), query: z.any() });
export const plotCreateSchema = z.object({ body: z.object(plotFields), params: z.object({ farmId: uuid }), query: z.any() });
export const plotUpdateSchema = z.object({ body: z.object(plotFields).partial().refine((v) => Object.keys(v).length > 0), params: z.object({ plotId: uuid }), query: z.any() });
export const plotIdSchema = z.object({ body: z.any().optional(), params: z.object({ plotId: uuid }), query: z.any() });
export const cropCreateSchema = z.object({ body: z.object({ plotId: uuid, ...cropFields }), params: z.any(), query: z.any() });
export const cropUpdateSchema = z.object({ body: z.object(cropFields).partial().refine((v) => Object.keys(v).length > 0), params: z.object({ cropId: uuid }), query: z.any() });
export const cropIdSchema = z.object({ body: z.any().optional(), params: z.object({ cropId: uuid }), query: z.any() });

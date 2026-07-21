import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/app-error.js';
import { authenticate } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/async-handler.js';
import { ok } from '../../common/http/response.js';
import { cropIdSchema, diagnosisIdSchema, diagnosisInputSchema } from './diagnosis.schemas.js';
import { diagnosisService } from './diagnosis.service.js';
import { storeImage } from '../../integrations/storage.service.js';

const directory = resolve(process.cwd(), env.UPLOAD_DIR);
if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({ destination: directory, filename: (_req, file, callback) => callback(null, `${randomUUID()}${file.mimetype === 'image/png' ? '.png' : '.jpg'}`) }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

export const diagnosisRouter = Router();
diagnosisRouter.post('/crops/:cropId/diagnoses', authenticate, upload.single('image'), asyncHandler(async (req, res) => {
  const { cropId } = cropIdSchema.parse(req.params);
  const { symptoms } = diagnosisInputSchema.parse(req.body);
  if (!req.file) throw new AppError(400, 'IMAGE_REQUIRED', 'Debes adjuntar una imagen JPEG, PNG o WebP de hasta 5 MB.');
  const imageUrl = await storeImage(req.file);
  return ok(res, await diagnosisService.create(cropId, req.user!, imageUrl, symptoms), 201);
}));
diagnosisRouter.get('/crops/:cropId/diagnoses', authenticate, asyncHandler(async (req, res) => {
  const { cropId } = cropIdSchema.parse(req.params);
  return ok(res, await diagnosisService.list(cropId, req.user!));
}));
diagnosisRouter.get('/diagnoses/:diagnosisId', authenticate, asyncHandler(async (req, res) => {
  const { diagnosisId } = diagnosisIdSchema.parse(req.params);
  return ok(res, await diagnosisService.get(diagnosisId, req.user!));
}));

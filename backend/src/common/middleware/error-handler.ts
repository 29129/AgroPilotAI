import type { ErrorRequestHandler } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next;
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Ocurrió un error inesperado.';
  let details: unknown;
  if (error instanceof AppError) ({ statusCode: status, code, message, details } = error);
  else if (error instanceof ZodError) {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Los datos enviados no son válidos.';
    details = error.flatten();
  } else if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') { status = 409; code = 'CONFLICT'; message = 'El registro ya existe.'; }
    if (error.code === 'P2025') { status = 404; code = 'NOT_FOUND'; message = 'Recurso no encontrado.'; }
  } else if (error instanceof Error && error.name === 'MulterError') {
    status = 400; code = 'UPLOAD_ERROR'; message = 'No se pudo procesar la imagen.';
  }
  if (status === 500 && process.env.NODE_ENV !== 'test') console.error(`[${res.locals.requestId}]`, error);
  res.status(status).json({ success: false, error: { code, message, ...(details === undefined ? {} : { details }) }, meta: { requestId: res.locals.requestId } });
};

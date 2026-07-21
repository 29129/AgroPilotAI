import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
export const routeNotFound: RequestHandler = (_req, _res, next) => next(new AppError(404, 'ROUTE_NOT_FOUND', 'Ruta no encontrada.'));

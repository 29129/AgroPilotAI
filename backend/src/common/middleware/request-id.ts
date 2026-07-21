import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction) {
  res.locals.requestId = req.header('x-request-id') || randomUUID();
  res.setHeader('x-request-id', res.locals.requestId);
  next();
}

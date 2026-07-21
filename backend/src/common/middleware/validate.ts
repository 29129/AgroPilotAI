import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export const validate = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
  Object.assign(req, parsed);
  next();
};

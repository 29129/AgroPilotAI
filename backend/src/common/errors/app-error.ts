export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) { super(message); }
}

export const notFound = (resource = 'Recurso') => new AppError(404, 'NOT_FOUND', `${resource} no encontrado.`);
export const forbidden = () => new AppError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.');

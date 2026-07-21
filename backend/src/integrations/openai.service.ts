import { AppError } from '../common/errors/app-error.js';
export async function requestOpenAiAnalysis(input: unknown) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AppError(503, 'AI_NOT_CONFIGURED', 'La integración de IA aún no está configurada.');
  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', input: [{ role: 'system', content: 'Eres un asistente agrícola. Devuelve JSON breve, evidencia separada de inferencias y nunca autorices acciones.' }, { role: 'user', content: JSON.stringify(input) }], text: { format: { type: 'json_object' } } }), signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new AppError(502, 'AI_PROVIDER_UNAVAILABLE', 'No se pudo obtener análisis de IA.');
  const data = await response.json() as { output_text?: string };
  try { return JSON.parse(data.output_text || '{}'); } catch { throw new AppError(502, 'AI_PROVIDER_INVALID_RESPONSE', 'La IA devolvió una respuesta no válida.'); }
}

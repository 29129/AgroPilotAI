# AgroPilot AI — Frontend

Interfaz web de AgroPilot AI, una plataforma de apoyo para decisiones agrícolas
explicables y trazables.

## Requisitos

- Node.js `>=22.13.0`

## Inicio local

1. Copia `env.example` como `.env.local`.
2. Ajusta `NEXT_PUBLIC_API_URL` cuando el backend esté disponible.
3. Ejecuta `npm install` y luego `npm run dev`.

## Variables públicas

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_USE_MOCKS=true
```

No agregues secretos a variables `NEXT_PUBLIC_*`.

## Estructura inicial

- `app/`: rutas y layout de Next.js.
- `components/`: componentes visuales reutilizables.
- `services/`: única capa autorizada para HTTP.
- `types/`: contrato y tipos de dominio compartidos con el backend.
- `lib/`: configuración de runtime.

## Reglas de integración

- Los componentes no hacen `fetch` directamente.
- La URL de la API proviene de configuración, nunca del código de una pantalla.
- Los mocks y la API real deben respetar el mismo contrato.
- Los cambios de endpoint o de payload requieren actualizar primero
  `API_CONTRACT.md` con el equipo backend.

## Verificación

```bash
npm run lint
npm run build
npm test
```

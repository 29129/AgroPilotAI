# Decisiones técnicas

- **Express + TypeScript:** mantiene el backend pequeño y modular para iterar durante el buildathon.
- **PostgreSQL + Prisma:** UUID y migraciones versionadas ofrecen un contrato persistente y portable.
- **JWT con refresh token rotativo:** limita la vida del token de acceso y permite revocación de sesión.
- **Adaptadores deterministas para clima y mercado:** mantienen la API usable sin credenciales externas; se sustituyen mediante los adaptadores configurados por variables de entorno.
- **Diagnósticos y recomendaciones no ejecutan acciones:** toda recomendación conserva evidencia y exige aprobación humana antes de completarse.

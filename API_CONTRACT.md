# AgroPilot AI — API contract v1

Base URL: `http://localhost:4000/api/v1` (configurable from the frontend with `NEXT_PUBLIC_API_URL`). All identifiers are UUID v4, dates are ISO 8601 and property names use `camelCase`.

## Envelope

Successful responses use:

```json
{ "success": true, "data": {}, "meta": { "requestId": "uuid", "page": 1, "limit": 20, "total": 1 } }
```

`page`, `limit` and `total` are present only for paginated collections. Errors use:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Los datos enviados no son válidos.", "details": {} }, "meta": { "requestId": "uuid" } }
```

## Authentication

| Method | Path | Body / result |
| --- | --- | --- |
| POST | `/auth/register` | `{ name, email, password }` → `{ user, tokens }` |
| POST | `/auth/login` | `{ email, password }` → `{ user, tokens }` |
| POST | `/auth/refresh` | `{ refreshToken }` → `tokens` |
| POST | `/auth/logout` | `{ refreshToken }` → `{ loggedOut: true }` |
| GET | `/auth/me` | Authenticated user |

`tokens` is `{ accessToken, refreshToken, expiresIn }`. Authenticated endpoints require `Authorization: Bearer <accessToken>`.

## Resources

| Method | Path |
| --- | --- |
| GET, POST | `/farms` |
| GET, PATCH, DELETE | `/farms/:farmId` |
| GET, POST | `/farms/:farmId/plots` |
| PATCH, DELETE | `/plots/:plotId` |
| GET, POST | `/crops` |
| GET, PATCH, DELETE | `/crops/:cropId` |
| POST, GET | `/crops/:cropId/diagnoses` |
| GET | `/diagnoses/:diagnosisId` |
| POST | `/crops/:cropId/analysis` |
| GET | `/crops/:cropId/recommendations` |
| GET | `/recommendations/:recommendationId` |
| POST | `/recommendations/:recommendationId/approve`, `/reject`, `/complete` |
| POST | `/crops/:cropId/weekly-plans/generate` |
| GET | `/crops/:cropId/weekly-plans/current` |
| GET | `/weekly-plans/:planId` |
| GET | `/crops/:cropId/weather` |
| GET | `/market/prices?product=cacao&province=Manabi` |
| POST, GET | `/conversations` |
| GET | `/conversations/:conversationId` |
| POST | `/conversations/:conversationId/messages` |

List endpoints accept `page`, `limit` (maximum 100), `sortBy` and `sortOrder` (`asc` or `desc`).

## Domain objects

`Recommendation` is the shared frontend/backend shape:

```ts
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
type Evidence = { type: 'WEATHER' | 'IMAGE' | 'SOIL' | 'MARKET' | 'USER_INPUT'; label: string; value: string | number; source?: string; observedAt?: string };
type RecommendedAction = { id: string; label: string; description?: string; scheduledFor?: string };
type Recommendation = { id: string; cropId: string; category: 'CLIMATE' | 'HEALTH' | 'IRRIGATION' | 'NUTRITION' | 'MARKET'; title: string; summary: string; priority: Priority; confidence: number; explanation: string; evidence: Evidence[]; actions: RecommendedAction[]; requiresApproval: boolean; status: RecommendationStatus; createdAt: string };
```

The analysis request is `{ analysisType: 'FULL' | 'QUICK', include?: ('CLIMATE' | 'HEALTH' | 'IRRIGATION' | 'MARKET')[], userContext?: { currentConcern?: string } }`. Its result clearly separates observed evidence, agent inference, recommendations and approval-required actions.

## Compatibility rules

Any API change must update this document first. The backend must not expose database errors, private prompts, secrets, SQL or stack traces.

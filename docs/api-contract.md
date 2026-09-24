# Contrato de API

Prefijo global `/api/v1`. `GET /health` queda fuera del prefijo para los probes.

Las dos apps generan tipos con `yarn api:types` desde `openapi.json`. El CI falla si la copia commiteada difiere de la generada. Los services del front se escriben a mano y usan esos tipos.

## Audiencias

Mismo issuer, dos audiencias:

| Audiencia | Guard | Claims |
| --- | --- | --- |
| `pro` | `ProAuthGuard` | `sub`, `aud`, `org`, `mid`, `role`, `perms`, `tv` |
| `client` | `ClientAuthGuard` | `sub`, `aud`, `org`, `cid`, `tv` |

El access token dura 15 minutos. El refresh es opaco, va en cookie `httpOnly` `Secure` `SameSite=Lax` con `Path=/api/v1/auth`, y rota en cada uso. Si se reutiliza uno ya rotado, se revoca la familia. Dura 14 días en el backoffice y 60 en la PWA.

El tenant sale solo del claim `org`. Nunca de un header, del body ni de la ruta. En la PWA el `clientId` sale del token: cambiar un id en la URL no abre datos de otro cliente.

## Verbos

Las acciones son `POST /recurso/:id/{accion}`. Las actualizaciones son `PATCH`.

Excepción documentada: `PUT /me/workout-logs/:syncId` y `PUT /me/measurements/:syncId` son upserts idempotentes para la sincronización offline.

## Errores

Los handlers lanzan un error de dominio con código estable, status y parámetros. El filtro responde:

```json
{ "code": "SLOT_TAKEN", "message": "Ese horario ya está ocupado", "fields": [] }
```

`message` se mantiene para el manejo actual del front. `code` es el identificador estable de la PWA. Los textos salen de `messages/es.ts`.

Códigos previstos del MVP: `ALREADY_BOOKED`, `SESSION_FULL`, `NO_CREDITS`, `SLOT_TAKEN` (traducción de `23P01`), más los de validación y de autenticación.

Un recurso de otro tenant, o un cliente que el colaborador no puede ver, responde **404**, no 403.

## Tiempo, unidades e idempotencia

Las fechas de negocio se muestran en la zona horaria de la organización, en 24 horas, `DD/MM/YYYY HH:mm`. En la base, los instantes son `timestamptz`.

El usuario elige métrico o imperial. La base guarda todo en métrico.

Los links de invitación se bloquean con `FOR UPDATE` para no superar el máximo de usos. Las reservas toman la ocurrencia y después el bono, siempre en ese orden. El cupo y el saldo no negativo los respaldan constraints de la base.

`forgot-password` siempre responde 202.

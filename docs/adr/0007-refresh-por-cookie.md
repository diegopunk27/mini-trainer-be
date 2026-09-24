# ADR-0007: Refresh token en cookie

## Status

Accepted

## Context

El access token vive en memoria para que un XSS no lo lea de `localStorage`. El refresh tiene que sobrevivir un reload y no puede viajar en el cuerpo de cada request de la app.

## Decision

El refresh es opaco, se guarda como hash SHA-256 y rota en cada uso. Viaja en una cookie `httpOnly`, `Secure`, `SameSite=Lax`, con path `/api/v1/auth`. Por eso la API y las dos apps tienen que compartir el dominio registrable (`api.`, `pro.`, `app.`).

## Consequences

### Positive

- El script de la página no lee el refresh.
- Reusar un token ya rotado revoca la familia.

### Negative

- El despliegue queda atado a un dominio común. Está anotado como tema abierto hasta la fase 8.

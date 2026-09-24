# Mini-Trainer API

API NestJS del SaaS de coaching. Prefijo `/api/v1`. `GET /health` queda fuera del prefijo.

```bash
yarn install
docker compose -f docker-compose.dev.yml --profile postgres up -d
cp .env.example .env
yarn start:dev
```

Postgres 16, MinIO y Mailpit están en `docker-compose.dev.yml`. El tracker del proyecto es Notion (`mcp-servers/notion`).

# projet-photolDiay
# kayDiayBack

## Deploy Render + Neon

Ce backend est configure pour un deploy sur Render avec Neon PostgreSQL.

### Variables d'environnement

Copiez les cles de `backend/.env.example` dans Render:

- `DATABASE_URL`: URL Neon pooler pour l'application
- `DIRECT_URL`: URL Neon directe pour Prisma
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Render

Le fichier `render.yaml` deploye le service `backend/` avec:

- `buildCommand`: `npm install && npx prisma generate && npx prisma db push && npm run build`
- `startCommand`: `npm start`
- `healthCheckPath`: `/health`

### Prisma

Le schema Prisma utilise maintenant PostgreSQL avec:

- `url = env("DATABASE_URL")`
- `directUrl = env("DIRECT_URL")`

# Single-stage build: keeps the Prisma CLI and tsx (both devDependencies)
# available at runtime for `prisma migrate deploy` and the seed script,
# which matters more here than shaving image size for a small self-hosted
# deployment.
FROM node:22-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl postgresql-client ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Only now (after the build, which needs devDependencies like typescript)
# switch to production mode for the runtime `next start`.
ENV NODE_ENV=production
EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]

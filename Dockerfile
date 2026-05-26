# Frontend
FROM node:24.14.0-alpine AS frontend-builder
WORKDIR /frontend

COPY ./bookclub-front/ ./
RUN npm ci
RUN npm run build

# Backend
FROM node:24.14.0-alpine AS backend
WORKDIR /usr/src/app

COPY ./bookclub-backend ./
RUN npm ci
ENV DATABASE_URL="dummy:dummy@localhost/dummy"
RUN npx prisma generate --schema ./prisma/schema.prisma

COPY --from=frontend-builder /frontend/dist ./dist

EXPOSE 3003
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run dev"]
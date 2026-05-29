# Frontend
FROM node:24.14.0-alpine AS frontend-builder
WORKDIR /frontend

COPY ./bookclub-front/ ./
RUN npm ci
RUN npm run build

# Backend
FROM node:24.14.0-alpine AS backend-builder
WORKDIR /usr/src/app

COPY ./bookclub-backend ./
RUN npm ci
ENV DATABASE_URL="dummy:dummy@localhost/dummy"
RUN npx prisma generate --schema ./prisma/schema.prisma

# Runtime
FROM node:24.14.0-alpine
WORKDIR /usr/src/app

# Copy generated Prisma files and source files from backend-builder
COPY --from=backend-builder /usr/src/app/generated ./generated
COPY --from=backend-builder /usr/src/app/prisma ./prisma

# Copy backend
COPY ./bookclub-backend/index.ts ./
COPY ./bookclub-backend/db.ts ./
COPY ./bookclub-backend/prisma.config.ts ./
COPY ./bookclub-backend/controllers ./controllers
COPY ./bookclub-backend/package.json ./
COPY ./bookclub-backend/package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy frontend build output
COPY --from=frontend-builder /frontend/dist ./dist

EXPOSE 3003
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]
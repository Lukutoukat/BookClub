# Frontend
FROM node:24.14.0-alpine AS frontend-builder
WORKDIR /frontend

COPY ./bookclub-front/ ./
RUN npm install
RUN npm run build

# Backend
FROM node:24.14.0-alpine AS backend
WORKDIR /usr/src/app

COPY ./bookclub-backend ./
RUN npm install

COPY --from=frontend-builder /frontend/dist ./dist

EXPOSE 3003
CMD ["npm", "start"]
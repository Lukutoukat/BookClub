FROM node:24.14.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3003
CMD ["npm", "run", "dev"]
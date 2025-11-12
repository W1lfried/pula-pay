FROM node:lts-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

RUN npx prisma generate
RUN npx prisma migrate deploy

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
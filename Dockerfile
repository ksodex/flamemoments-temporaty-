FROM node:20 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS builder
WORKDIR /app
RUN npm run build

FROM node:20
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/build ./build
RUN npm install --omit=dev
EXPOSE 3000
ENTRYPOINT ["npm", "start:dev"]

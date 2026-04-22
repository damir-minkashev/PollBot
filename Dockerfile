# Stage 1: Build TypeScript
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /nest

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx tsc

# Stage 2: Production image
FROM docker.io/library/node:22-alpine

WORKDIR /nest

ENV NODE_OPTIONS="--dns-result-order=verbatim"

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /nest/dist ./dist

CMD ["npm", "run", "start"]

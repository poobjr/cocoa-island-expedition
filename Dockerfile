# Stage 1: Build Frontend & Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies
RUN npm run install:all

# Copy all source files
COPY . .

# Build both client and server
RUN npm run build

# Stage 2: Runtime Production Image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy root package.json and server package.json
COPY package.json ./
COPY server/package.json ./server/

# Install production dependencies for server
RUN cd server && npm install --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3001

CMD ["npm", "run", "start"]

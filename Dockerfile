# Use Node 18; no host node_modules are copied — install runs only in container
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy only dependency manifests (no node_modules) so this layer is cached
COPY package.json pnpm-lock.yaml ./

# Install dependencies inside the image — avoids host node_modules / symlink errors
RUN pnpm install --frozen-lockfile

# Copy app code (server + public folder)
COPY server.js ./
COPY public ./public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]

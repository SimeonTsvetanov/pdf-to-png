# PDF -> PNG API — runs on any container host (Render, Koyeb, Fly.io, Railway).
FROM node:20-slim

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package*.json ./
RUN npm install --omit=dev=false --no-audit --no-fund

# Copy source.
COPY . .

# The host provides PORT; the server reads process.env.PORT (defaults to 8787).
ENV PORT=8787
EXPOSE 8787

CMD ["npm", "run", "start"]

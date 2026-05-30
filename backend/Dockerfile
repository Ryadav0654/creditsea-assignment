FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 8080

CMD ["bun", "run", "src/index.ts"]

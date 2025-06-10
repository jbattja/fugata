FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/checkout/package*.json ./packages/checkout/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for checkout
COPY packages/checkout/src ./packages/checkout/src
COPY packages/checkout/tsconfig.json ./packages/checkout/
COPY packages/checkout/tailwind.config.js ./packages/checkout/
COPY packages/checkout/postcss.config.js ./packages/checkout/
COPY packages/checkout/next-env.d.ts ./packages/checkout/
COPY packages/checkout/.env ./packages/checkout/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for checkout
WORKDIR /app/packages/checkout

EXPOSE 8081

# The command will be overridden by docker-compose
CMD ["npm", "run", "dev"] 
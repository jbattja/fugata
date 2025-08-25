FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/token-vault/package*.json ./packages/token-vault/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for token vault
COPY packages/token-vault/src ./packages/token-vault/src
COPY packages/token-vault/tsconfig.json ./packages/token-vault/
COPY packages/token-vault/.env ./packages/token-vault/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for token vault
WORKDIR /app/packages/token-vault

# Build the service
RUN npm run build

# The source code will be mounted at runtime
CMD ["npm", "run", "start:dev"]

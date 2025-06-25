FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/api-gateway/package*.json ./packages/api-gateway/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for API Gateway
COPY packages/api-gateway/src ./packages/api-gateway/src
COPY packages/api-gateway/tsconfig.json ./packages/api-gateway/
COPY packages/api-gateway/.env ./packages/api-gateway/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for API Gateway
WORKDIR /app/packages/api-gateway

# Build the service
RUN npm run build

# The source code will be mounted at runtime
CMD ["npm", "run", "start:dev"] 
FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/payment-processor/package*.json ./packages/payment-processor/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for payment processor
COPY packages/payment-processor/src ./packages/payment-processor/src
COPY packages/payment-processor/tsconfig.json ./packages/payment-processor/
COPY packages/payment-processor/.env ./packages/payment-processor/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for payment processor
WORKDIR /app/packages/payment-processor

# Build the service
RUN npm run build

# The source code will be mounted at runtime
CMD ["npm", "run", "start:dev"] 
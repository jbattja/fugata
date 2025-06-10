FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/payment-data/package*.json ./packages/payment-data/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for payment data
COPY packages/payment-data/src ./packages/payment-data/src
COPY packages/payment-data/tsconfig.json ./packages/payment-data/
COPY packages/payment-data/.env ./packages/payment-data/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for payment data
WORKDIR /app/packages/payment-data

# Build the service
RUN npm run build

# The source code will be mounted at runtime
CMD ["npm", "run", "start:dev"] 
FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/settings-service/package*.json ./packages/settings-service/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for settings service
COPY packages/settings-service/src ./packages/settings-service/src
COPY packages/settings-service/tsconfig.json ./packages/settings-service/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for settings service
WORKDIR /app/packages/settings-service

# Build the service
RUN npm run build

# The source code will be mounted at runtime
CMD ["npm", "run", "start:dev"] 
FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/partner-communicator/package*.json ./packages/partner-communicator/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for partner communicator
COPY packages/partner-communicator/src ./packages/partner-communicator/src
COPY packages/partner-communicator/tsconfig.json ./packages/partner-communicator/
COPY packages/partner-communicator/.env ./packages/partner-communicator/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for partner communicator
WORKDIR /app/packages/partner-communicator

# Build the service
RUN npm run build

# The source code will be mounted at runtime
CMD ["npm", "run", "start:dev"] 
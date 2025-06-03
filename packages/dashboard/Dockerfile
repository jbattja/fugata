FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace files
COPY package*.json ./

# Copy package files for all workspaces
COPY packages/dashboard/package*.json ./packages/dashboard/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code for shared module
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code for dashboard
COPY packages/dashboard/src ./packages/dashboard/src
COPY packages/dashboard/tsconfig.json ./packages/dashboard/
COPY packages/dashboard/tailwind.config.js ./packages/dashboard/
COPY packages/dashboard/postcss.config.js ./packages/dashboard/
COPY packages/dashboard/next-env.d.ts ./packages/dashboard/

# Build shared module
WORKDIR /app/packages/shared
RUN npm run build

# Set working directory for dashboard
WORKDIR /app/packages/dashboard

EXPOSE 8080

# The command will be overridden by docker-compose
CMD ["npm", "run", "dev"] 
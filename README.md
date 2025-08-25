# Fugata Payment Gateway

A modern, scalable payment gateway solution built with a microservices architecture. This monorepo contains all the necessary components to run a complete payment processing system with PCI DSS compliance.

## 🏗️ Architecture

The system is built as a monorepo with the following microservices:

### Core Services
- **API Gateway**: Fastify-based gateway that handles authentication, routing, and proxying to internal services
- **Payment Processor**: Core payment processing service that orchestrates payment workflows and handles tokenization
- **Payment Data**: Service for storing and retrieving payment data and events
- **Settings Service**: Service for managing merchants, providers, and payment configurations
- **Token Vault**: PCI-compliant service for secure storage and tokenization of sensitive payment data
- **Partner Communicator**: Service for integrating with external payment partners (Stripe, Adyen, etc.)

### Frontend Applications
- **Dashboard**: Next.js-based admin interface for managing merchants, providers, and payment settings
- **Checkout**: Next.js-based checkout interface for payment processing

### Infrastructure
- **Shared**: Common types, utilities, client libraries, and validation functions used across services
- **Kafka**: Message broker for event-driven communication between services
- **Redis**: Caching and session management
- **PostgreSQL**: Primary database for all services

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/fugata.git
cd fugata
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy environment files for each service
cp packages/dashboard/.env.example packages/dashboard/.env
cp packages/checkout/.env.example packages/checkout/.env
cp packages/settings-service/.env.example packages/settings-service/.env
cp packages/payment-processor/.env.example packages/payment-processor/.env
cp packages/payment-data/.env.example packages/payment-data/.env
cp packages/token-vault/.env.example packages/token-vault/.env
cp packages/partner-communicator/.env.example packages/partner-communicator/.env
cp packages/api-gateway/.env.example packages/api-gateway/.env
```

4. Start the development environment:
```bash
docker-compose up -d
```

### Development

To run the services locally:

```bash
# Start all services
docker-compose up -d

# View logs for specific service
docker-compose logs -f api-gateway
docker-compose logs -f payment-processor
docker-compose logs -f token-vault

# Access services
# Dashboard: http://localhost:8080
# Checkout: http://localhost:8081
# API Gateway: http://localhost:4000
# Kafka UI: http://localhost:8082
```

## 📦 Package Structure

```
packages/
├── api-gateway/           # API Gateway service (Fastify)
├── checkout/              # Checkout interface (Next.js)
├── dashboard/             # Admin dashboard (Next.js)
├── partner-communicator/  # External partner integration service
├── payment-data/          # Payment data and events service
├── payment-processor/     # Core payment processing service
├── settings-service/      # Settings and configuration service
├── shared/                # Shared types, utilities, and clients
└── token-vault/           # PCI-compliant tokenization service
```

## 🔧 Configuration

### Environment Variables

Key environment variables needed:

- `JWT_SECRET`: Secret for JWT token generation (must be same across services)
- `DATABASE_URL`: Database connection strings for each service
- `REDIS_URL`: Redis connection string
- `KAFKA_BROKERS`: Kafka broker addresses
- `TOKEN_VAULT_URL`: Token vault service URL
- `PARTNER_COMMUNICATOR_URL`: Partner communicator service URL

### Service URLs (Docker)

- API Gateway: `http://api-gateway:4000`
- Payment Processor: `http://payment-processor:3002`
- Payment Data: `http://payment-data:3001`
- Settings Service: `http://settings-service:3000`
- Token Vault: `http://token-vault:3006`
- Partner Communicator: `http://partner-communicator:3003`

## 🔐 Security & PCI Compliance

- **Token Vault**: Handles all sensitive payment data with AES-256-GCM encryption
- **Service Authentication**: JWT-based authentication between services
- **API Gateway**: Centralized authentication and authorization
- **Data Sanitization**: Automatic cleanup of sensitive data in logs and events

## 🔄 Payment Flow

1. **Checkout**: Customer enters payment details
2. **API Gateway**: Authenticates request and routes to Payment Processor
3. **Payment Processor**: 
   - Validates payment data
   - Tokenizes sensitive data via Token Vault
   - Orchestrates payment workflow
4. **Partner Communicator**: Communicates with external payment partners
5. **Payment Data**: Stores payment events and data
6. **Token Vault**: Securely stores and manages payment tokens

## 🛠️ Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Run tests: `pnpm test`
4. Submit a pull request

## 🧪 Testing

```bash
# Run tests for all packages
pnpm test

# Run tests for specific package
pnpm test --filter @fugata/payment-processor
```

## 📚 API Documentation

- **API Gateway**: Swagger documentation available at `/swagger` when running
- **Dashboard**: Admin interface for managing the system
- **Checkout**: Customer-facing payment interface

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

*Built with ❤️ by the Fugata Team* 
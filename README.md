# Fugata Payment Gateway

A modern, scalable payment gateway solution built with a microservices architecture. This monorepo contains all the necessary components to run a complete payment processing system.

## 🏗️ Architecture

The system is built as a monorepo with the following main packages:

- **Dashboard**: Next.js-based admin interface for managing merchants, providers, and payment settings
- **Shared**: Common types, utilities, and client libraries used across services
- **Settings**: Service for managing merchant and provider configurations
- **Payment Processor**: Core payment processing API service
- **Payment Data**: Services for storing and retrieving payment data

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
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
docker-compose up -d
```

### Development

To run the services locally:

```bash
# Start all services
pnpm dev

# Start specific service
pnpm dev --filter @fugata/dashboard
pnpm dev --filter @fugata/settings
```

## 📦 Package Structure

```
packages/
├── dashboard/              # Admin dashboard (Next.js)
├── shared/                 # Shared types and utilities
├── settings/               # Settings service
└── payment-processor/      # Core payment processor service
└── payment-data/           # Payment data service
```

## 🔧 Configuration

### Environment Variables

Key environment variables needed:

- `NEXT_PUBLIC_API_URL`: Base URL for the API service
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT token generation

### Docker Configuration

The project includes Docker configurations for all services. See `docker-compose.yml` for details.

## 🛠️ Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Run tests: `pnpm test`
4. Submit a pull request

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
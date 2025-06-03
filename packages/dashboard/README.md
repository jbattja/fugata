# Fugata Dashboard

A modern, responsive dashboard for managing payment processing operations. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication and authorization
- Multi-merchant support
- Real-time payment monitoring
- Provider configuration and management
- Routing rules management
- User profile management

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Docker and Docker Compose (for running the full stack)

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with the following variables:
   ```
   NEXTAUTH_URL=http://localhost:8080
   NEXTAUTH_SECRET=your-secret-key-here
   SETTINGS_SERVICE_URL=http://localhost:3000
   PAYMENT_DATA_SERVICE_URL=http://localhost:3001
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The dashboard will be available at http://localhost:8080.

### Production

To build and run the dashboard in production:

1. Build the Docker image:
   ```bash
   docker build -t fugata-dashboard .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 fugata-dashboard
   ```

Or use Docker Compose to run the entire stack:
```bash
docker-compose up
```

## Project Structure

```
dashboard/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Next.js pages and API routes
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
├── styles/           # Global styles
└── package.json      # Project dependencies
```

## Authentication

The dashboard uses NextAuth.js for authentication. Users can:
- Sign in with username and password
- Reset their password
- Manage their profile

## API Integration

The dashboard integrates with:
- Settings Service: For user and merchant management
- Payment Data Service: For payment history and analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
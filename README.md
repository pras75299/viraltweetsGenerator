# Twitter Helper - AI-Powered Tweet Generator

A powerful application that helps you generate viral-worthy tweets using AI and data analysis. Built with Next.js 14, TypeScript, and OpenAI's capabilities.

## Features

- 🧠 AI-powered tweet generation based on collected data
- 🔄 Automatic data collection and updates every 24 hours

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Node.js, MongoDB
- **AI**: OpenAI API\
- **Styling**: TailwindCSS, Geist Font
- **Development**: Turborepo for monorepo management

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- OpenAI API key
- MongoDB database

### Installation

1. Clone the repository:

```sh
git clone https://github.com/pras75299/viraltweetsGenerator.git
cd viraltweetsGenerator
```

2. Install dependencies:

```sh
pnpm install
```

3. Set up environment variables:

```sh
cp .env.example .env
```

Edit `.env` with your configuration:

- OpenAI API key
- Database connection

### Development

To start the development server:

```sh
pnpm dev
```

This will start:

- Frontend application (Next.js)
- Backend services

### Production Build

To build for production:

```sh
pnpm build
```

## Project Structure

This Turborepo includes:

### Apps

- `frontend`: Next.js 14 application with TypeScript and TailwindCSS
- `backend`: Node.js backend services

### Packages

- `@repo/ui`: Shared React components
- `@repo/types`: Shared TypeScript types
- `@repo/config`: Shared configuration files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- OpenAI for their powerful API
- Next.js team for the amazing framework
- Turborepo for the monorepo management

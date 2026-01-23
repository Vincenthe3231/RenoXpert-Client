# Renoxpert Client

A modern monorepo built with Turborepo, featuring React applications with TypeScript, Tailwind CSS, and TanStack Router.

## 🏗️ Architecture

This monorepo includes the following packages and applications:

### Applications

- **`client-app`** - Main client application (port 3000)
- **`staff-portal`** - Staff portal application (port 3001)

### Packages

- **`@repo/ui`** - Shared UI component library with Radix UI and Tailwind CSS
- **`@repo/eslint-config`** - Shared ESLint configurations
- **`@repo/typescript-config`** - Shared TypeScript configurations

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8.15.6 or higher) - This project uses pnpm as the package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd renoxpert-client
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

## 🛠️ Development

### Start Development Servers

**Start all applications in development mode:**

```bash
pnpm dev
```

This will start:

- `client-app` on http://localhost:3000
- `staff-portal` on http://localhost:3001

**Start individual applications:**

```bash
# Start only client-app
pnpm --filter client-app dev

# Start only staff-portal
pnpm --filter staff-portal dev
```

### Available Scripts

**Root level scripts:**

```bash
pnpm dev          # Start all development servers
pnpm build        # Build all applications and packages
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
```

**Application-specific scripts:**

```bash
# For client-app
pnpm --filter client-app dev      # Start dev server on port 3000
pnpm --filter client-app build    # Build the application
pnpm --filter client-app serve    # Preview production build
pnpm --filter client-app test     # Run tests
pnpm --filter client-app lint     # Lint the application

# For staff-portal
pnpm --filter staff-portal dev    # Start dev server on port 3001
pnpm --filter staff-portal build  # Build the application
pnpm --filter staff-portal serve  # Preview production build
pnpm --filter staff-portal test   # Run tests
pnpm --filter staff-portal lint   # Lint the application
```

## 🏗️ Building

### Build All Applications

```bash
pnpm build
```

### Build Individual Applications

```bash
# Build client-app
pnpm --filter client-app build

# Build staff-portal
pnpm --filter staff-portal build

# Build UI package
pnpm --filter @repo/ui build
```

## 🧪 Testing

### Run All Tests

```bash
pnpm --filter client-app test
pnpm --filter staff-portal test
```

### Run Tests in Watch Mode

```bash
pnpm --filter client-app test --watch
pnpm --filter staff-portal test --watch
```

## 📦 Production Deployment

### Build for Production

```bash
pnpm build
```

### Preview Production Builds

```bash
# Preview client-app
pnpm --filter client-app serve

# Preview staff-portal
pnpm --filter staff-portal serve
```

## 🐳 Docker

### Build Images

```bash
# Build client-app image
docker build -t renoxpert/client-app -f apps/client-app/Dockerfile .

# Build staff-portal image
docker build -t renoxpert/staff-portal -f apps/staff-portal/Dockerfile .
```

### Run Containers

```bash
# Run client-app (serves on container port 80)
docker run --rm -p 3000:80 --env-file apps/client-app/.env renoxpert/client-app

# Run staff-portal (serves on container port 80)
docker run --rm -p 3001:80 --env-file apps/staff-portal/.env renoxpert/staff-portal
```

### Environment Variables

Both apps read `VITE_API_URL` at build time. To override without an `.env` file, pass `-e`:

```bash
docker run --rm -p 3000:80 -e VITE_API_URL=http://localhost:8000 renoxpert/client-app
```

Notes:
- Images are multi-stage builds: dependencies and build happen in Node; final images use `nginx` and only contain static assets.
- If you change dependencies, Docker will re-run `pnpm install` due to cached layers.

## 🎨 UI Components

The `@repo/ui` package provides a comprehensive set of UI components built with:

- **Radix UI** - Accessible, unstyled UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Class Variance Authority** - Component variant management

### Using UI Components

```tsx
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";

function MyComponent() {
  return (
    <Card>
      <Button variant="default">Click me</Button>
    </Card>
  );
}
```

## 🛠️ Tech Stack

### Core Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Turborepo** - Monorepo build system
- **pnpm** - Package manager

### UI & Styling

- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Next Themes** - Theme management

### Routing & State

- **TanStack Router** - Type-safe routing
- **TanStack Query** - Server state management
- **TanStack Form** - Form state management
- **Zod** - Schema validation

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Testing framework
- **Testing Library** - React testing utilities

## 📁 Project Structure

```
renoxpert-client/
├── apps/
│   ├── client-app/          # Main client application
│   └── staff-portal/        # Staff portal application
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # ESLint configurations
│   └── typescript-config/   # TypeScript configurations
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── turbo.json              # Turborepo configuration
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in the respective app directories as needed:

```bash
# apps/client-app/.env
VITE_API_URL=http://localhost:8000

# apps/staff-portal/.env
VITE_API_URL=http://localhost:8000
```

### IDE Setup

This project includes VS Code workspace configuration in `renoxpert-client.code-workspace` for optimal development experience.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

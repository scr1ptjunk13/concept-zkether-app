# zkETHer - Privacy-First Ethereum Mixer

## Overview

zkETHer is a privacy-focused Ethereum mixing application that enables anonymous ETH transactions using zero-knowledge proofs. The application provides unlinkable deposits and withdrawals through a Nothing Phone-inspired minimalist interface with dot-matrix animations representing cryptographic operations. Users can deposit ETH to generate commitments and later withdraw anonymously through zero-knowledge proofs, with privacy levels determined by the anonymity set size.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a React Single Page Application (SPA) using Vite as the build tool and development server. The architecture follows a component-based structure with:

- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Animations**: Framer Motion for smooth transitions and dot-matrix visualizations

The design system implements a Nothing Phone aesthetic with pure black backgrounds, white dot-matrix elements, and minimalist typography using JetBrains Mono and Inter fonts.

### Backend Architecture
The backend uses Express.js with TypeScript running on Node.js:

- **API Structure**: RESTful endpoints for deposits, withdrawals, privacy metrics, and activity tracking
- **Data Layer**: In-memory storage implementation with interfaces for easy migration to persistent storage
- **Schema Validation**: Zod schemas for request/response validation
- **Development Integration**: Vite middleware integration for seamless development experience

The server simulates cryptographic operations with realistic delays to demonstrate zero-knowledge proof generation and blockchain interactions.

### Data Storage Solutions
Currently implements an in-memory storage system (`MemStorage`) with interfaces designed for future database integration:

- **Schema Definition**: Drizzle ORM schemas for PostgreSQL compatibility
- **Data Models**: Deposits, withdrawals, and privacy metrics with proper TypeScript types
- **Migration Ready**: Drizzle configuration prepared for PostgreSQL deployment

### Privacy Architecture
The application implements a realistic privacy model:

- **Anonymity Sets**: Tracks the number of users to calculate unlinkability scores
- **Commitment Scheme**: Simulates cryptographic commitments for deposits
- **Zero-Knowledge Proofs**: Mock proof generation with realistic timing delays
- **Privacy Metrics**: Real-time calculation of privacy levels based on anonymity set size

### Mobile-First Design
The application is designed as a Progressive Web App (PWA) with:

- **Responsive Design**: Mobile-first approach optimized for smartphone usage
- **PWA Features**: Service worker for offline functionality and app-like experience
- **Native Feel**: Status bar simulation and mobile-optimized interactions

## External Dependencies

### Core Framework Dependencies
- **@vitejs/plugin-react**: React plugin for Vite build system
- **express**: Web application framework for Node.js backend
- **react**: Frontend UI library with hooks and modern patterns
- **typescript**: Type checking and enhanced developer experience

### UI and Styling Libraries
- **tailwindcss**: Utility-first CSS framework for rapid styling
- **@radix-ui/***: Unstyled, accessible UI components (accordion, dialog, dropdown, etc.)
- **framer-motion**: Animation library for smooth transitions and interactions
- **lucide-react**: Icon library for consistent iconography

### Database and Validation
- **drizzle-orm**: Type-safe ORM for database operations
- **@neondatabase/serverless**: PostgreSQL serverless driver for production deployment
- **drizzle-kit**: Database migration and schema management tools
- **zod**: Schema validation for runtime type checking
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching and synchronization
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Form validation resolvers for various schema libraries

### Development and Build Tools
- **vite**: Fast build tool and development server
- **esbuild**: JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for development
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment
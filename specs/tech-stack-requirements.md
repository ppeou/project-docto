# Tech Stack Requirements - Project Docto

## Platform: Google Firebase
- **Firebase Hosting**: PWA application hosting
- **Firebase Authentication**: User authentication (email/password)
- **Cloud Firestore**: NoSQL database for user data
- **Cloud Functions**: Serverless functions for email and SMS notifications

## Core Framework
- **React 18+**: UI framework with component-based architecture
- **JavaScript (ES6+)**: No TypeScript - plain JavaScript with modern ES6+ features
- **Vite**: Build tool and development server for fast development and optimized production builds

## Routing
- **React Router v6**: Client-side routing and navigation

## UI Components & Styling
- **Radix UI**: Headless, accessible UI primitives
- **shadcn/ui**: Pre-built components built on Radix UI + Tailwind CSS
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library

## State Management
- **React Query (TanStack Query v5)**: Server state management (Firestore data fetching, caching, synchronization)
- **Zustand**: Global UI state management (modals, filters, user preferences, etc.)
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for forms and data (used with React Hook Form via @hookform/resolvers)

## Firebase Integration
- **Firebase SDK v10+**: Authentication and Firestore integration
- **react-firebase-hooks**: React hooks for Firebase (optional convenience library)

## Utilities
- **class-variance-authority (CVA)**: For component variants
- **clsx**: Conditional class names
- **tailwind-merge**: Merge Tailwind classes without conflicts
- **date-fns**: Date formatting and manipulation
- **libphonenumber-js**: Phone number formatting and E.164 validation

## PWA Support
- **vite-plugin-pwa**: PWA plugin for Vite to generate service worker and manifest
- **Service Worker**: For offline support and caching

## Build & Development Tools
- **Vite**: Development server with HMR (Hot Module Replacement)
- **PostCSS**: CSS processing with Tailwind
- **Autoprefixer**: Automatic vendor prefixing


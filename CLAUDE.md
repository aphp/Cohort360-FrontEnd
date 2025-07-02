# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm start` - Start development server with Vite
- `npm run serve` - Preview production build locally

### Building & Testing  
- `npm run build` - Create production build
- `npm run type` - TypeScript type checking in watch mode
- `npm run lint` - Run ESLint on codebase
- `npm test` - Run tests with Vitest
- `npm run coverage` - Generate test coverage report
- `npm run ui` - Launch Vitest UI for interactive testing

### Storybook
- `npm run storybook` - Start Storybook component development environment
- `npm run build-storybook` - Build static Storybook

## Project Architecture

**Cohort360** is a React TypeScript healthcare application for medical data exploration and cohort building. It's the frontend for AP-HP Clinical Data Warehouse.

### Technology Stack
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit with Redux Persist
- **UI**: Material-UI v5 + Emotion styling
- **Data Fetching**: TanStack React Query + Axios
- **Testing**: Vitest + React Testing Library

### Key Directory Structure
```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Generic UI components (buttons, modals, etc.)
│   ├── CreationCohort/ # Cohort creation workflow components
│   ├── Dashboard/     # Data visualization components
│   ├── Patient/       # Patient-specific components
│   └── ExplorationBoard/ # Main data exploration interface
├── views/             # Page-level route components
├── services/          # API service layer
│   └── aphp/         # APHP-specific service implementations
├── state/            # Redux store slices
├── hooks/            # Custom React hooks
├── utils/            # Utility functions and helpers
├── types/            # TypeScript type definitions
└── config.tsx        # Application configuration
```

### Architectural Patterns
1. **Service Layer Architecture**: Clean separation between UI and API calls via `services/` directory
2. **Feature-Based Organization**: Components grouped by functionality (Patient, Dashboard, CreationCohort)
3. **Redux Slices**: State management organized by domain (patient, cohort, criteria, etc.)
4. **Custom Hooks**: Business logic encapsulation in `hooks/` directory
5. **Configuration-Driven Features**: `config.tsx` enables/disables features based on deployment

### Medical/Healthcare Context
- Integrates with FHIR APIs for healthcare data standards
- Handles medical terminologies (ICD-10, ATC, LOINC)
- Processes complex medical data (patient records, procedures, medications)
- Supports cohort creation for clinical research

### State Management
- Redux Toolkit with persistence for cross-tab synchronization
- WebSocket integration for real-time updates via `WebSocket/WebSocketProvider`
- Feature slices: `patient`, `cohort`, `cohortCreation`, `criteria`, `project`, `request`

### Service Layer
- Abstracted API layer in `services/aphp/` with pluggable backend implementations
- Service functions follow pattern: `servicePatients.ts`, `serviceCohorts.ts`, etc.
- API clients: `apiBackend.ts` (Django REST), `apiFhir.ts` (FHIR), `apiDatamodel.ts`

### Component Patterns
- UI components in `components/ui/` with consistent styling via `tss-react`
- Complex workflows broken into sub-components (e.g., `CreationCohort/DiagramView/`)
- Reusable form components with React Hook Form integration
- Chart components using D3.js for medical data visualization

### Development Notes
- Strong TypeScript typing throughout - check `types/` directory for domain models
- Material-UI theming in `theme.ts`
- Testing setup in `__tests__/` with domain-specific test data
- Storybook stories for component development
- French documentation in some service files
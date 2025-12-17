# PostgreSQL Data Generator - Project Structure

## 📁 Project Location
`c:\Users\HP\.gemini\antigravity\playground\ionic-juno`

## 📂 Key Files & Directories

### Root Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (root)
- `tsconfig.app.json` - TypeScript config for React app
- `tsconfig.node.json` - TypeScript config for Vite
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint linting rules
- `index.html` - HTML entry point
- `README.md` - Project documentation

### Backend (`server/`)
- `server/index.ts` - Express server with API routes
  - Database connection management
  - REST API endpoints (/api/connect, /api/tables, etc.)
  - CORS configuration
  - Request logging

### Frontend (`src/`)

#### Main Files
- `src/main.tsx` - React app entry point
- `src/App.tsx` - Main application component with routing
- `src/App.css` - Application styles
- `src/index.css` - Global styles with Tailwind directives
- `src/types.ts` - TypeScript type definitions

#### API Layer (`src/api/`)
- `src/api/adapter.ts` - REST API client
  - Fetch wrapper with error handling
  - All backend communication methods

#### Components (`src/components/`)
- `src/components/ConnectionForm.tsx` - Database connection UI
- `src/components/TableCreator.tsx` - Create new tables UI
- `src/components/DataGenerator.tsx` - Generate & insert data UI

#### Assets (`src/assets/`)
- `src/assets/react.svg` - React logo

### Public Assets (`public/`)
- `public/vite.svg` - Vite logo

### Generated Directories (not in source control)
- `node_modules/` - NPM dependencies
- `dist/` - Production build output (frontend)
- `dist-electron/` - Compiled Electron files (legacy, can be deleted)

## 🚀 How to Run
```bash
npm run dev
```
Starts both:
- Backend: http://localhost:3004
- Frontend: http://localhost:5173

## 📦 Total Source Files
- **Backend**: 1 file (server/index.ts)
- **Frontend**: 8 files (main app + 3 components + API adapter + types)
- **Config**: 8 files
- **Total**: ~17 source files (excluding node_modules)

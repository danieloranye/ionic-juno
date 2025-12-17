# PostgreSQL Data Generator - Quick Start

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running

## Running the Application

### Option 1: Single Command (Recommended)
```bash
cd c:\Users\HP\.gemini\antigravity\playground\ionic-juno
npm run dev
```

This starts both:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

### Option 2: Separate Terminals
If you prefer to see logs separately:

**Terminal 1 (Backend):**
```bash
cd c:\Users\HP\.gemini\antigravity\playground\ionic-juno
npm run server
```

**Terminal 2 (Frontend):**
```bash
cd c:\Users\HP\.gemini\antigravity\playground\ionic-juno
npx vite
```

## Access the Application
Open your browser to: **http://localhost:5173**

## Database Connection
Use these credentials (adjust as needed):
- Host: `localhost`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: `your_password`

## Troubleshooting
- **"Cannot connect to server"** → Make sure `npm run dev` is running
- **CORS errors** → Backend server includes CORS middleware, should work fine
- **Database errors** → Check PostgreSQL is running and credentials are correct

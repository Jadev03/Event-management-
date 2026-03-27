
# Event Management (Full stack)

This repo contains:
- `frontend/`: React + Vite client
- `backend/`: Node.js + Express + MongoDB API

## Prerequisites
- **Node.js**: 20.19+ (recommended) or 22+
- **npm**: comes with Node
- **MongoDB**: required only for the backend (local or remote)

## Quickstart (demo mode, no backend)
Use this when you just want to run the UI with built-in demo accounts (no API calls).

```bash
cd frontend
npm install
npm run dev:demo
```

Open the URL shown in the terminal (usually `http://localhost:5173/`).

### Demo accounts
These are defined in `frontend/src/data/users.js`:

| role | email | password |
| --- | --- | --- |
| student | student1@university.ac.lk | student123 |
| facultyCoordinator | faculty1@university.ac.lk | faculty123 |
| organizer | organizer1@university.ac.lk | organizer123 |
| admin | admin1@university.ac.lk | admin123 |

## Run full stack (backend + frontend)

### 1) Backend setup
```bash
cd backend
npm install
```

#### Backend environment variables
Create `backend/.env` (or update it) with at least:
- `MONGODB_URI` (optional if using the default below)
- `JWT_SECRET` (recommended)
- `REFRESH_TOKEN_SECRET` (recommended)

Example:
```env
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_SECRET=your-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
```

#### Seed the database (first time)
```bash
cd backend

# Seeds users + other sample data
npm run seed:all
```

You can also run seeds individually:
```bash
cd backend
npm run seed:users
npm run seed:events
npm run seed:faculty
```

#### Start the backend
```bash
cd backend
npm run dev
```

Backend default URL: `http://localhost:5000`

### 2) Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Frontend dev URL (usually): `http://localhost:5173/`

## Common scripts
### Frontend (`frontend/`)
- `npm run dev`: run client (API-enabled)
- `npm run dev:demo`: run client in demo mode (no API calls)
- `npm run build`: production build
- `npm run preview`: preview the production build

### Backend (`backend/`)
- `npm run dev`: run API with nodemon
- `npm start`: run API (production)
- `npm run seed:all`: seed users + sample data

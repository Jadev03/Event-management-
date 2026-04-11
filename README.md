
## Frontend (React + Vite)

### Prerequisites
- **Node.js**: 20.19+ (recommended) or 22.12+

### Install & run
```bash
cd frontend
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173/`).

## Backend (Node.js + Express + MongoDB)

### Prerequisites
- **Node.js**: 20.19+ (recommended) or 22.12+
- **MongoDB**: running locally (default connection is `mongodb://localhost:27017/event_management`) or provide your own `MONGODB_URI`

### Install (first time)
```bash
cd backend
npm install
```

### Environment variables
Create `backend/.env` (or update it) with at least:
- `MONGODB_URI` (optional if using the default)
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

### Seed the database (first time)
Run these once when setting up a fresh database:

```bash
cd backend

# Seed users (student/facultyCoordinator/organizer/admin)
npm run seed:users

# Seed other data (optional)
npm run seed:events
npm run seed:faculty

# Or run everything:
npm run seed:all
```

### Update existing users (overwrite profile only)

If users are already in the database, a plain `npm run seed:users` skips them. To apply the seed file’s **name and email** on the **same** user documents (password, role, and links to events/registrations are unchanged), set `SEED_OVERWRITE_EXISTING_USERS` to `true`.

**Windows (PowerShell)** — example using this repo’s path (change `cd` if your clone lives elsewhere):

```powershell
cd c:\Users\THABENDRA\SLIIT\Event-management-\backend
$env:SEED_OVERWRITE_EXISTING_USERS="true"; npm run seed:users
```

From the repository root (any path):

```powershell
cd backend
$env:SEED_OVERWRITE_EXISTING_USERS="true"; npm run seed:users
```

### Default users (created by `npm run seed:users`)
Use these accounts to log in after seeding:

| role | name | email | password |
| --- | --- | --- | --- |
| student | Banuharan | banuharan01@gmail.com | student123 |
| facultyCoordinator | Jathushikan | jathu01@gmail.com | faculty123 |
| organizer | Banusan | banusan01@gmail.com | organizer123 |
| admin | Tharsi | tharshi01@gmail.com | admin123 |

### Run the backend
```bash
cd backend

# Development (nodemon)
npm run dev

# Production
npm start
```

Backend default URL: `http://localhost:5000`

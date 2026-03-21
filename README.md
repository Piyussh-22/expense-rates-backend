# Save Rupee — Backend API

APP :- https://save-rupeee.vercel.app

REST API server for Save Rupee, a personal finance tracker PWA. Built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Runtime** — Node.js with ES Modules
- **Framework** — Express v5
- **Database** — PostgreSQL via Neon (serverless)
- **Auth** — Google OAuth 2.0 via Passport.js + JWT (httpOnly cookie)
- **PDF Generation** — PDFKit
- **Security** — Helmet, CORS, express-rate-limit

## Features

- Google OAuth 2.0 authentication — no email/password
- JWT stored in httpOnly cookie (XSS protected)
- Full transaction CRUD with server-side validation
- Paginated transaction listing with filters
- All-time and monthly summary aggregations
- PDF export with date range
- Soft-delete with 30-day account recovery
- Rate limiting on auth routes
- Health check endpoint for uptime monitoring

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.config.js          # PostgreSQL pool (Neon)
│   │   ├── migrate.js            # Creates tables + indexes
│   │   └── passport.config.js    # Google OAuth strategy
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verify + soft-delete check
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── transaction.routes.js
│   │   ├── summary.routes.js
│   │   ├── user.routes.js
│   │   └── export.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── transaction.controller.js
│   │   ├── summary.controller.js
│   │   ├── user.controller.js
│   │   └── export.controller.js
│   ├── services/
│   │   └── export.service.js     # PDF generation logic
│   ├── utils/
│   │   └── categories.utils.js   # Category allowlist
│   └── app.js                    # Express entry point
├── .env.example
├── Procfile
└── package.json
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Redirect to Google OAuth |
| GET | `/auth/google/callback` | Handle OAuth callback |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Clear JWT cookie |
| POST | `/auth/recover` | Recover soft-deleted account |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Paginated list (supports `?page`, `?type`, `?from`, `?to`) |
| POST | `/api/transactions` | Create transaction |
| PATCH | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/summary` | All-time totals (supports `?from`, `?to`) |
| GET | `/api/summary/monthly` | Monthly breakdown (supports `?year`) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/users/me` | Update default currency (locked after set) |
| DELETE | `/api/users/me` | Soft-delete account |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export` | Download PDF (requires `?from` and `?to`) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| google_id | VARCHAR | Unique, from Google OAuth |
| email | VARCHAR | Unique |
| name | VARCHAR | |
| avatar_url | VARCHAR | |
| default_currency | VARCHAR(10) | Default: INR |
| currency_set | BOOLEAN | Locked after first set |
| is_deleted | BOOLEAN | Soft-delete flag |
| deleted_at | TIMESTAMPTZ | Set on soft-delete |
| created_at | TIMESTAMPTZ | |

### transactions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key → users |
| type | VARCHAR(10) | expense / earn / invest |
| category | VARCHAR(50) | Validated against allowlist |
| amount | NUMERIC(12,2) | Max 99,999,999.99 |
| note | VARCHAR(20) | Optional |
| date | TIMESTAMPTZ | Must be 2020-01-01 to today |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

## Validation Rules

- **Type** — must be `expense`, `earn`, or `invest`
- **Category** — validated against a fixed allowlist per type
- **Amount** — must be > 0 and ≤ 99,999,999.99
- **Note** — max 20 characters
- **Date** — must be between 2020-01-01 and today (no future dates)

## Getting Started

### Prerequisites
- Node.js v18+
- A [Neon](https://neon.tech) PostgreSQL database
- A Google Cloud project with OAuth 2.0 credentials

### Setup

```bash
# Clone the repo
git clone https://github.com/Piyussh-22/save-rupeee-backend.git
cd save-rupeee-backend

# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env

# Run database migrations
node src/config/migrate.js

# Start development server
npm run dev
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL=your_neon_connection_string

JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

## Deployment

This API is deployed on (https://save-rupeee-backend.onrender.com).

A cron job pings `/health` every 14 minutes to keep the free-tier instance active.

**Live API:** (https://save-rupeee.vercel.app)

## Security

- JWT stored in `httpOnly` cookie — protected from XSS
- CORS restricted to frontend URL only
- All `/api/*` routes scoped to `req.user.id` — users cannot access each other's data
- Category and amount validated server-side
- Rate limiting on `/auth` routes
- Soft-deleted users blocked on every request via auth middleware
- Helmet.js security headers enabled

## License

MIT

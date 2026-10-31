# Gestion Stock: Backend API

REST API (Laravel 13, Sanctum tokens) for the Gestion Stock front-end: articles and
stock, stock movements, production lots, clients, suppliers, sales and invoices.

## Requirements

- PHP 8.3+ with `mbstring`, `pdo_mysql` (and `pdo_sqlite` for the tests)
- Composer 2
- MySQL 8 / MariaDB 10.6+

## Local setup

```bash
composer setup             # install, copy .env.example to .env, key:generate, migrate
php artisan db:seed        # admin + demo data (demo data is never seeded in production)
php artisan serve          # http://localhost:8000
```

Default local admin (from `.env.example`): `admin@example.com` / `Admin1234`.

## Tests and code style

```bash
php artisan test           # Pest, in-memory SQLite
composer lint              # Pint, --test mode (vendor/bin/pint to fix)
composer audit             # known vulnerabilities in dependencies
```

CI (`.github/workflows/backend.yml`) runs all three on every push/PR touching `backend/`.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `FRONTEND_URL` | `http://localhost:5173` | SPA origin, default CORS origin |
| `CORS_ALLOWED_ORIGINS` | `FRONTEND_URL` | Comma-separated list of allowed origins |
| `SANCTUM_EXPIRATION` | `720` | API token lifetime in minutes |
| `TVA_RATE` | `0.20` | VAT added to the sale amount on the invoice |
| `ADMIN_EMAIL` / `ADMIN_ACCESS_CODE` | none | First admin created by `db:seed` (required in production) |

## Authentication

`POST /api/login` with `{ email, access_code }` returns `{ token }`. Send it as
`Authorization: Bearer <token>`. `POST /api/logout` revokes it.

- Access codes are hashed (never readable, never returned by the API), at least
  8 characters with letters and numbers.
- Inactive users can't log in and their existing tokens are refused (`403`).
- Login: 5 failed attempts per email+IP, then a lockout; 10 requests/min per IP.
  The rest of the API is limited to 120 requests/min per user.

## Roles

| Area | admin | ventes | stock |
|---|:-:|:-:|:-:|
| Users, suppliers, production lots, dashboard | ✓ | | |
| Clients, sales, invoices | ✓ | ✓ | |
| Stock, stock movements | ✓ | | ✓ |
| Articles | ✓ | ✓ | ✓ |

## Endpoints

All routes are under `/api`, return JSON, and lists are paginated
(`?page=`, `?per_page=` default 12, max 100).

| Method | URI | Notes |
|---|---|---|
| POST | `/login`, `/logout` | |
| GET | `/user` | Current user |
| CRUD | `/users`, `/suppliers`, `/clients`, `/articles` | `GET /users?status=active` |
| CRUD | `/production_lots` | A `COMPLETED` lot is read-only |
| POST | `/production_lots/{id}/complete` | Adds the lot quantity to stock |
| GET | `/stock` | |
| CRUD | `/movements` | Generated movements (sales, production) are read-only |
| CRUD | `/sales` | Only `En attente` sales can be updated; only `Annulee` can be deleted |
| POST | `/sales/{id}/validate` | Stock out + invoice |
| POST | `/sales/{id}/cancel` | |
| GET | `/factures`, `/factures/{id}` | |
| POST | `/factures/{id}/paid`, `/factures/{id}/unpaid` | |
| GET | `/dashboard` | |
| GET | `/up` (no prefix) | Health check |

Status codes: `401` not authenticated, `403` role not allowed or account inactive,
`404` not found, `409` action not allowed in the current state (e.g. validating a
validated sale, deleting a client that has sales), `422` validation error or
insufficient stock, `429` rate limited.

## Business rules

**Stock.** Every article has one stock row. Its quantity only changes through
stock movements (`in` / `out`). Creating, editing or deleting a movement updates
the stock in the same transaction, with the row locked. A movement that would make
the stock negative is refused (`422`). The status is recomputed on every change:
`Rupture` (≤ 0), `Faible` (≤ threshold), `Disponible`.

**Sales.** `En attente` → `Validee` or `Annulee`. Validating creates one `out`
movement per line and an invoice (`PENDING`, amount × (1 + `TVA_RATE`)). It is all or
nothing: if one article lacks stock, nothing changes. A sale can also be created
directly with `status: "Validee"`.

**Invoices.** `PENDING` → `PAID` or `UNPAID`; `UNPAID` → `PAID`.

**Deletes.** Records that are part of the history (users, clients and articles
with sales, stock movements or production lots) can't be deleted (`409`).
Deactivate users instead.

## Production deployment

1. Copy `.env.production.example` to `.env` and fill it: `APP_KEY`
   (`php artisan key:generate`), DB credentials for a **dedicated non-root user**,
   `APP_URL`, `FRONTEND_URL`, `ADMIN_EMAIL`, `ADMIN_ACCESS_CODE`.
   Keep `APP_DEBUG=false`.
2. Install and build:
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan migrate --force
   php artisan db:seed --force        # first deploy only: creates the admin
   php artisan config:cache && php artisan route:cache && php artisan event:cache
   ```
3. Point the web server document root at `public/`, serve over HTTPS only.
4. Make `storage/` and `bootstrap/cache/` writable by the PHP user.
5. Add the scheduler to cron (prunes expired tokens):
   `* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1`
6. Change the admin access code after the first login.

Upgrading an existing database: migration `2026_10_31_000001` converts the old
encrypted access codes to hashes, so users keep their current codes. It must run
with the **same `APP_KEY`** that encrypted them. Back up the database before running it.

See `PRODUCTION_AUDIT.md` for the issues found and fixed.

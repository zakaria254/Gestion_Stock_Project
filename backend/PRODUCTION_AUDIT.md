# Backend Production-Readiness Audit

Scope: `backend/` (Laravel 13 + Sanctum API used by the React front-end).
Date: 2026-10-31

Each issue has an ID, a severity and the branch that fixes it. The checkbox is
ticked when the fix is merged into `main`.

Severity:
- **CRITICAL**: security hole or data loss/corruption that is reachable today.
- **HIGH**: wrong business results (stock, sales, invoices) or a crash path.
- **MEDIUM**: missing production feature, bad practice with real risk.
- **LOW**: code hygiene, dead code, consistency.

---

## 1. Security

- [ ] **SEC-1 (CRITICAL) `GET /api/user` leaks the user's access code in clear text.**
  The route returns the raw `User` model. `access_code` is cast as `encrypted`,
  so serialization *decrypts* it, and it is not in `#[Hidden]`.
  → Hide `access_code`, return `UserResource`.

- [ ] **SEC-2 (CRITICAL) Access codes are stored reversibly and shown to admins.**
  `access_code` is `encrypted` (reversible with `APP_KEY`), `UserResource` returns
  it on every `/api/users` call. Credentials must be one-way hashed and never
  returned by the API.
  → Cast to `hashed`, compare with `Hash::check()`, data migration that re-hashes
  existing codes, drop it from `UserResource`.

- [ ] **SEC-3 (HIGH) Access-code uniqueness is not enforced.**
  `unique:users,access_code` compares the plaintext input against ciphertext, and
  encryption is non-deterministic, so neither the validator nor the DB unique
  index can ever detect a duplicate. (With hashing, uniqueness is no longer needed
  because login is email + code.)

- [ ] **SEC-4 (HIGH) Inactive users can log in.** `status = inactive` is never
  checked at login, nor on already-issued tokens. The front-end even expects a
  `403` for this case.

- [ ] **SEC-5 (HIGH) Weak access codes accepted.** Codes are exactly 6 chars with
  no complexity rule; combined with SEC-2 this is the only credential.
  → Minimum 8 chars, letters + numbers.

- [ ] **SEC-6 (MEDIUM) Non-constant-time credential comparison** (`!==` in
  `LoginRequest::authenticate`). Fixed by `Hash::check()` (SEC-2).

- [ ] **SEC-7 (MEDIUM) Sanctum tokens never expire** (`sanctum.expiration = null`)
  and old tokens are never pruned. → Configurable expiration + scheduled
  `sanctum:prune-expired`.

- [ ] **SEC-8 (MEDIUM) No rate limiting on the API.** Only the login request has
  a manual throttle. → `throttle:api` on all API routes + named login limiter.

- [ ] **SEC-9 (MEDIUM) State-changing actions use `GET`**
  (`/sales/validate/{id}`, `/sales/annuler/{id}`, `/factures/{id}/paid|unpaid`,
  `/production_lots/completed/{id}`). GET must be safe/idempotent: prefetchers,
  crawlers, link previews or a retried request can validate a sale and move stock.
  → `POST` endpoints (front-end updated accordingly).

- [ ] **SEC-10 (MEDIUM) Leftover Breeze session routes in `routes/web.php`/`auth.php`**:
  a second `/login` (session based, CSRF), `/register` pointing to an empty
  controller (500), password-reset and e-mail verification routes for a flow that
  doesn't exist (no `password` column, no `app.frontend_url` config). Pure attack
  surface. → Remove.

- [ ] **SEC-11 (MEDIUM) An admin can delete or deactivate themselves / the last
  admin**, locking everyone out. → Guard in `UserController`.

- [ ] **SEC-12 (MEDIUM) CORS origins are hard-coded to localhost** and `paths`
  is `*`. → Read allowed origins from env, restrict paths to `api/*`.

- [ ] **SEC-13 (LOW) The front-end logs the login payload (email + access code)
  to the console** (`front-end/src/services/auth.js`). → Remove the log.

## 2. Business logic / data correctness

- [ ] **BUG-1 (HIGH) Stock status (`Disponible`/`Faible`/`Rupture`) is never
  updated after a movement.** `StockService` uses `$stock->increment()` /
  `decrement()`, which do not fire the `saving` event that `StockObserver` uses
  to compute the status. Every stock stays at the status it was created with.

- [ ] **BUG-2 (HIGH) Race conditions on stock.** The stock is read, checked, then
  decremented without a row lock; two concurrent sales can both pass the
  "enough stock" check and drive the stock negative.
  → `lockForUpdate()` inside a transaction.

- [ ] **BUG-3 (HIGH) Insufficient stock returns a 500.** `StockService` throws
  `RuntimeException`, which is rendered as a server error (with the stack trace
  when `APP_DEBUG=true`). → Dedicated exception rendered as `422`.

- [ ] **BUG-4 (HIGH) Deleting a stock movement does not reverse its effect on
  the stock**, and generated movements (from sales / production) can be deleted
  through the API. → Reverse the quantity on delete; forbid deleting generated
  movements.

- [ ] **BUG-5 (HIGH) Updating a movement's `stock_id` is not handled** — the
  observer applies the delta to the *new* stock and never restores the old one.

- [ ] **BUG-6 (HIGH) Sale created directly as `Validee` gets no invoice.** The
  invoice is created in `SaleObserver::updated`, which never runs on create.
  Stock is decremented but no `Facture` exists.

- [ ] **BUG-7 (HIGH) `PUT /sales/{id}` can set `status = Validee`**, bypassing the
  validation workflow: the invoice is created by the observer but stock is
  **never** decremented. It can also set any free-text status
  (`status: nullable|string|max:30`).
  → Status is not editable through update; only the dedicated actions change it.

- [ ] **BUG-8 (HIGH) `POST /sales` without `status` crashes** (`Undefined array
  key "status"` because the field is `nullable`). → Use a default.

- [ ] **BUG-9 (HIGH) Removing an article from a sale on update has no effect.**
  `syncWithoutDetaching` never detaches lines, but `montant_total` is recomputed
  from the request → the stored total and the stored lines disagree.
  → `sync()`.

- [ ] **BUG-10 (HIGH) Duplicate article lines in a sale.** Sending the same
  article twice silently creates two pivot rows (create) or keeps the last one
  (update). → `distinct` validation rule.

- [ ] **BUG-11 (MEDIUM) Invoice number may collide.** `FAC-YYYYMMDD-<random 4
  digits>` on a unique column → random 500 errors as volume grows.
  → Derive the number from the invoice id.

- [ ] **BUG-12 (MEDIUM) VAT rate (20%) hard-coded** in `SaleObserver`.
  → `config('stock.tva_rate')`.

- [ ] **BUG-13 (MEDIUM) Sale validation not atomic with the invoice**: invoice is
  created in an observer and stock in an event listener; logic is spread across
  3 classes and partially outside the transaction for `annuler`.
  → Single `SaleService` with one transaction per action.

- [ ] **BUG-14 (MEDIUM) Status checks are not done under a lock**: two
  simultaneous "validate" calls on the same sale both see `En attente` and
  decrement stock twice. Same for completing a production lot (stock added twice).

- [ ] **BUG-15 (MEDIUM) A completed production lot can be deleted**, leaving the
  stock it generated in place with no trace of its origin.

- [ ] **BUG-16 (MEDIUM) `sales.date_vente` default is frozen at migration time**
  (`->default(date('Y-m-d H:i:s'))` is evaluated once when the migration runs).

- [ ] **BUG-17 (LOW) `SaleController::update` overwrites `user_id`** with the
  editor, losing who created the sale.

## 3. Data integrity (database)

- [ ] **DB-1 (CRITICAL) Cascading deletes destroy financial history.**
  `sales.user_id`, `sales.client_id`, `sale_article.article_id`,
  `stocks.article_id → stock_movements` are all `onDelete('cascade')`.
  Deleting a user deletes all their sales and invoices; deleting a client or an
  article does the same. → `restrict` FKs + `409 Conflict` from the API with a
  clear message.

- [ ] **DB-2 (MEDIUM) Broken `down()` migrations.** Several "update" migrations
  have a `down()` identical to `up()` (or that re-adds an existing column), so
  rollbacks fail or do nothing.

- [ ] **DB-3 (LOW) Typo `seuil_minimun` vs `seuil_minimum`** between `stocks` and
  `articles`. Kept as-is (renaming is a breaking API change for the front-end),
  documented here.

## 4. API quality / robustness

- [ ] **API-1 (MEDIUM) Errors are not guaranteed to be JSON.** Exceptions on
  `api/*` render HTML unless the client sends `Accept: application/json`.
  → `shouldRenderJsonWhen` for `api/*`.

- [ ] **API-2 (MEDIUM) Wrong status codes.** Business-rule refusals ("this sale
  can not be validated") return `403 Forbidden`; they are `409 Conflict`/`422`.
  `403` must mean "not allowed for your role".

- [ ] **API-3 (MEDIUM) Empty `show()` stubs** return `200` with an empty body on
  `GET /articles/{id}`, `/clients/{id}`, `/suppliers/{id}`, `/movements/{id}`,
  `/production_lots/{id}`. The front-end calls `GET /sales/{id}` and
  `GET /factures/{id}`, which don't exist (404). → Implement `show`.

- [ ] **API-4 (LOW) Typo `mesage` in a JSON error key** (`validate_sale`).

- [ ] **API-5 (LOW) `UserResource::nom` merges `prenom + nom`**, so the edit form
  receives the full name in the `nom` field and has no `prenom`.
  → Return `nom`, `prenom` and `full_name` separately.

- [ ] **API-6 (LOW) Unbounded / fixed pagination** (always 12, not overridable).
  → `per_page` query param capped at 100.

## 5. Performance

- [ ] **PERF-1 (MEDIUM) Dashboard stock value computed in PHP** by loading every
  stock row; 7 separate queries for the 7-day chart. → Single SQL aggregates.

- [ ] **PERF-2 (LOW) Missing indexes** on columns used for filtering/aggregation:
  `sales.status`, `sales.created_at`, `factures.status`, `users.status`.

## 6. Configuration & operations

- [ ] **OPS-1 (HIGH) `.env.example` is development-only** (`APP_DEBUG=true`,
  `LOG_LEVEL=debug`, `APP_NAME=Laravel`, DB user `root`). No production template
  or deployment documentation.

- [ ] **OPS-2 (MEDIUM) `app.frontend_url` is used but not defined** in
  `config/app.php` (reset-password links would be broken).

- [ ] **OPS-3 (MEDIUM) No CI.** Nothing runs tests or the code style checker.
  → GitHub Actions workflow (Pint + Pest).

- [ ] **OPS-4 (MEDIUM) `README.md` is the Laravel boilerplate.** No setup,
  roles, endpoints or deployment steps.

- [ ] **OPS-5 (LOW) Seeder creates an admin with a hard-coded weak code
  (`admin123`) and a personal e-mail.** → Read from env, refuse in production.

## 7. Tests

- [ ] **TEST-1 (HIGH) Zero tests for the actual application.** The only tests are
  Breeze leftovers that test a password/registration flow that doesn't exist;
  4 of 5 fail on `main`. → Delete them, add feature tests for auth, roles,
  stock movements, sales workflow, invoices.

- [ ] **TEST-2 (LOW) Factories don't match the schema**: `UserFactory` misses
  `status`, generates 6-char codes (below new rule), `StockFactory` etc. unused.

## 8. Code hygiene

- [ ] **HYG-1 (LOW) Dead code**: empty observer methods, empty
  `StockService::__construct`, `RegisteredUserController` fully commented out,
  commented-out blocks in `StockMovementObserver`, `DatabaseSeeder`,
  `AuthenticatedSessionController`, broadcast boilerplate in
  `SaleValidatedEvent` (`PrivateChannel('channel-name')`), unused imports.

- [ ] **HYG-2 (LOW) `new StockService` instantiated by hand** inside an observer,
  dynamic method call `$stock_service->$method(...)`. → Inject from the container.

- [ ] **HYG-3 (LOW) Magic strings for statuses** (`'Validee'`, `'En attente'`,
  `'COMPLETED'`, `'PENDING'` …) repeated across controllers, observers and
  queries. → Constants on the models.

- [ ] **HYG-4 (LOW) Inconsistent naming**: `lot_completed`, `validate_sale`,
  `annuler_sale`, `$movments`; mixed French/English. Kept French domain names,
  normalised method names to camelCase.

- [ ] **HYG-5 (LOW) Code style not enforced** (Pint installed but never run;
  trailing spaces, mixed indentation).

---

## Fix plan (one branch per step, merged into `main` with `--no-ff`)

| Step | Branch                         | Issues |
|------|--------------------------------|--------|
| 0    | `docs/production-audit`        | this file |
| 1    | `fix/auth-security`            | SEC-1…6, SEC-10, SEC-11, SEC-13, API-5 |
| 2    | `fix/stock-integrity`          | BUG-1…5, BUG-15, HYG-2 |
| 3    | `fix/sales-workflow`           | BUG-6…14, BUG-17, SEC-9, API-2, API-4, HYG-3 |
| 4    | `fix/database-integrity`       | DB-1, DB-2, BUG-16, PERF-2 |
| 5    | `chore/api-hardening`          | SEC-7, SEC-8, SEC-12, API-1, API-3, API-6, PERF-1, OPS-2 |
| 6    | `test/feature-suite`           | TEST-1, TEST-2 (tests are also added in each step) |
| 7    | `chore/ops-and-docs`           | OPS-1, OPS-3, OPS-4, OPS-5, HYG-1, HYG-4, HYG-5 |

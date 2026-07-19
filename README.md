# Expense Tracker

A local-first iOS and Android expense tracker built with Expo Router, Drizzle ORM over Expo SQLite, RevenueCat, and Gifted Charts. Financial records remain on-device; only store entitlement data is handled externally.

## Development

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm test
npm start
```

The database is created and seeded on first launch. Money is stored as integer minor units and every account/transaction carries an ISO currency code.

RevenueCat purchases require an Expo development build; Expo Go is suitable for most UI and database work but not real store testing. Configure the public platform SDK keys, the `premium` entitlement (or override its ID), and an offering containing monthly and annual packages. Development builds without RevenueCat keys show a development-only preview action on the paywall.

```bash
npx expo install expo-dev-client
npx eas build:configure
```

## Commands

- `npm run typecheck` — strict TypeScript verification
- `npm run lint` — Expo ESLint checks
- `npm test` — finance, UI primitive, and paywall-state tests
- `npm run db:generate` — generate Drizzle migration artifacts after schema changes

Budget notifications use the native `expo-notifications` module. JSON and CSV exports are available from Settings through the platform share sheet.

## Release checkpoint

See [CHECKPOINT.md](./CHECKPOINT.md) for verified checks, physical-device work, store setup, and the intentionally deferred RevenueCat phase. The configured native identifier is currently `com.pampapathi.expensetracker`; confirm it before creating store records because changing it later creates a different application identity.

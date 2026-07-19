# Expense Tracker — Production Readiness Checkpoint

Checkpoint date: 2026-07-19 (Asia/Kolkata)

## Current state

The local-first product workflow and release foundation are implemented. The codebase is ready for a signed development-build QA phase, but it is not ready for store submission until physical-device testing, legal/store setup, and the deferred RevenueCat integration are completed.

Current Git branch: `codex/production-readiness`.

## Verified in this checkpoint

- `npm run typecheck` — passing.
- `npm run lint` — passing.
- `npm test -- --runInBand` — 6 suites and 22 tests passing.
- `npx expo install --check` — dependencies compatible with Expo SDK 54.
- iOS Metro production export — passing.
- Android Metro production export — passing.
- Home and Add Expense visual regression checks passed on an iPhone 17 Pro simulator and Pixel 9a emulator.
- Tab route filenames are normalized to lowercase for Linux/EAS compatibility.
- `npm audit --omit=dev` — 19 moderate findings remain in the Expo SDK 54 transitive toolchain. The offered remediation requires a breaking Expo 57 upgrade and was intentionally not forced into this checkpoint.
- `npx expo-doctor` — could not complete because it hung without output in the restricted environment. Run it again in a normal networked terminal before producing signed builds.

## Implemented

### Financial data and workflows

- Typed Drizzle schema over persistent Expo SQLite.
- Generated, bundled, versioned migration with retryable bootstrap failure UI.
- Idempotent initial migration supports both fresh installs and databases created by the previous bootstrap SQL.
- WAL, foreign keys, positive-money constraints, ISO currency checks, and transaction boundaries.
- Integer minor-unit money storage; remaining balance is `income - expense`.
- Income and expense create/edit/delete with account, category, fixed/variable classification, notes, and past-date selection.
- Searchable transaction history with month, kind, classification, account, and category filters.
- Visible edit/delete actions with confirmation.
- Same-currency and cross-currency transfers with a manually supplied destination amount.
- Transfer activity affects account balances but is excluded from income/expense reports.
- Account create/edit/archive, computed balances, detail history, and transfer history.
- Custom category create/edit/archive while preserving historical records and protecting system categories.
- Account and currency filters for Home and Stats without combining incompatible currencies.
- Monthly budget usage, historical suggestion, 80%/100% event deduplication, and notification fallback.

### Product and native foundation

- Polished Home, Stats, Accounts, Settings, Budget, Income, Expense, History, Transfer, Category, and account-detail screens.
- Gifted Charts analytics with filter transitions and accessible empty states.
- Persisted system/light/dark theme and base-currency preferences.
- JSON and CSV export through the native share sheet.
- Local-data reset with confirmation and uninstall data-loss disclosure.
- Notification permission status and link to device settings.
- Opt-in biometric app lock with protected enable/disable, foreground re-authentication, device-credential fallback, and an opaque privacy screen.
- In-app Terms and Privacy content plus environment-driven external paywall links.
- RevenueCat service boundary and custom hard-paywall states; credentials/products remain deliberately unconfigured.
- `expo-dev-client` and EAS development, preview, and production profiles.
- Native-only platform configuration, portrait phone support, notification assets, identifiers, and version codes.
- Development-only isolated database self-check for migration idempotency, foreign keys, and rollback.
- Maestro core smoke-flow scaffold and documentation.

## External and device blockers

These require the owner’s accounts, signing credentials, published URLs, or physical devices:

1. Replace the temporary identifier with the final company-owned iOS bundle identifier and Android application ID after owner approval.
2. Create the App Store Connect and Google Play app records.
3. Run `npx expo-doctor` in a networked terminal.
4. Produce signed EAS development/preview builds and test on physical iOS and Android devices.
5. Verify database persistence across termination, restart, and an app upgrade.
6. Verify native date picker, biometric app lock, notification permission states, 80%/100% notifications, export, and share sheet.
7. Publish Privacy Policy, Terms, and support pages, then configure their real URLs.
8. Perform accessibility, small-device, Dynamic Type, keyboard, screen-reader, and performance QA.
9. Resolve the remaining Expo transitive audit findings during a planned SDK upgrade, rather than using `npm audit fix --force` during release hardening.

## RevenueCat — intentionally last

- Create monthly and annual products and trial configuration in both stores.
- Configure the `premium` entitlement and current offering in RevenueCat.
- Add platform public SDK keys through EAS environment variables.
- Test purchase, cancellation, retry, renewal, expiration, restore, billing issues, and cached offline entitlement.
- Verify localized pricing and subscription disclosures.
- Confirm the development preview bypass cannot appear in preview or production builds.

## Next work session

Start native QA rather than adding more UI:

1. Confirm the permanent application identifier.
2. Run the development-only database self-check in a development client.
3. Create signed iOS and Android development builds.
4. Execute the documented financial smoke flow on both devices.
5. Record device results and fix any P0/P1 defects before RevenueCat setup.

## Useful commands

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo install --check
npx expo-doctor
npx expo export --platform ios --output-dir .test-build/ios --clear
npx expo export --platform android --output-dir .test-build/android --clear
```

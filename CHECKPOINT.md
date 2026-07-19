# Expense Tracker — Production Readiness Checkpoint

Checkpoint date: 2026-07-19 (Asia/Kolkata)

## Current state

The app is a polished functional prototype, approximately **60% toward production readiness**. Core local data entry, reporting, budgets, accounts, navigation, and visual design are working. It is not ready for TestFlight/Play internal testing until the P0 items below are completed.

Current Git state:

- Branch: `codex/production-readiness`
- Base commit: `0c3b060`
- Implementation is currently uncommitted.
- Preserve existing changes; review and checkpoint them in Git before the next major feature.
- The editor swap artifact and unused hardcoded prototype components have been removed.

Verification at checkpoint:

- `npm run typecheck` — passing
- `npm run lint` — passing
- `npm test` — passing, 4 finance primitive tests
- iOS and Android Metro production exports — passing in the latest verification passes
- `npm audit` — not completed because the npm registry was unreachable

## Implemented

- Expo Router application shell with Home, Stats, Accounts, and Settings tabs.
- Local SQLite database with typed Drizzle schemas and repositories.
- Integer minor-unit money storage and ISO currency fields.
- Seeded accounts/categories and database bootstrap.
- Income and expense entry with category, account, classification, date display, and notes.
- Monthly budget creation, usage progress, suggestions, and threshold-event deduplication.
- Home aggregates and category summaries from persisted data.
- Gifted Charts analytics: expense mix, cash flow, top categories, and spending trend.
- Account creation and calculated account balances.
- Transaction history and deletion.
- JSON export.
- RevenueCat service boundary and custom paywall UI with development bypass.
- Expo Go-safe notification fallback and development-build notification path.
- Unified light/dark color system, polished cards/gradients, haptics, and reduced-motion support.
- Screen mount animations are disabled to prevent layout flashes; chart and direct-interaction animations remain.

## P0 — required before native beta

1. **Create a Git checkpoint**
   - Remove the confirmed swap artifact.
   - Review `git diff`, stage intentionally, and commit the current working prototype.
   - Prefer a `codex/production-readiness` or other feature branch before continuing.

2. **Harden database migrations**
   - Replace the single bootstrap SQL block with versioned, bundled Drizzle migrations.
   - Test fresh install and upgrade from at least one older schema.
   - Add migration failure recovery that never deletes user data.

3. **Complete essential transaction workflows**
   - Edit transactions.
   - Select an actual transaction date instead of always saving today.
   - Add search and filters to history.
   - Confirm delete updates budgets, reports, and threshold state correctly.
   - Add account transfers with atomic source/destination writes.

4. **Build and test native development clients**
   - Install/configure `expo-dev-client` and EAS profiles.
   - Validate iOS and Android physical-device builds.
   - Test SQLite persistence across upgrades, app termination, and device restart.
   - Test local notification permissions and 80%/100% delivery outside Expo Go.

5. **Increase automated coverage**
   - Repository integration tests against isolated SQLite.
   - Tests for month aggregation, mixed currencies, budget calculations, edit/delete, transfers, and rollback.
   - Component tests for transaction validation, empty states, and paywall states.
   - At least one automated or documented end-to-end smoke flow per platform.

6. **Resolve release configuration**
   - Final app name, slug, scheme, icons, splash assets, bundle identifier, Android package, version/build numbers.
   - EAS `development`, `preview`, and `production` build profiles.
   - Remove or explicitly exclude web if it is not supported.
   - Run `npx expo-doctor` and a reachable `npm audit`; review findings without force-upgrading blindly.

## P1 — required before store submission

- Configure RevenueCat projects, entitlement, monthly/annual products, trial, offerings, restore, and sandbox testers.
- Replace placeholder Terms and Privacy URLs with published documents.
- Verify the hard paywall against Apple and Google subscription disclosure requirements.
- Add subscription-management links for both iOS and Android.
- Remove the development paywall bypass from release builds and verify environment separation.
- Implement custom category create/edit/archive with safe historical references.
- Make theme and base-currency settings functional and persisted.
- Define mixed-currency UX; never combine currencies without an explicit conversion model.
- Add CSV export and verify share-sheet behavior on both platforms.
- Add database backup/restore or clearly disclose that uninstalling loses local records.
- Add user-facing error recovery for failed writes, migrations, exports, and notification permissions.
- Perform accessibility QA: screen reader, Dynamic Type/font scaling, touch targets, contrast, reduced motion, and keyboard navigation.
- Perform device-size QA, including small Android screens, iPhone SE-class screens, and tablets or disable tablet support.
- Profile chart and long-list performance with realistic data volumes.

## P2 — post-beta improvements

- Recurring transactions and fixed-expense automation.
- Account detail/history views and account archival/reassignment UX.
- Transaction editing animations and richer filtering.
- Optional biometric app lock and encrypted SQLite assessment.
- Import/restore workflow.
- Localization beyond INR/English.
- Crash reporting and privacy-conscious product analytics, if desired.

## Recommended next session

Start with **transaction correctness before more visual polish**:

1. Generate and integrate bundled, versioned Drizzle migrations.
2. Implement a reusable transaction form supporting create and edit.
3. Add a native date picker and persist the selected timestamp.
4. Add repository integration tests for create/edit/delete and monthly aggregates.
5. Verify Home, Budget, Stats, Accounts, and History refresh after every mutation.

Acceptance for that session:

- A transaction can be created for a past date, edited, and deleted.
- All affected month totals and charts update correctly.
- Data survives app relaunch.
- TypeScript, lint, unit tests, and a native Metro export pass.

## Useful commands

```bash
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
npx expo start --clear
git status --short
```

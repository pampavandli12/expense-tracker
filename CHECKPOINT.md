# Expense Tracker — Production Readiness Checkpoint

Checkpoint date: 2026-07-29 (Asia/Kolkata)

## Current state

The local-first product workflow, freemium access model, and release foundation are implemented. The app now opens directly into the free experience and presents contextual Premium paywalls only when users select guarded features. The codebase is ready for native QA, but it is not ready for store submission until the current working tree is reviewed and committed, physical-device testing is completed, and legal/store setup is finished.

Current Git branch: `codex/production-readiness`.

Current base commit: `81d332d` (`add iOS glass tab navigation`).

Important: the work described below is currently present as uncommitted working-tree changes. Preserve and review these changes before starting new feature work.

## Verified in this checkpoint

- `npm run typecheck` — passing.
- `npm run lint` — passing.
- `npm test -- --runInBand` — 10 suites and 33 tests passing.
- `npx expo install --check` — dependencies compatible with Expo SDK 54.
- iOS Metro production export — passing.
- Android Metro production export — passing.
- Native Android `app:assembleDebug` — passing with Android Studio's bundled Java runtime.
- Home, Add Expense, and the redesigned contextual paywall were visually checked on simulators/emulators.
- Paywall hero, feature rows, scrolling, error state, and lower purchase/legal section were verified on the Android emulator.
- Tab route filenames are normalized to lowercase for Linux/EAS compatibility.
- The unused legacy `react-native-bottom-sheet@1.0.3` dependency was removed because its obsolete Gradle `compile(...)` configuration prevented native Android builds.
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
- Freemium onboarding: new and returning free users enter the main application without a startup paywall.
- Centralized subscription access provider with safe foreground refresh, purchase/restore updates, and protection against temporary network failures incorrectly downgrading Premium users.
- Contextual, dismissible Premium paywall with feature-specific messaging, detailed benefits, selectable plans, renewal/downgrade disclosure, restore, and legal links.
- Free access includes unlimited income/expense tracking, existing-record access, data export, app lock, themes, base currency, and basic Home summaries.
- Premium guards cover more than two active accounts, custom category creation, advanced Stats, budgets, budget alerts, cross-currency transfers, and advanced transaction filters.
- Downgrade behavior preserves existing accounts, categories, budgets, transfers, transactions, and exports; subscription loss never deletes or hides owned financial records.
- Paywall visual design now matches the application: inset navy/emerald gradient hero, uniform rounded card shape, aligned full-width feature rows on phones, responsive wider layouts, and verified scrolling.
- RevenueCat service boundary remains implemented, but store credentials, products, offering, entitlement, and production keys remain deliberately unconfigured.
- `expo-dev-client` and EAS development, preview, and production profiles.
- Native-only platform configuration, portrait phone support, notification assets, identifiers, and version codes.
- Development-only isolated database self-check for migration idempotency, foreign keys, and rollback.
- Maestro core smoke-flow scaffold and documentation.

## External and device blockers

These require the owner’s accounts, signing credentials, published URLs, or physical devices:

1. Review and commit the current working-tree changes as a traceable release-candidate baseline.
2. Run `npx expo-doctor` and a fresh dependency audit in a normal networked terminal.
3. Produce signed EAS development/preview builds and test on physical Android and iOS devices.
4. Verify database persistence across termination, restart, and an app upgrade.
5. Verify native date picker, biometric app lock, notification permission states, 80%/100% notifications, export, and share sheet.
6. Publish Privacy Policy, Terms, and support pages, then configure their real URLs.
7. Perform accessibility, small-device, Dynamic Type, keyboard, screen-reader, and performance QA.
8. Resolve the remaining Expo transitive audit findings during a planned SDK upgrade, rather than using `npm audit fix --force` during release hardening.
9. Keep the permanent Android application ID and RevenueCat/store-product setup deferred until the preceding hardening work is complete.

## RevenueCat — intentionally last

- Create monthly and annual products and trial configuration in both stores.
- Configure the `premium` entitlement and current offering in RevenueCat.
- Add platform public SDK keys through EAS environment variables.
- Test purchase, cancellation, retry, renewal, expiration, restore, billing issues, and cached offline entitlement.
- Verify localized pricing and subscription disclosures.
- Confirm free users enter the app while every Premium action remains correctly guarded in preview and production builds.
- Finalize the permanent Android application ID immediately before creating the definitive Play/RevenueCat application records.

## Next work session

Start by stabilizing the current working tree, then continue native QA rather than adding more UI:

1. Review the complete diff, especially the freemium guards, paywall redesign, responsive content animations, and iOS tab navigation.
2. Re-run the full automated gate and commit the intended working-tree changes.
3. Run the development-only database self-check in the Android development client.
4. Execute the documented financial and freemium smoke flows on the Android emulator and a physical Android device.
5. Verify free access, every Premium entry point, dismiss/restore/error states, and downgrade-safe access to existing records.
6. Create a signed Android preview build without Metro and record the commit SHA, build ID, device, OS, date, and results.
7. Fix any P0/P1 defect before changing the permanent Android application ID or configuring RevenueCat.

## Useful commands

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo install --check
npx expo-doctor
npx expo export --platform ios --output-dir .test-build/ios --clear
npx expo export --platform android --output-dir .test-build/android --clear

# Native Android verification when JAVA_HOME is not already configured
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./android/gradlew -p android app:assembleDebug -x lint -x test
```

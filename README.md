# Expense Tracker

A privacy-first, local-only expense tracker for iOS and Android. Financial records are stored in SQLite on the device. The only planned external communication is with Apple/Google and RevenueCat for subscription entitlement and purchase processing.

> Release status: the app is in production-hardening and native-device QA. It is not ready for store submission yet. See [PROD.md](./PROD.md) for the release checklist and [CHECKPOINT.md](./CHECKPOINT.md) for the latest verified implementation checkpoint.

## What the app includes

- Freemium onboarding with contextual Premium prompts for advanced features.
- Monthly Home overview with income, expense, remaining balance, budget usage, and top categories.
- Income and expense creation, editing, deletion, notes, classification, account, category, and past-date selection.
- Searchable transaction history with month, kind, fixed/variable, account, and category filters.
- Cash, bank, card, and wallet accounts with calculated balances and archive support.
- Same-currency and cross-currency transfers with a manually entered destination amount.
- Monthly budgets, historical suggestions, and deduplicated 80%/100% alerts.
- Gifted Charts statistics for expense distribution, cash flow, ranked categories, and trends.
- Custom category management.
- Persisted system/light/dark appearance and base currency.
- Opt-in biometric app lock with Face ID/Touch ID on iOS, fingerprint/face authentication on Android, and device-passcode fallback.
- JSON and CSV export through the native share sheet.
- Local data reset and clear on-device data-loss disclosure.
- Custom RevenueCat purchase/restore UI, ready for final store configuration.

## Technology

- Expo SDK 54 and React Native 0.81.
- Expo Router with strict TypeScript.
- Drizzle ORM over `expo-sqlite` with generated, bundled migrations.
- NativeWind for styling and typed theme tokens.
- React Native Reanimated for direct-interaction and chart motion.
- React Native Gifted Charts.
- RevenueCat `react-native-purchases`.
- Expo Local Authentication, Notifications, File System, Sharing, Haptics, and Linear Gradient.
- Jest Expo and React Native Testing Library.
- Maestro smoke-flow scaffold.

## Financial and storage rules

- Money is stored as integer minor units, never floating point.
- Every account and transaction has an ISO 4217 currency code.
- The default currency is INR.
- Remaining balance is `income - expense`; the budget is a spending limit and does not contribute to balance.
- Incompatible currencies are never aggregated.
- Transfers affect account balances but are excluded from income/expense reporting.
- Archived accounts and categories retain their historical records.
- There is no user account/login, cloud sync, bank connection, receipt scanning, exchange-rate lookup, import, or cloud backup in v1.
- Uninstalling the application removes the local SQLite database. Export important data before uninstalling or clearing app storage.

## Repository structure

```text
app/                    Expo Router screens and route groups
components/             Shared UI and transaction/date form components
db/                     Drizzle client, schema, repositories, migration bundle
drizzle/                Generated SQL migrations and Drizzle metadata
lib/                    Finance utilities, ledger rules, and theme
services/               Notifications and RevenueCat boundaries
assets/                 App icons, splash assets, and onboarding animation
tests/                   Tests that must stay outside Expo Router's app directory
e2e/maestro/             Native smoke flow and execution notes
scripts/                 Migration bundling utilities
app.json                 Expo/native application configuration
eas.json                 EAS development, preview, production, and submit profiles
PROD.md                  Production-release checklist
CHECKPOINT.md            Current implementation and verification checkpoint
```

## Prerequisites

For normal JavaScript/Expo Go development:

- Node.js 20 LTS or another version supported by Expo SDK 54.
- npm.
- Expo Go on an Android/iOS device, or Android Studio/Xcode for a simulator.

For signed native builds and submission:

- An Expo account and EAS CLI access.
- A Google Play Developer account.
- An Apple Developer Program membership for iOS distribution.
- Final company-owned Android application ID and iOS bundle identifier.
- Store signing and submission credentials.

## Install the project

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run lint
npm test -- --runInBand
```

Do not commit `.env.local`, private signing files, Play service-account JSON, Apple `.p8`, certificates, provisioning profiles, or keystores.

## Environment variables

The repository provides [.env.example](./.env.example):

```dotenv
EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY=test_your_test_store_key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_your_public_sdk_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_your_public_sdk_key
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=expensetracker_pro
EXPO_PUBLIC_TERMS_URL=https://your-domain.example/terms
EXPO_PUBLIC_PRIVACY_URL=https://your-domain.example/privacy
```

RevenueCat public SDK keys are client-side identifiers, not private server credentials. Anything prefixed with `EXPO_PUBLIC_` is embedded in the application bundle and must be treated as publicly readable. Store credentials and private API keys must never use this prefix.

During development, set `EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY` to your RevenueCat Test Store key. The purchases service uses it automatically in `__DEV__` builds so you can exercise purchase, restore, and entitlement flows without App Store or Play Console products. Release and preview builds ignore the Test Store key and require the platform-specific `appl_` / `goog_` keys instead.

## Run with Expo Go

Expo Go is the default for routine UI, navigation, SQLite, and report development.

```bash
npm start
```

Scan the QR code with Expo Go, or use these shortcuts:

```bash
npm run android
npm run ios
```

To clear Metro's cache:

```bash
npm start -- --clear
```

If LAN discovery is blocked by the network, try:

```bash
npx expo start --go --tunnel
```

Expo Go limitations for this project:

- It cannot perform real App Store or Play Store purchases.
- Android native notification behavior cannot be fully tested in Expo Go.
- iOS Face ID cannot be tested in Expo Go; use a development build. Touch ID and Android biometric behavior may be exercised in Expo Go, but release acceptance still requires native builds.
- The native date picker works in Expo Go and development builds for transaction dates.
- Native-module behavior must be verified in a development build before release.

If the terminal says `No development build ... is installed`, Expo was started in development-client mode. Stop it and run `npm start` or `npx expo start --go --clear`.

## Development builds on actual devices

A development build is a custom native app containing this project's native modules. It connects to Metro like Expo Go, but it can test RevenueCat, native notifications, Face ID, and the native date picker.

### Important identifier checkpoint

The identifier currently present in `app.json` is temporary. Do not create store records, signing identities, production builds, or RevenueCat store apps until the owner replaces it with the final company-owned reverse-domain value, such as `com.company.product`.

Changing an identifier after store setup creates a different application identity. This repository must not choose or change that value automatically.

### Install and authenticate EAS CLI

Use EAS through `npx`:

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami
```

The project already contains `eas.json`. On first use, link/configure it with the intended Expo organization only after the final identifier is confirmed:

```bash
npx eas-cli@latest build:configure
```

Review every generated change before committing it.

### Android development APK

```bash
npx eas-cli@latest build --platform android --profile development
```

When the build completes, install the APK using the EAS build-page QR/install link, Expo Orbit, or ADB:

```bash
adb install path/to/development-build.apk
```

Then start Metro in development-client mode:

```bash
npm run android:dev-client
```

The Android development build is an APK and is directly installable. It is not the AAB used for Play Store production submission.

### iOS development build

Register physical test devices as prompted by EAS/ad hoc provisioning, then build:

```bash
npx eas-cli@latest build --platform ios --profile development
```

Install it from the EAS build page or Expo Orbit, then run:

```bash
npm run ios:dev-client
```

An iOS ad hoc build only installs on devices included in its provisioning profile. Adding a new device normally requires updating the provisioning profile and rebuilding.

### Start Metro without opening a platform automatically

```bash
npm run start:dev-client
```

If native dependencies, plugins, application identifiers, entitlements, or notification configuration change, create and install a new development build. Hot reload only updates JavaScript and bundled assets.

## Preview builds for testers

Preview builds use the `preview` profile, do not include developer tooling, and run without Metro.

```bash
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

The Android internal-distribution profile produces an installable APK. iOS internal distribution uses ad hoc provisioning and therefore requires registered device UDIDs. Share only the EAS internal-build link with authorized testers.

Before sharing a preview build, verify that free users can enter the app, Premium feature guards remain active, and the correct preview environment variables were used.

## Configure EAS environments

EAS provides `development`, `preview`, and `production` environments. Configure the variables in the Expo dashboard under Project settings → Environment variables, or with commands such as:

```bash
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value <ios-public-key> --visibility sensitive
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value <android-public-key> --visibility sensitive
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID --value expensetracker_pro --visibility plaintext
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_TERMS_URL --value <terms-url> --visibility plaintext
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_PRIVACY_URL --value <privacy-url> --visibility plaintext
```

Repeat or deliberately vary values for development and preview. Client-side `EXPO_PUBLIC_` values cannot be made secret by choosing EAS `secret` visibility because they are embedded in the client bundle.

To pull a readable EAS environment for local testing:

```bash
npx eas-cli@latest env:pull --environment development
```

Review the output filename and keep it out of Git.

## Database schema and migrations

The source schema is [db/schema.ts](./db/schema.ts). Drizzle migrations are stored under `drizzle/`, and Metro consumes a generated TypeScript bundle rather than importing raw SQL.

After changing the schema:

```bash
npm run db:generate
```

This performs two steps:

1. Drizzle Kit generates a new SQL migration and metadata.
2. `scripts/bundle-drizzle-migrations.mjs` regenerates `db/migrations.generated.ts` for Metro.

Migration rules:

- Never edit or delete a migration already shipped to users.
- Inspect generated SQL before committing it.
- Prefer additive migrations and explicit data backfills.
- Test a fresh database and an upgrade from the latest released build.
- Never reset the database to recover from a migration failure.
- Commit schema, SQL, metadata, and the generated TypeScript bundle together.

The development-only database self-check is available from Settings in a development build. It verifies migration idempotency, foreign keys, and rollback using an isolated database file.

## Validation and tests

Run the local release checks:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo install --check
npx expo-doctor
```

Verify native Metro bundles without producing signed applications:

```bash
npx expo export --platform android --output-dir .test-build/android --clear
npx expo export --platform ios --output-dir .test-build/ios --clear
```

The `.test-build/` directory is ignored and can be deleted after validation.

### Maestro smoke flow

Install Maestro, install a development build on the test device, start Metro, and run:

```bash
maestro test e2e/maestro/core-smoke.yaml
```

Before running it, update its `appId` only after the company application identifier is finalized. The automated flow covers onboarding, development paywall preview, account creation, income, expense, Home/Stats refresh, transfer navigation, and Settings. Purchases, notifications, share-sheet destinations, restart, and upgrade scenarios remain manual device checks.

## RevenueCat setup — final integration phase

Complete this only after both store app records and permanent identifiers exist:

1. Create monthly and annual auto-renewing subscription products in App Store Connect and Google Play Console.
2. Configure trial/introductory-offer eligibility in the stores.
3. Create the iOS and Android apps in RevenueCat using the exact store identifiers.
4. Configure one entitlement (currently `expensetracker_pro`) and attach Test Store products.
5. Create the current offering and attach monthly and annual packages.
6. Add the platform public SDK keys to EAS environments.
7. Verify localized prices and package availability on the custom paywall.
8. Test purchase, cancellation, retry, restore, renewal, expiration, billing issue, and cached offline entitlement.
9. Verify anonymous RevenueCat users because v1 has no application login.
10. Confirm a clean preview/production build cannot reach the tabs without the active entitlement.

Real purchases require development/store builds and sandbox/Test Store accounts. Expo Go must not be used as proof that subscriptions work.

## Production builds

Do not create production builds until every P0 item in [PROD.md](./PROD.md) is complete.

```bash
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

Or build both:

```bash
npx eas-cli@latest build --platform all --profile production
```

Expected artifacts:

- Android production: signed `.aab` for Google Play.
- iOS production: signed archive for App Store Connect/TestFlight submission.

Production binaries are normally installed through Google Play or TestFlight/App Store, not directly like an internal APK.

## Submit and publish

EAS Submit uploads an existing production build; it does not complete store metadata, review questionnaires, review approval, or the final staged rollout for you.

### Google Play

Before submission, create the Play Console app and configure a Google service-account key for EAS. Then build and submit:

```bash
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android --profile production
```

Use the internal testing track first. Complete the store listing, content rating, data safety, privacy policy, pricing/countries, tester access, and review requirements in Play Console before promoting the release.

### Apple App Store

Create the App Store Connect record, configure signing and the recommended App Store Connect API key, then build and submit:

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

The submission becomes an App Store Connect build. Distribute it through TestFlight first, complete metadata/privacy/export-compliance/review information, select the build, and submit the version for Apple review.

### Build and submit together

After the manual process has been proven and credentials are stable:

```bash
npx eas-cli@latest build --platform android --profile production --auto-submit
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

Do not automate production rollout until internal-track and TestFlight release procedures are reliable.

### Over-the-air updates

EAS Update is not configured in this repository. Do not run `eas update` or promise OTA delivery until `expo-updates`, runtime-version policy, rollback strategy, environment selection, and store-policy implications are intentionally designed and tested.

## Versioning

- Update the user-facing `expo.version` for planned releases.
- Every Android upload needs a higher `versionCode`.
- Every iOS upload needs a higher `buildNumber`.
- The production EAS profile currently enables `autoIncrement`; verify the resulting store build numbers on every build.
- Tag the exact Git commit used for each store submission.
- Do not rebuild a release from an uncommitted or dirty working tree.

## Troubleshooting

### No development build is installed

Use Expo Go:

```bash
npx expo start --go --clear
```

Or install a `development` EAS build first, then use:

```bash
npm run start:dev-client
```

### Metro cache or route errors

```bash
npm start -- --clear
```

Keep tests outside `app/`; Expo Router treats files in that directory as routes. Route filenames are lowercase to remain consistent on macOS, Linux/EAS, Android, and iOS.

### RevenueCat shows no packages

Check platform SDK key, current offering, package-to-product attachment, entitlement identifier, store agreements, product availability, sandbox account, and bundle/application ID. Rebuild after native or identifier changes.

### Notifications are unavailable

Android Expo Go does not provide the native notification behavior required here. Use a development build, grant permission in system settings, and verify the `budget` notification channel.

### Face ID or biometric app lock is unavailable

Set up Face ID, Touch ID, fingerprint, or supported face authentication in the device's system settings first. iOS Face ID requires a rebuilt development client because its permission message is a native configuration value; it does not work inside Expo Go.

After installing a compatible build, open **Settings → Security → App lock**. Enabling and disabling the lock both require successful system authentication. The lock is shown whenever the app leaves the active foreground, and the operating-system device credential remains available as a recovery fallback.

After adding or changing `expo-local-authentication` configuration, rebuild the development client:

```bash
npx eas-cli@latest build --platform android --profile development
npx eas-cli@latest build --platform ios --profile development
```

### Database initialization fails

Use the retry action. Do not clear storage or reinstall until the database file has been exported/backed up and the migration failure is understood.

### Expo dependency mismatch

```bash
npx expo install --check
npx expo-doctor
```

Use `npx expo install <package>` for Expo-managed native dependencies. Do not use `npm audit fix --force` as an automatic remedy because it can force a breaking Expo SDK upgrade.

## Privacy and security

- Financial data stays in local SQLite.
- Biometric templates and device passcodes are never read or stored by the app; authentication is performed by the iOS/Android system prompt.
- App lock prevents casual access and obscures financial screens when the app leaves the foreground. It does not encrypt the SQLite database or replace device-level encryption and screen-lock security.
- The app currently has no analytics or crash-reporting SDK.
- Adding telemetry requires an explicit privacy review and updated disclosures.
- Published Privacy Policy and Terms URLs are mandatory before release.
- Store privacy/data-safety answers must match the behavior of the final binary, including RevenueCat and store purchase processing.
- Public RevenueCat SDK keys may be embedded; private Apple, Google, Expo, and service-account credentials must not be committed.

## Official references

- [Expo Go and development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build setup](https://docs.expo.dev/build/setup/)
- [Internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Installable Android APKs](https://docs.expo.dev/build-reference/apk/)
- [EAS environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Submit to Google Play](https://docs.expo.dev/submit/android/)
- [Submit to the Apple App Store](https://docs.expo.dev/submit/ios/)
- [RevenueCat with Expo](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [Expo SQLite](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/)
- [Expo Local Authentication](https://docs.expo.dev/versions/v54.0.0/sdk/local-authentication/)
- [Drizzle Expo SQLite integration](https://orm.drizzle.team/docs/connect-expo-sqlite)

## License

No open-source license has been declared. Treat this repository as private/proprietary unless the owner adds a license.

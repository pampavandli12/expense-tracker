# Expense Tracker Production Release Checklist

Owner-facing checklist for taking the current local-first application from development to App Store and Google Play production.

Use this as a release gate. Do not submit merely because a production binary builds. Every P0 item must be complete, every accepted risk must be written down, and the exact release commit must pass native smoke testing on both platforms.

## Status legend

- `[x]` Implemented or locally verified in the repository.
- `[ ]` Owner/device/store action still required.
- `BLOCKER` prevents production submission.

## Current baseline

- [x] Local-first Expo Router application implemented.
- [x] Typed Drizzle schema over Expo SQLite.
- [x] Versioned, bundled migration foundation.
- [x] Income, expense, account, transfer, budget, history, category, Stats, Settings, and export workflows implemented.
- [x] RevenueCat boundary and contextual freemium paywall UI implemented.
- [x] Opt-in system biometric app-lock flow implemented for iOS and Android.
- [x] EAS development, preview, and production profiles added.
- [x] TypeScript, lint, Jest, Expo dependency compatibility, and Android/iOS Metro exports passed at the latest checkpoint.
- [ ] Signed native development builds completed and tested.
- [ ] Store identities, legal pages, products, RevenueCat, and submission credentials configured.

## P0 — identity and ownership

### Permanent application identity — BLOCKER

- [ ] Decide the company-owned reverse-domain identifier, for example `com.company.product`.
- [ ] Replace `expo.ios.bundleIdentifier` with that exact value.
- [ ] Replace `expo.android.package` with that exact value.
- [ ] Update the Maestro `appId` to match after the identifier is final.
- [ ] Confirm the app display name, store name, slug, URL scheme, SKU, and company/legal seller name.
- [ ] Confirm trademark/name availability in intended markets.
- [ ] Record the final identifier in the company password manager/release register.

The repository must not invent or silently change the company identifier. Finalize it before creating store records, signing credentials, RevenueCat apps, subscriptions, deep links, or production builds. Changing it later creates a different app identity.

### Accounts and access — BLOCKER

- [ ] Create/confirm the company Expo organization and project ownership.
- [ ] Create/confirm Google Play Developer account ownership.
- [ ] Create/confirm Apple Developer Program and App Store Connect ownership.
- [ ] Invite at least one backup administrator to each service.
- [ ] Require MFA on Expo, Apple, Google, RevenueCat, source control, and company email.
- [ ] Store recovery codes and credential ownership in the company password manager.
- [ ] Accept current Apple and Google paid-app/subscription agreements.
- [ ] Complete tax, banking, merchant, and legal-entity setup required to sell subscriptions.
- [ ] Define who may build, submit, change products, approve rollout, and rotate credentials.

## P0 — product and legal decisions

- [ ] Confirm supported countries/regions and minimum OS/device policy.
- [ ] Confirm English-only v1 or define required localization.
- [ ] Confirm INR default and multi-currency behavior described in the product copy.
- [ ] Approve subscription names, monthly/annual pricing, trial length, eligibility, and renewal copy.
- [ ] Approve the free/Premium feature split and ensure every paywall benefit is accurate.
- [ ] Publish Privacy Policy on a stable HTTPS company URL.
- [ ] Publish Terms of Use on a stable HTTPS company URL.
- [ ] Publish support/contact page and support email.
- [ ] Add company/legal name, contact route, effective date, and jurisdiction to legal documents.
- [ ] Disclose that records are device-local and uninstall/clear-storage removes them.
- [ ] Disclose that v1 has export but no import, cloud backup, authentication, or sync.
- [ ] Verify legal documents describe RevenueCat and Apple/Google purchase processing.
- [ ] Decide whether analytics/crash reporting is allowed. Default is none; adding it requires implementation and updated disclosures.
- [ ] Obtain legal review for subscription disclosures and store terms where required.

## P0 — application configuration

- [ ] Replace the temporary application identifiers only after company approval.
- [ ] Confirm `expo.name`, `expo.slug`, scheme, orientation, and phone-only tablet decision.
- [ ] Verify production app icon at every required size with no transparency violations.
- [ ] Verify Android adaptive foreground/background/monochrome icons.
- [ ] Verify light and dark splash screens on physical devices.
- [ ] Verify Android notification icon is a valid monochrome asset.
- [ ] Confirm notification channel name and importance.
- [ ] Confirm `version`, Android `versionCode`, and iOS `buildNumber` policy.
- [ ] Link the project to the correct Expo organization/project.
- [ ] Review any `eas build:configure` changes before committing.
- [ ] Add final production EAS environment variables.
- [ ] Ensure development/preview variables cannot accidentally be used in production.
- [ ] Confirm preview/production builds enforce Premium features without blocking free app access.
- [ ] Keep web excluded unless a separate web product is intentionally approved.

## P0 — financial correctness and data integrity

- [x] Store money as integer minor units.
- [x] Remaining balance is income minus expense.
- [x] Budget is a limit/alert mechanism, not a balance input.
- [x] Transfer entries are excluded from income/expense reporting.
- [x] Cross-currency transfers require explicit destination amount.
- [x] Incompatible currencies are excluded from combined reports.
- [x] Historical records survive account/category archival.
- [ ] Verify all rules with representative production-like data on both platforms.
- [ ] Verify zero, negative, extremely large, malformed, and high-precision amount rejection.
- [ ] Verify all month/year boundaries, including December→January and local timezone changes.
- [ ] Verify past-dated create/edit/delete updates the correct Home, Budget, Stats, Account, and History month.
- [ ] Verify account opening balances and transfer directions.
- [ ] Verify same-currency and cross-currency transfer rollback on failure.
- [ ] Verify editing/deleting transactions recalculates aggregates and budget status.
- [ ] Verify 80% and 100% budget event deduplication after edits, deletes, and recrossing.
- [ ] Verify search and every filter individually and in combination.
- [ ] Verify archived account/category history remains readable and cannot be silently lost.
- [ ] Run high-volume data tests for long history lists and charts.

## P0 — database migration and recovery

- [x] Generated Drizzle migration and Metro-safe TypeScript bundle committed.
- [x] Retryable bootstrap error preserves the database.
- [x] WAL and foreign keys enabled.
- [ ] Run development Settings database self-check on Android.
- [ ] Run development Settings database self-check on iOS.
- [ ] Test a clean install using the release candidate.
- [ ] Install the previous checkpoint, create realistic data, upgrade in place, and verify every table/aggregate.
- [ ] Force a migration failure in a test build and verify records are not deleted.
- [ ] Verify migration rollback leaves the previous database usable.
- [ ] Confirm shipped migration files are immutable.
- [ ] Confirm schema, SQL, Drizzle metadata, and generated bundle remain synchronized.
- [ ] Export JSON/CSV before upgrade testing and retain test evidence.
- [ ] Decide whether v1's no-import limitation is acceptable and disclose it prominently.

## P0 — RevenueCat and subscriptions — intentionally final

Complete only after permanent identifiers and store records exist.

### Store products

- [ ] Create monthly subscription in App Store Connect.
- [ ] Create annual subscription in App Store Connect.
- [ ] Add both to the correct subscription group.
- [ ] Configure trial/introductory offer and eligibility.
- [ ] Add localized display names, descriptions, pricing, and review screenshots.
- [ ] Create matching monthly and annual subscriptions in Google Play Console.
- [ ] Configure base plans/offers, trial, regions, activation, and availability.
- [ ] Verify product IDs follow a stable company convention.

### RevenueCat

- [ ] Create/link RevenueCat iOS app using the exact bundle identifier.
- [ ] Create/link RevenueCat Android app using the exact application ID.
- [ ] Configure Apple and Google store credentials/integrations.
- [ ] Create one entitlement named `premium`.
- [ ] Create the current offering.
- [ ] Attach monthly and annual packages to the correct products.
- [ ] Add platform public SDK keys to development, preview, and production EAS environments.
- [ ] Verify product/package availability on real development builds.
- [ ] Verify localized price strings and annual best-value presentation.
- [ ] Confirm anonymous RevenueCat user behavior because the app has no login.

### Subscription acceptance

- [ ] New monthly purchase unlocks immediately.
- [ ] New annual purchase unlocks immediately.
- [ ] Trial purchase and eligibility copy are accurate.
- [ ] User cancellation is handled quietly without false error messaging.
- [ ] Store/network failures preserve state and show retry guidance.
- [ ] Restore succeeds after reinstall/device change where store rules allow.
- [ ] Restore with no entitlement gives clear feedback.
- [ ] Renewal retains access.
- [ ] Expiration removes access.
- [ ] Refund/revocation removes access.
- [ ] Billing issue/grace period behavior matches product policy.
- [ ] Cached entitlement behaves acceptably during temporary offline periods.
- [ ] Manage-subscription links open the correct platform destination.
- [ ] A clean preview/production install can enter free tabs and cannot use guarded Premium actions without entitlement.
- [ ] Development bypass is unreachable in preview and production binaries.
- [ ] Paywall shows Terms, Privacy, renewal period, price, trial terms, restore, and required disclosures.

## P0 — notifications

- [ ] Test first permission request on Android physical device.
- [ ] Test first permission request on iOS physical device.
- [ ] Test granted, denied, provisional/undetermined where applicable, and permanently denied states.
- [ ] Verify Settings reports actual status and opens device settings.
- [ ] Verify the app remains usable with permission denied.
- [ ] Trigger 80% alert once and capture evidence.
- [ ] Trigger 100% alert once and capture evidence.
- [ ] Verify edit/delete/re-cross does not duplicate already-recorded threshold events.
- [ ] Verify notifications while foregrounded, backgrounded, and after app restart.
- [ ] Verify Android notification channel icon, label, and importance.
- [ ] Ensure store copy says local notifications, not unsupported remote push functionality.

## P0 — native device QA

Test at least one representative physical device per platform plus small-screen coverage.

- [ ] Android development build installs and opens.
- [ ] iOS development build installs and opens.
- [ ] Android preview build runs without Metro.
- [ ] iOS preview build runs without Metro.
- [ ] SQLite data persists after force-close and relaunch.
- [ ] SQLite data persists after device restart.
- [ ] SQLite data persists through an application upgrade.
- [ ] Native date picker saves the intended local date.
- [ ] Keyboard avoidance works on every form.
- [ ] JSON export creates a valid complete file.
- [ ] CSV export opens correctly in a spreadsheet application.
- [ ] Share sheet cancel/success/error paths work.
- [ ] Theme and base currency persist after relaunch.
- [ ] App lock enables only after successful authentication on Android.
- [ ] App lock enables only after successful Face ID/Touch ID authentication on iOS.
- [ ] Cancelling enable/disable authentication leaves the previous setting unchanged.
- [ ] App content is obscured and requires authentication after backgrounding, app switching, Control Center/notification shade interruption, and relaunch.
- [ ] Device credential fallback works after biometric failure or temporary lockout.
- [ ] Removing enrolled biometrics produces recovery guidance and does not expose app content.
- [ ] App lock UI and system prompts work in light/dark modes with TalkBack and VoiceOver.
- [ ] Onboarding state persists.
- [ ] Month/account/currency filters persist or reset according to the intended UX.
- [ ] Deep links/URL scheme do not expose unintended routes.
- [ ] Offline launch works for entitled/cached users according to policy.
- [ ] Airplane-mode create/edit/delete/export works without data corruption.
- [ ] Rotation is correctly locked to portrait.
- [ ] Memory use and chart/list scrolling remain smooth with high-volume data.

Recommended device matrix:

- [ ] Small Android phone.
- [ ] Current mainstream Android phone.
- [ ] Small supported iPhone/iPhone SE-class layout.
- [ ] Current mainstream iPhone.
- [ ] Latest supported Android OS.
- [ ] Oldest supported Android OS.
- [ ] Latest supported iOS.
- [ ] Oldest supported iOS.

## P0 — accessibility and UX

- [ ] Complete VoiceOver navigation on iOS.
- [ ] Complete TalkBack navigation on Android.
- [ ] Verify all controls have meaningful labels, roles, values, and states.
- [ ] Verify Dynamic Type/font scaling without clipped financial values or buttons.
- [ ] Verify minimum touch-target sizes.
- [ ] Verify contrast in light and dark themes.
- [ ] Verify reduced-motion mode removes nonessential motion.
- [ ] Verify focus order in forms, modals, filters, and paywall.
- [ ] Verify errors are announced and do not rely on color alone.
- [ ] Verify charts have equivalent textual summaries.
- [ ] Verify empty, loading, write-failure, migration-failure, notification-denied, and purchase-error states.
- [ ] Confirm no initial screen flash, content jump, or mount-animation flicker remains.

## P0 — automated verification

Run on the exact release commit:

```bash
npm ci
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo install --check
npx expo-doctor
npx expo export --platform android --output-dir .test-build/android --clear
npx expo export --platform ios --output-dir .test-build/ios --clear
```

- [ ] All commands pass on a clean checkout.
- [ ] Review `npm audit --omit=dev`; document accepted Expo transitive findings.
- [ ] Do not use `npm audit fix --force` during release hardening.
- [ ] Run Maestro core smoke on Android development build.
- [ ] Run Maestro core smoke on iOS development build.
- [ ] Manually execute purchase/restore, notification, share, restart, and upgrade scenarios.
- [ ] Record test date, device/OS, commit SHA, build IDs, and tester.
- [ ] Confirm no P0/P1 defects remain open.

## P0 — security and privacy review

- [ ] Confirm `.env.local` and all credential files are absent from Git history.
- [ ] Confirm iOS Face ID usage text is present in the signed binary and matches the approved privacy copy.
- [ ] Confirm the app never receives, stores, logs, or claims access to biometric templates.
- [ ] Confirm app-lock preference persists across relaunch and is not silently disabled by financial-data reset.
- [ ] Confirm the app-switcher snapshot is covered by the opaque lock surface on both platforms.
- [ ] Document that app lock is an access-control convenience and does not encrypt the SQLite database at rest.
- [ ] Confirm no private Apple/Google/Expo/RevenueCat credentials are embedded.
- [ ] Confirm `EXPO_PUBLIC_` values contain only client-readable configuration.
- [ ] Confirm SQLite queries remain parameterized and service validation is enforced.
- [ ] Confirm exports do not include unintended internal metadata or credential material.
- [ ] Confirm database errors never log sensitive notes/amounts in production.
- [ ] Confirm RevenueCat debug logging is development-only.
- [ ] Confirm no analytics/device identifiers are collected unless explicitly approved.
- [ ] Complete Apple privacy-manifest/questionnaire review.
- [ ] Complete Google Play Data Safety form from final binary behavior.
- [ ] Review dependency advisories and document accepted residual risk.
- [ ] Establish a credential rotation and access-removal procedure.

## P0 — store assets and metadata

Prepare separately for iOS and Android where dimensions/copy differ.

- [ ] Final app name and subtitle/short description.
- [ ] Full description and feature bullets.
- [ ] Keywords/category selection.
- [ ] Final icon and feature graphic.
- [ ] Phone screenshots from production-like data with no personal information.
- [ ] Optional preview video if required by marketing.
- [ ] Privacy Policy URL.
- [ ] Terms URL.
- [ ] Support URL and support email.
- [ ] Marketing URL if available.
- [ ] Age/content rating questionnaire.
- [ ] Subscription review notes and paywall screenshots.
- [ ] Reviewer instructions explaining the freemium model and sandbox purchase process.
- [ ] Export compliance/encryption answers.
- [ ] Copyright/company information.
- [ ] Countries, pricing, tax category, and availability.
- [ ] Google Play app-access instructions and internal-test setup.
- [ ] Apple App Review contact and demo instructions.
- [ ] Verify metadata makes no unsupported backup, sync, security, or financial-advice claims.

## Build and internal release procedure

### 1. Freeze and verify

- [ ] Branch is clean and all intended changes are committed.
- [ ] Record release commit SHA.
- [ ] Update release notes/changelog.
- [ ] Confirm application identifiers and EAS environment.
- [ ] Run the full automated verification block.

### 2. Development builds

```bash
npx eas-cli@latest build --platform android --profile development
npx eas-cli@latest build --platform ios --profile development
```

- [ ] Install on physical devices.
- [ ] Run database self-check.
- [ ] Run financial, notification, export, and subscription smoke tests.

### 3. Preview builds

```bash
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
```

- [ ] Share only with authorized internal testers.
- [ ] Confirm builds run without Metro.
- [ ] Complete regression and accessibility signoff.

### 4. Production builds

```bash
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

- [ ] Confirm Android output is an AAB.
- [ ] Confirm iOS build appears under the intended bundle identifier.
- [ ] Verify version/build numbers, commit SHA, signing identity, and environment.
- [ ] Retain EAS build IDs and artifact links in the release record.

## Store submission procedure

### Google Play internal testing first

- [ ] Create the Play Console app using the permanent company application ID.
- [ ] Upload/configure the Google service-account key for EAS Submit.
- [ ] Complete required app-content and store-listing sections.
- [ ] Submit the production AAB:

```bash
npx eas-cli@latest submit --platform android --profile production
```

- [ ] Keep the first release on internal testing.
- [ ] Test install, purchase, restore, update, and uninstall/reinstall through Google Play.
- [ ] Promote to closed/open testing only after signoff.
- [ ] Use staged production rollout; do not release immediately to 100% by default.

### TestFlight first

- [ ] Create the App Store Connect record using the permanent company bundle identifier.
- [ ] Configure the recommended App Store Connect API key for EAS Submit.
- [ ] Add the numeric App Store Connect Apple ID to the submit profile when available.
- [ ] Submit the production build:

```bash
npx eas-cli@latest submit --platform ios --profile production
```

- [ ] Complete export-compliance processing.
- [ ] Distribute to internal TestFlight testers.
- [ ] Test purchase, restore, upgrade, expiration, and notification behavior through TestFlight.
- [ ] Complete external TestFlight review if external testing is required.
- [ ] Select the final build and submit the App Store version for review.

EAS Submit uploads binaries; it does not finish store listing, store review, or release rollout.

## Final go/no-go signoff

- [ ] Product owner approves feature scope and known limitations.
- [ ] Engineering approves financial correctness, migration, performance, and residual dependency risk.
- [ ] QA approves Android and iOS test evidence with no P0/P1 defects.
- [ ] Design approves final UI, screenshots, accessibility, and store assets.
- [ ] Legal/privacy approves Terms, Privacy Policy, subscription copy, and store disclosures.
- [ ] Support has FAQ, contact process, refund/store guidance, and escalation ownership.
- [ ] Release owner confirms exact commit, build IDs, version numbers, environments, and rollout plan.
- [ ] Rollback/hold decision-maker is available during launch.

## Post-release operations

- [ ] Monitor Play Console and App Store Connect crashes, ANRs, reviews, subscription issues, and rollout status.
- [ ] Monitor RevenueCat entitlement, purchase, renewal, cancellation, and billing-issue events.
- [ ] Validate production purchase and restore with controlled real-store accounts where policy permits.
- [ ] Keep staged rollout paused if P0/P1 issues appear.
- [ ] Document customer-impacting incidents and remediation.
- [ ] Maintain a support procedure for lost local data; do not promise recovery that v1 cannot provide.
- [ ] Maintain a release calendar for dependency/Expo SDK upgrades.
- [ ] Re-run migration upgrade tests before every database schema release.
- [ ] Rotate credentials when staff/access changes.
- [ ] Review legal/store disclosures whenever data collection, RevenueCat behavior, export, analytics, or backup changes.

## Not configured in v1

The following are intentionally outside the current release unless scope is explicitly changed:

- Authentication and user accounts.
- Cloud sync or cloud backup.
- Data import/restore.
- Bank integration.
- Receipt scanning.
- Automatic exchange rates.
- Recurring transaction automation.
- Web release.
- EAS Update/OTA delivery.
- Analytics or crash-reporting SDK.

Adding any of these requires a new design, data, security, testing, and privacy review rather than treating it as a release-checkbox change.

## Release record template

Copy this section for each candidate:

```text
Release version:
Android versionCode:
iOS buildNumber:
Git commit SHA:
EAS Android development build ID:
EAS iOS development build ID:
EAS Android preview build ID:
EAS iOS preview build ID:
EAS Android production build ID:
EAS iOS production build ID:
RevenueCat offering/entitlement verified:
Android device/OS results:
iOS device/OS results:
Migration upgrade source version:
Automated checks:
Open accepted risks:
Approvers:
Submission dates:
Store rollout status:
```

## References

- [Project developer and release guide](./README.md)
- [Current implementation checkpoint](./CHECKPOINT.md)
- [EAS Build](https://docs.expo.dev/build/)
- [EAS internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [EAS Submit for Android](https://docs.expo.dev/submit/android/)
- [EAS Submit for iOS](https://docs.expo.dev/submit/ios/)
- [EAS environment variables](https://docs.expo.dev/eas/environment-variables/)
- [RevenueCat Expo installation/testing](https://www.revenuecat.com/docs/getting-started/installation/expo)

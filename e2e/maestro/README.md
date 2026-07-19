# Native smoke testing

Run `core-smoke.yaml` against both iOS and Android development builds after
installing Maestro. RevenueCat is intentionally bypassed only through the
development-only preview action.

The automated smoke covers onboarding, the hard paywall boundary, account
creation, income and expense creation, dashboard refresh, Stats navigation,
transfer availability, and Settings entries.

Before a release candidate, manually add the remaining native checks that need
store/device state: purchase and restore, notification denial and Settings
recovery, 80% and 100% budget notifications, share-sheet destinations,
background termination, device restart, and upgrade from the previous build.

# Privacy Policy

**Expense Tracker**

**Effective date:** 9 September 2026  
**Last updated:** 9 September 2026

---

## 1. Introduction

This Privacy Policy explains how **Daily App Labs** ("**we**", "**us**", or "**our**") handles information when you use the **Expense Tracker** mobile application (the "**App**") on iOS and Android.

Expense Tracker is a **privacy-first, local-only** personal finance tool. Your income, expense, account, budget, and category records are stored **on your device**. We do **not** operate user accounts, cloud databases, bank connections, receipt scanning, or cloud backup for your financial data in the current version of the App.

By downloading, installing, or using the App, you agree to this Privacy Policy. If you do not agree, please do not use the App.

**Data controller:** Daily App Labs  
**Contact:** [support@dailyapplabs.com](mailto:support@dailyapplabs.com)  
**Postal address:** [Insert registered business address]  
**Applicable law / jurisdiction:** [Insert governing jurisdiction, e.g. India]

> **Before publishing:** Replace the bracketed contact and jurisdiction placeholders above with your final legal entity details. Host this document at the stable HTTPS URL configured in `EXPO_PUBLIC_PRIVACY_URL`.

---

## 2. Summary

| Topic | What Expense Tracker does |
| --- | --- |
| Financial records | Stored locally on your device in an on-device database |
| User accounts | None — no sign-up, login, or profile with us |
| Cloud sync / backup | Not provided in the current version |
| Analytics & advertising | **Not used** — no analytics, crash-reporting, or ad SDKs |
| Tracking across apps/websites | **Not used** |
| Subscriptions | Processed by Apple or Google; entitlement status verified through RevenueCat |
| Notifications | Optional, local budget alerts only (Premium feature) |
| Biometric app lock | Optional; handled entirely by your device's operating system |
| Data export | User-initiated JSON or CSV export via the system share sheet |
| Data deletion | Reset in Settings, or uninstall the App |

---

## 3. Information We Do Not Collect

We designed Expense Tracker to minimize data collection. In normal use, we do **not**:

- Collect your name, email address, phone number, or postal address through the App
- Require you to create an account with us
- Upload your transactions, accounts, budgets, categories, notes, or transfers to our servers
- Connect to banks, payment networks, or financial institutions
- Scan receipts or access your photo library for financial data
- Use analytics, advertising, or cross-app tracking technologies
- Sell your personal information

---

## 4. Information Stored on Your Device

The App stores the following information **locally** on your phone or tablet in a SQLite database and related on-device storage. This information is **not transmitted to Daily App Labs** as part of normal App operation.

### 4.1 Financial and app data you enter

- **Accounts:** name, type (cash, bank, card, wallet), currency, opening balance, archive status, creation date
- **Transactions:** income and expense amounts, currency, date, linked account and category, optional notes, expense classification (fixed/variable), and transfer references where applicable
- **Transfers:** source and destination accounts, amounts in each currency, date, and optional notes
- **Budgets:** monthly budget amount, currency, alert thresholds, and whether alerts are enabled
- **Categories:** name, type (income/expense), icon, color, and whether the category is custom or system-provided
- **Notification event records:** local records used to avoid sending duplicate budget alert notifications for the same threshold in the same month

### 4.2 App preferences and settings

- Appearance preference (system, light, or dark)
- Base currency for Home and Stats views
- Whether onboarding has been completed
- Whether optional app lock is enabled

### 4.3 What this data may reveal

Because you enter financial information voluntarily, the on-device data may constitute **personal information** or **sensitive personal/financial information** under applicable privacy laws, depending on your jurisdiction and the content you record.

**You control this data.** It remains on your device unless you export it, reset it, or remove it by uninstalling the App or clearing the App's storage.

---

## 5. Information Processed by Third Parties

Although your financial records stay on your device, limited information is processed by third parties when you use certain App features.

### 5.1 Apple App Store and Google Play

If you purchase or restore a **Premium subscription**, payment processing, billing, refunds, subscription management, and tax handling are performed by **Apple** (on iOS) or **Google** (on Android) under their respective terms and privacy policies.

We do **not** receive or store your full payment card number or bank account details.

Apple Privacy Policy: [https://www.apple.com/legal/privacy/](https://www.apple.com/legal/privacy/)  
Google Privacy Policy: [https://policies.google.com/privacy](https://policies.google.com/privacy)

### 5.2 RevenueCat

We use **RevenueCat, Inc.** to manage subscription entitlements and verify whether Premium access is active. RevenueCat helps the App determine whether features such as unlimited accounts, custom categories, advanced statistics, budgets, budget alerts, cross-currency transfers, and advanced filters should be unlocked.

When subscriptions are enabled, RevenueCat may process information such as:

- An anonymous or store-linked app user identifier
- Purchase, renewal, cancellation, and restoration status
- Product and entitlement identifiers
- Platform store receipt or transaction-related metadata supplied by Apple or Google
- Basic device and app information needed to provide the service (for example, operating system version and app version)
- IP address and standard server logs when the App communicates with RevenueCat

**RevenueCat does not receive your financial records** — including your accounts, transactions, transfers, budgets, categories, or notes — from Expense Tracker.

RevenueCat Privacy Policy: [https://www.revenuecat.com/privacy](https://www.revenuecat.com/privacy)

### 5.3 Destinations you choose when exporting data

If you export your data as **JSON** or **CSV**, the App creates a file on your device and opens your operating system's **share sheet**. Any app or service you choose to share that file with (email, cloud drive, messaging app, etc.) will receive the exported content under **that service's** privacy practices. We do not control those destinations.

---

## 6. Device Permissions and Optional Features

The App may request the following device permissions. All are **optional** except where required by your device operating system to use a feature you choose to enable.

### 6.1 Biometric authentication and device credentials (optional)

If you enable **App lock** in Settings, the App uses your device's operating system APIs to request authentication through **Face ID**, **Touch ID**, fingerprint, face unlock, or your device passcode.

- We do **not** collect, store, or transmit biometric templates, fingerprints, facial data, or passcodes.
- Authentication is performed locally by iOS or Android.
- On iOS, the App includes a system permission message explaining that Face ID may be used to protect your private financial records.

You can disable App lock at any time in Settings. Disabling requires successful authentication first.

### 6.2 Notifications (optional)

If you are a Premium subscriber and enable **budget alerts**, the App may request permission to display **local notifications** when your spending reaches configured thresholds (for example, 80% and 100% of a monthly budget).

- Notifications are generated **on your device**.
- Notification content is limited to generic budget status messaging and does not include a full transaction export.
- You can deny or revoke notification permission in your device settings at any time.

### 6.3 Network access

The App uses network connectivity only for subscription-related services (Apple/Google purchase flows and RevenueCat entitlement checks). Routine expense tracking, reporting, budgeting, and exporting do **not** require network access.

---

## 7. How We Use Information

We use information only as follows:

| Purpose | Source | Notes |
| --- | --- | --- |
| Provide core expense-tracking features | On-device data you enter | Processed locally |
| Show charts, summaries, and budgets | On-device data | Processed locally |
| Remember your preferences | On-device settings | Processed locally |
| Protect access with optional app lock | Device OS authentication | No biometric data stored by us |
| Send optional budget alerts | On-device budget calculations | Local notifications only |
| Verify Premium access | RevenueCat / Apple / Google | No financial records shared |
| Export your data when you request it | On-device data | User-initiated only |
| Comply with law | As required | Only if legally compelled |

We do **not** use your information for targeted advertising or sale of personal information.

---

## 8. Legal Bases for Processing (EEA, UK, and similar regions)

If you are in the European Economic Area, United Kingdom, or another region requiring a legal basis, we rely on the following:

- **Performance of a contract:** To provide the App and any Premium features you purchase
- **Legitimate interests:** To operate and secure subscription entitlement verification, prevent abuse, and maintain the App
- **Consent:** For optional features such as notifications and biometric app lock, where consent is required by your device platform
- **Legal obligation:** Where we must comply with applicable law

Because your financial records are stored locally and not uploaded to us, our direct processing of that content is limited. Your primary relationship for that data is with your device and, if you export it, with the services you choose.

---

## 9. Data Sharing and Disclosure

We do **not** sell or rent your personal information.

We may share limited information only in these circumstances:

- **Subscription providers:** With Apple, Google, and RevenueCat as described in Section 5, solely to process and verify subscriptions
- **Legal requirements:** If required by law, regulation, legal process, or governmental request, or to protect rights, safety, and security
- **Business transfers:** If we are involved in a merger, acquisition, financing, or sale of assets, subject to this Privacy Policy continuing to govern the information unless you are notified otherwise
- **With your direction:** When you export data and choose a destination through the share sheet

We do not share your on-device financial records with Daily App Labs servers because we do not collect them centrally.

---

## 10. Data Retention

### 10.1 On-device data

Your financial records and preferences remain on your device until you:

- Use **Reset local data** in Settings
- Uninstall the App
- Clear the App's storage through your device settings
- Replace or erase your device without first exporting your data

**We cannot recover your data** after it is deleted from your device. The App does not provide cloud backup in the current version.

### 10.2 Subscription-related data

Apple, Google, and RevenueCat retain purchase and entitlement information according to their own retention policies and legal obligations. Contact them directly or use their account tools to manage that information.

---

## 11. Data Security

We take reasonable measures to protect information within our control, including:

- Keeping financial records on-device rather than on our servers
- Using platform-provided secure storage and database APIs
- Offering optional app lock to reduce casual unauthorized access
- Limiting third-party integrations to subscription verification only

**Important limitations:**

- App lock helps prevent casual access but does **not** encrypt the on-device database by itself
- Your device's overall security (screen lock, OS updates, device encryption) remains essential
- No method of storage or transmission is completely secure

You are responsible for maintaining backups through export if you need recovery options.

---

## 12. Your Choices and Privacy Rights

Depending on where you live, you may have rights regarding personal information, which can include access, correction, deletion, portability, restriction, objection, and withdrawal of consent.

### 12.1 Financial data stored on your device

Because we do not host your financial records, you can access, export, correct, or delete them directly in the App:

- **Access / export:** Settings → **Export local data** (JSON or CSV)
- **Correct:** Edit accounts, transactions, categories, and budgets in the App
- **Delete:** Settings → **Reset local data**, or uninstall the App

### 12.2 Subscription data

For purchase history, billing, refunds, and subscription management:

- **iOS:** Apple ID → Subscriptions, or [https://apps.apple.com/account/subscriptions](https://apps.apple.com/account/subscriptions)
- **Android:** Google Play → Payments & subscriptions, or [https://play.google.com/store/account/subscriptions](https://play.google.com/store/account/subscriptions)

For entitlement data processed by RevenueCat on our behalf, contact us at [support@dailyapplabs.com](mailto:support@dailyapplabs.com) and we will assist with verifiable requests where applicable.

### 12.3 California privacy rights (CCPA/CPRA)

California residents have the right to know, access, correct, and delete personal information, and to opt out of sale or sharing for cross-context behavioral advertising. **We do not sell or share personal information for cross-context behavioral advertising.**

To submit a request, email [support@dailyapplabs.com](mailto:support@dailyapplabs.com). We may need to verify your request. You may also use an authorized agent where permitted by law.

### 12.4 India (Digital Personal Data Protection Act and related rules)

If you are in India, you may have rights to access, correction, erasure, and grievance redressal regarding personal data processed by us. Because your core financial records remain on your device, most requests relating to that data can be fulfilled directly through the App controls described above.

**Grievance contact:** [Insert grievance officer name and email, if required]

---

## 13. Children's Privacy

Expense Tracker is a general personal finance application and is **not directed to children** under 13 (or the minimum age required in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided information to us, contact [support@dailyapplabs.com](mailto:support@dailyapplabs.com) and we will take appropriate steps.

---

## 14. International Data Transfers

Daily App Labs may be located in one country while you use the App from another. Subscription providers such as Apple, Google, and RevenueCat may process information in countries other than your own, including the United States, under their own safeguards and legal mechanisms.

Where required, we rely on appropriate transfer mechanisms such as standard contractual clauses or equivalent protections offered by service providers.

---

## 15. Third-Party Links and Services

The App may open external links for subscription management or, when configured, published legal documents. Those third-party services are governed by their own terms and privacy policies. We are not responsible for their practices.

---

## 16. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in the App, legal requirements, or our practices. When we make material changes, we will update the **Effective date** and **Last updated** date at the top of this document and, where required, provide additional notice in the App or through store listings.

Your continued use of the App after an updated policy becomes effective constitutes acceptance of the revised policy, unless applicable law requires otherwise.

---

## 17. Store Disclosure Reference

This section summarizes how Expense Tracker aligns with common app store privacy questionnaires. Use it as a reference when completing **Google Play Data safety** and **Apple App Privacy** forms. Always answer based on the **actual release build** you submit.

### 17.1 Google Play — Data safety (reference)

| Data type | Collected | Shared | Encrypted in transit | User can request deletion | Purpose |
| --- | --- | --- | --- | --- | --- |
| Financial info entered by user | Stored on device only; not collected by developer servers | No | N/A for local storage | Yes (in-app reset / uninstall) | App functionality |
| App interactions / diagnostics | No analytics SDK in current version | No | — | — | — |
| Device or other IDs (subscription) | Yes, via RevenueCat / store purchase flow | Yes, with RevenueCat and store providers | Yes | Contact us / store account | App functionality, fraud prevention |
| Purchase history | Yes, via Apple/Google/RevenueCat for subscriptions | Yes, with RevenueCat and store providers | Yes | Via store account and support request | App functionality |

**Additional Play declarations:**

- Data is **not sold**
- Data is **not used for advertising**
- Data is **not used for tracking** across apps or websites
- Security practices: data stored on device; subscription traffic encrypted in transit
- Optional account deletion: not applicable — no developer account system; users delete local data in Settings

### 17.2 Apple App Privacy (reference)

| Category | Linked to user | Used for tracking | Notes |
| --- | --- | --- | --- |
| Financial Info (user-entered) | No — stored locally, not collected by developer | No | Not disclosed to Apple as collected by developer if it never leaves device |
| Purchase history | Yes, for subscriptions | No | Through Apple and RevenueCat |
| User ID | Yes, anonymous/store-linked subscription ID | No | RevenueCat |
| Other data types (contact, location, browsing, etc.) | Not collected | No | — |

Apple may separately show permissions for Face ID usage and notifications based on the App's Info.plist / manifest declarations.

---

## 18. Contact Us

If you have questions, concerns, or privacy requests regarding this Privacy Policy or Expense Tracker, contact:

**Daily App Labs**  
Email: [support@dailyapplabs.com](mailto:support@dailyapplabs.com)  
Address: [Insert registered business address]

We will respond within a reasonable time and in accordance with applicable law.

---

*This document describes the privacy practices of Expense Tracker version 1.0.0 and the current local-first product design. If future versions add features such as cloud sync, analytics, crash reporting, over-the-air updates, or import services, this policy must be updated before release.*

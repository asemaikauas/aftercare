# aftercare — patient app

A native React Native / Expo SDK 57 app for iOS and Android, with a browser preview. Built for the FishTank aftercare demo. The original administrator application remains at the repository root.

## Start on a phone

Requires Node 22.13+ and Expo Go compatible with SDK 57.

```powershell
cd C:\Users\User\Documents\Codex\aftercare\mobile
npm install
npm start
```

Connect the laptop and phone to the same Wi-Fi. Scan the terminal QR code using Expo Go on Android or the iPhone Camera. Allow local-network access on the phone if requested. If another Metro server is already running, use its QR code or stop it before starting another. `npm start` explicitly selects Expo Go; `npm run start:dev-client` selects an installed development build.

For the browser, run `npm run web`. Browser preview supports the patient flows and local storage, but does not schedule phone notifications. For a native emulator use the Android/iOS scripts; iOS Simulator requires macOS. This repository does not include a signed IPA or APK.

## What works

- Today: five custom SVG mood faces and a two-step check-in (mood, pain 0–10, optional symptoms and notes).
- Medication: the dashboard's medication list, one daily confirmation per medicine, and configurable daily care-plan notifications.
- My plan: the dashboard's care tasks and follow-up appointment, local task completion, check-in journal, and shareable summary.
- Care team: the dashboard's named clinicians and patient messages.
- Separate device-local records for all ten synthetic dashboard profiles; Settings changes the demo profile.
- Offline outbox: check-ins, medication logs and messages remain local until the demo bridge acknowledges them. Failed delivery retains the item; explicit Sync retries it.
- A local clinic bridge writes submissions to disk and exposes them in **administrator → Voice check-ins → Patient app inbox**.

## Live phone → administrator demo

Start two additional terminals in the repository root:

```powershell
# Terminal 1 — synthetic data bridge, trusted local network only
npm run demo:server -- --lan

# Terminal 2 — original administrator app
npm install
npm run dev
```

Find the laptop's Wi-Fi IPv4 address using `ipconfig`. In the **phone app → bell → Connect the demo clinic**, enter `http://YOUR-LAPTOP-IP:4100` and choose **Connect and sync**. `localhost` on a phone means the phone, not the laptop.

On the laptop, open **Voice check-ins** in the administrator dashboard and connect its **Patient app inbox** to `http://localhost:4100`. Complete a check-in on the phone: the administrator inbox refreshes every three seconds. Medication confirmations and care-team messages use the same flow. A browser preview on the laptop can also use `http://localhost:4100`.

The bridge defaults to loopback unless `--lan` is passed. Keep it on a trusted network; it is an unauthenticated, synthetic-only demo service with permissive CORS. Do not deploy it publicly or enter real patient data. Its file is `work/demo-clinic/events.json` (gitignored). The inbox is independent of the original static risk queue: submissions do not automatically change clinical risk scores or create clinician replies. Task toggles remain local. There is no real sign-in, EHR connection, or production patient backend.

If the existing admin app cannot start, the patient app remains usable offline. The new bridge has no third-party runtime dependencies and can still receive data. Hosted HTTPS dashboards cannot fetch an HTTP localhost bridge; use the dashboard locally for this demo.

## Notifications

In the phone app, open the bell, choose a 24-hour reminder time, then **Enable reminders**. Notifications request permission only after that action. **Try a reminder in 5 seconds** is the fast stage demonstration. Tap a notification to open Medication. Daily notifications are local OS-scheduled reminders and do not require a running clinic bridge. Lock-screen content deliberately omits patient and medication names.

The source data does not contain complete prescribed doses or schedules. The app therefore schedules one personal daily prompt to review the care plan, not inferred medication doses. Medication buttons are daily demo records, not a multi-dose medication administration record. Existing timestamps in source descriptions are historical synthetic clinic data. Phone settings, battery restrictions and notification permission can affect delivery. Daily time follows device-local time; re-save the time after a timezone change.

Remote push is wired for registration and notification navigation, but requires an Expo project and platform credentials:

1. Log in to your Expo account and run `npx eas-cli init` inside `mobile` to link a project. This adds the EAS project ID.
2. Configure Android FCM v1 / iOS APNs credentials for that project through EAS. iOS installation may require your Apple Developer membership and device registration.
3. Build using `npx eas-cli build --profile preview --platform android` (APK) or `--platform ios` (internal iOS distribution), and install on a physical device. For a development client use the `development` profile.
4. Choose **Register & share push token** in the installed app. Use Expo's push notification testing tool with the token. Set notification data to `{"screen":"Medication"}` to test opening Medication.

No token is sent to the unauthenticated bridge. Connecting a clinic push sender is future backend work. Remote push does not work in Expo Go; the app explains this. For installed production/preview builds, use an HTTPS bridge/backend; the local HTTP flow is intended for Expo Go on a trusted LAN.

Official references: [Expo notifications](https://docs.expo.dev/versions/latest/sdk/notifications/), [push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/), [internal distribution](https://docs.expo.dev/build/internal-distribution/).

## Design

The clinic's forest-green identity carries into a warm, minimal patient interface: generous spacing, a single primary action per card, consistent rounded controls, plain-language labels, large touch targets, labeled mood faces (not color alone), and immediate confirmation. Custom plant and face illustrations are SVG components, not external assets. Source: [58 rules for beautiful UI design](https://uxdesign.cc/58-rules-for-stunning-and-effective-user-interface-design-ea4b93f931f6).

## Validation

```powershell
# Inside mobile
npm run typecheck
npm test
npx expo export --platform all --no-bytecode

# Repository root
npm run test:demo
```

`--no-bytecode` validates Android/iOS JavaScript bundles when a sandbox blocks spawning Hermes. It is not a native release build and should not replace a physical-device test. Normal EAS builds should use Hermes bytecode.

Verified during implementation: mobile TypeScript, five model tests, bridge persistence/idempotency/concurrent submission integration test, all three JavaScript exports, browser check-in/save/reload, medication logging, and delivery to the bridge. Native notification delivery and signed installations still need a physical-device check. The root administrator's existing lint errors (MessagesCenter / PatientProfileView), absent Cloudflare worker types, and Windows sandbox `spawn EPERM` production-build restriction are separate from the mobile checks.

## Two-minute presentation

1. Open Sophia's Today screen: “Recovery doesn't end at discharge.”
2. Select a face, choose pain, add a short note and complete the check-in.
3. Show the new entry in the administrator Patient app inbox.
4. Record a medication, then demonstrate a five-second notification on the phone.
5. Open My plan and Care team: “A daily connection between the patient and their care team.”

Describe this as a working synthetic-data prototype. It does not diagnose, triage automatically, monitor emergencies, or replace a prescribed care plan.

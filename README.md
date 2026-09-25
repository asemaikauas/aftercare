# CareMinute

CareMinute is a clinic-side command center for post-discharge care. It helps care
managers understand which patients need attention, why they were prioritized,
and what approved follow-up action can happen next.

## Patient mobile app

The iOS/Android patient app is in `mobile/`. It includes mood check-ins,
medication logs, phone reminders, care tasks, care-team messages, and wearable
insights. See the [mobile setup guide](mobile/README.md).

Run `npm run demo:server -- --lan` for the optional local phone-to-clinic bridge.
Incoming submissions appear in **Patient app inbox** inside **Voice check-ins**.
Use the local bridge only on a trusted network.

CareMinute is decision-support software, not a diagnostic system or an emergency
service.

## Product scope

The MVP is deliberately narrow:

1. Rank a 10-patient recovery cohort into **Critical**, **Watch**, and **Stable**.
2. Explain every prioritization with source signals rather than an opaque score.
3. Assemble procedure history, symptoms, conditions, labs, wearable trends, and care-plan adherence in one view.
4. Let staff review and approve reminders and appointment offers.
5. Keep an audit-friendly timeline of patient, data-source, AI, and staff activity.

The AI may summarize, prioritize, and draft. It does not diagnose, alter a prescribed care plan, or send clinical instructions without staff review.

## Features

- Ten post-discharge patient records
- Risk filters and patient search
- Patient-specific AI care briefs with evidence trails
- Apple Health, WHOOP, and clinic-record views
- Symptoms, conditions, procedures, laboratory results, and trend signals
- Timeline, care-plan, and clinical-record views
- Editable patient reminder approval flow
- Follow-up appointment offer approval flow
- Responsive desktop and mobile layouts
- Explicit review, provenance, and emergency-use boundaries

## The product loop

`Collect signals → detect configured changes → prioritize the queue → explain why → staff reviews → action is approved → outcome is logged`

This loop is the product. A generic chatbot is intentionally not the center of the experience.

## Production requirements

- Patient identity and consent
- Wearable authorization and data ingestion
- EHR, lab, scheduling, SMS, and push-notification connections
- Clinic-authored escalation thresholds and care pathways
- Role-based access, audit retention, tenancy, and security controls
- AI evaluation, monitoring, and human-override policies

Production deployment should be reviewed for the clinic's jurisdiction, intended use, privacy obligations, and medical-device implications before any real patient data or clinical workflow is enabled.

## Recommended next milestones

1. Validate the queue and patient-detail workflow with 5–8 care managers.
2. Choose one initial pathway, such as orthopedic recovery, rather than supporting every discharge type.
3. Define clinic-owned escalation rules and response-time expectations.
4. Build the patient check-in experience and consent flow.
5. Connect one clinical-record source and one wearable source end to end.
6. Add authentication, role-based permissions, durable records, and a complete audit log.
7. Run a silent prospective pilot before allowing patient-facing automation.

Useful success measures are time to review a high-risk patient, time to first contact, missed-task recovery, alert precision, staff workload per patient, unplanned escalation, and readmission outcomes.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Use `npm run build` for a production build and `npm test` for the server-rendered smoke tests.

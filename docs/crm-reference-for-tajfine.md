# CRM reference for Tajfine

## Logic

```text
formulaire → tags/champs → workflow GHL → un seul pipeline
```

## Tags

Mandatory format: lowercase with underscores.

```text
source-site-premium
intent_training
intent_private_session
intent_partnership
status_prospect
status_customer
priority_cold
priority_warm
priority_hot
lang_fr
lang_es
lang_en
campaign_hotels_resorts
campaign_training
campaign_private_sessions
campaign_spas_institutes
geo_country_mexique
geo_city_mexico_city
segment_hotel
segment_villa
segment_spa
segment_praticien
human_takeover_needed
```

Forbidden:

```text
intent-training
intent training
segment-hotel
intent_mini_stage
```

## Exact Intention Field Values

```text
Private Session
Training
Workshop
Hospitality Partner
Partnership
Other
```

## Existing GHL Fields

```text
Main Objective
Main Obstacle
Prior Experience
Readiness
Timing / Urgency
Current Location
Zones of Interest
Chosen Format
Session Location Preference
Known Contraindication
Pre-Session Notes
Qualification Score
Role / Function
Company / Establishment
Establishment Type
Number of Participants
Duration
Has Space to Host Training
Current Practice Summary
Current Session Price
Internal Notes
Webinar Date
Form Language
Marketing Consent
OK to Use Informal Tone
Other (Please Specify)
```

No new GHL field may be created without explicit validation.

## Field Roles and Writers

| Field | Role | Written by |
| --- | --- | --- |
| Intention | Canonical request type used by GHL workflows. | Official form, Body Reset Fix |
| Main Objective | Main qualified need or objective. | Official form, Body Reset Fix |
| Main Obstacle | Principal blocker when explicitly collected. | Future validated form only |
| Prior Experience | Training/practice level when supplied. | Official form |
| Readiness | Real preparation or investment answer only. | Official form when explicitly collected |
| Timing / Urgency | Desired timing or urgency. | Official form, Body Reset Fix |
| Current Location | Current city, venue, or service location. | Official form, Body Reset Fix |
| Zones of Interest | Body zones or topic zones when explicitly collected. | Future validated form only |
| Chosen Format | Chosen booking/training format only when selected. | Booking/landing forms when explicit |
| Session Location Preference | Consultorio/domicilio preference. | Body Reset Fix |
| Known Contraindication | Medical/safety note when explicitly collected. | Future validated form only |
| Pre-Session Notes | Operational availability and contact notes before a session. | Body Reset Fix |
| Qualification Score | Internal scoring when validated. | Future CRM automation only |
| Role / Function | Professional role of the requester. | Official form |
| Company / Establishment | Organization, hotel, villa, spa, or company name. | Official form |
| Establishment Type | Hospitality or venue type. | Official form |
| Number of Participants | Workshop/training participant count. | Official form |
| Duration | Explicit chosen session or workshop duration. | Booking/landing forms when explicit |
| Has Space to Host Training | Hosting capacity for training. | Future validated form only |
| Current Practice Summary | Training profile or practice summary. | Official form |
| Current Session Price | Current price when explicitly collected. | Future validated form only |
| Internal Notes | Internal CRM-only notes. | Future CRM automation only |
| Webinar Date | Webinar date when a webinar path exists. | Future validated form only |
| Form Language | Source form language. | Official form, Body Reset Fix |
| Marketing Consent | Explicit marketing consent only. | Future validated form only |
| OK to Use Informal Tone | Tone permission when explicitly collected. | Future validated form only |
| Other (Please Specify) | Only `Other` intent or explicit “Autre/Otro/Other” answer. | Official form |

## Pipelines

```text
Prospection      → intention non qualifiée
Transmission     → intent_training
Séances          → intent_private_session
Interv. pro      → intent_partnership
```

A contact must never remain in two pipelines after routing.

## Form to Workflow to Pipeline

```text
Official form
→ /api/lead
→ source-site-premium + lang_* + fields Intention/Form Language/Main Objective
→ GHL workflow derives intent_* tags from Intention
→ Prospection, Transmission, Séances or Interv. pro
```

```text
Body Reset Fix
→ /api/lead
→ source-site-premium + intent_private_session + lang_es + geo_country_mexique + geo_city_mexico_city + campaign_private_sessions when CDMX routing applies
→ required fields Intention/Form Language/Main Objective/Pre-Session Notes/Session Location Preference/Current Location
→ GHL private-session workflow
→ Séances
```

If a required GHL field is missing, `/api/lead` keeps the local lead and any created contact, returns `ghlStatus: partial`, records `GHL_REQUIRED_CUSTOM_FIELDS_MISSING`, and requires human takeover or admin retry. Use `human_takeover_needed` only from a validated workflow or manual CRM action.

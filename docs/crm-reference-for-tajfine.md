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
segment_hotel
segment_villa
segment_spa
segment_praticien
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

## Pipelines

```text
Prospection      → intention non qualifiée
Transmission     → intent_training
Séances          → intent_private_session
Interv. pro      → intent_partnership
```

A contact must never remain in two pipelines after routing.

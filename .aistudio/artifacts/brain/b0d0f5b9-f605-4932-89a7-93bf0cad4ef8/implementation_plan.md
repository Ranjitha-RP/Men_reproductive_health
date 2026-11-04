# Aegis Men's Health — Proactive Male Reproductive Screening & Smart Triage

A culturally sensitive, zero-knowledge digital "Front Door" that shifts male reproductive health from late-stage clinical crisis to early, stigma-free preconception screening, explainable risk insights, and guided specialist care—crafted in the calm, luxury-editorial visual language of your reference design with bespoke male photography.

## User Review & Critical Decisions

> [!IMPORTANT]
> Review the confirmed product and design choices below. Once you click **Proceed**, we will generate the bespoke male photography assets and build the complete interactive application.

- **Confirmed Layout & Flow**: **Unified Editorial + Clinical Suite Experience** — The page opens with the serene, high-trust editorial landing experience inspired by your reference (frosted hero sanctuary, 4-metric clinical proof strip, 3-step care journey, and 4-pillar men's health showcase featuring male photography) and flows directly into the interactive **5-Tab Aegis Clinical Workspace** and consultation booking module.
- **Confirmed Localization**: **Full Bilingual English & Arabic (`العربية`) with True RTL** — Every editorial section, intake question, explainable risk rationale, triage pathway, privacy control, and judge metric switches seamlessly between English (`LTR`) and culturally respectful Modern Standard Arabic (`RTL`).
- **Confirmed Privacy Decoy ("Quick Exit")**: **Instant Daily Business & Weather Brief** — Clicking **Quick Exit** (or pressing `Esc` twice) immediately replaces the entire viewport with a neutral regional business, market, and weather news reader ("Gulf Morning Brief") with zero reproductive health terminology visible, paired with a discreet footer restore action so evaluators can return safely.
- **Browser-Native Execution**: Built as a self-contained, zero-dependency client-side React + TypeScript + Tailwind CSS + Framer Motion single-page application so all 3 Judge Personas, OCR lab simulation, PIN lock, QR clinical handoff, and state resets respond instantaneously in preview and deploy anywhere in one click.

---

## 1. Overview & Core Concept

- **What It Does**: Provides men and couples planning for family wellness with an anonymous, clinically structured 5-pillar fertility and reproductive risk screening wizard, translates inputs into transparent, non-diagnostic risk explanations, checks for urgent urological red flags, routes users to tiered care pathways (self-care, home semen kit + teleconsult, or UAE specialist booking), and gives patients granular cryptographic-style control over what a clinician sees.
- **Target Audience / Personas**:
  - *Men & Couples*: Seeking discreet preconception wellness guidance or investigating subtle symptoms without social stigma or identity exposure.
  - *Clinicians (Andrologists / Urologists)*: Receiving structured, pre-screened, anonymized referral summaries via QR/PIN handoff.
  - *Hackathon Judges*: Evaluating clinical impact, algorithmic fairness, cultural sensitivity, and end-to-end UX across three one-click simulated personas.
- **Key Value**: Compresses the typical ~180-day delayed male fertility evaluation cycle down to 3 days through privacy-by-design intake and intelligent risk triage.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Arrival & Judge Persona Toolbar**: Users arrive at a calm, sanctuary-style header and hero. A dedicated **Judge Demo Suite** bar allows evaluators to switch live between **Persona A (Low Risk — Preconception Wellness)**, **Persona B (Moderate Risk — Metabolic & Thermal Exposure)**, and **Persona C (High Risk — Varicocele & Clinical History)**—instantly updating every tab, score, explanation, and triage recommendation across the app.
2. **Editorial Discovery (Reference-Matched Aesthetic)**: Visitors explore the 3-step clinical process (`01` Discreet Intake, `02` Explainable Screening, `03` Guided Care) and 4 specialized male health pillars illustrated with warm, natural-light photography of men in calm home and consultation environments.
3. **5-Tab Clinical Workspace**:
   - **Tab 1 — Discreet Intake ("The Front Door")**: Features a Zero-Knowledge Mode assurance banner, an interactive **Local PIN / Biometric Screen Lock** simulator, and a 5-step guided wizard (Lifestyle & Thermal, Metabolic Health, Anatomical & Varicocele Check, Infectious History, and Drag-and-Drop Lab OCR Simulator with one-click sample biomarker parsing).
   - **Tab 2 — Explainable Risk Report**: Displays a clear *"Educational Risk Screening Tool — Not a Medical Diagnosis"* notice, overall risk tier indicator, itemized human-readable explanations connecting specific combinations of inputs (e.g., thermal load + elevated BMI) to physiological mechanisms, 4-pillar score bars, and culturally tailored family wellness guidance.
   - **Tab 3 — Smart Triage & Care Router**: Runs an active **Red Flag Emergency Guardrail** (detecting acute severe pain, sudden swelling, or hematospermia to trigger a high-contrast Emergency Clinical Evaluation modal) and unlocks tailored pathways: downloadable 90-day preconception plan (Low Risk), At-Home Semen Kit & Teleconsult booking simulator (Moderate Risk), or Abu Dhabi / Dubai Andrologist & Urologist appointment booking with pre-filled anonymized referral notes (High Risk).
   - **Tab 4 — Privacy & Consent Control Center**: Offers a live **Granular Data Sharing Matrix** (toggle visibility of Metabolic, Lifestyle, Anatomical, Lab Data, and Identity Masking), dynamically updates an encrypted **Masked Clinical Summary** with a scannable SVG QR code and 6-digit clinician PIN, and provides a one-click **Purge All Local Data** ("Right to be Forgotten") action with instant reset confirmation.
   - **Tab 5 — Evaluator & Impact Dashboard**: Showcases quantified KPIs (`~180d → 3d` Time to Evaluation, `89.4%` Completion Rate, `94%` Cultural Privacy Trust), a visual side-by-side flowchart comparing the *Traditional Late-Stage Path* against the *Aegis Proactive Prevention Path*, and an *Algorithmic Fairness & Calibration* breakdown across diverse demographic groups.
4. **Instant Privacy Escape**: At any moment, clicking **Quick Exit** swaps the DOM to a neutral daily business & weather publication until discreetly restored.

### Visual Identity & Theme
- **Aesthetic Direction**: Quiet clinical luxury and warm architectural sanctuary—modeled directly after your uploaded WREN reference, trading sterile hospital tropes for sunlit interiors, frosted glass surfaces, generous whitespace, and editorial restraint.
- **Color Palette & Mood** (60-30-10 discipline):
  - *60% Neutral Canvas*: Crisp Porcelain White (`#FFFFFF`) alternating with Cool Sanctuary Mist (`#F3F6FA`).
  - *30% Structural Surfaces & Typography*: Deep Slate Navy (`#0F172A`) for primary ink, Muted Slate (`#475569`) for secondary prose, and subtle `1px` cool hairline borders (`#E2E8F0`).
  - *10% Focused Accents & Semantic Clinical States*:
    - Primary Brand Action: Deep Aegean Clinical Blue (`#1B5683`, hover `#154468`)
    - Editorial Serif Emphasis: Warm Burgundy Rosewood (`#7F3D4B`) for italic headline keywords
    - Low Risk / Nominal: Emerald (`#059669`) paired with explicit status icon & text
    - Moderate Risk / Caution: Warm Amber (`#D97706`) paired with explicit status icon & text
    - High Risk / Emergency Guardrail: Soft Crimson (`#DC2626`) paired with alert iconography & high-contrast modal surface
- **Typography & Hierarchy**:
  - *Display Headlines*: `Cormorant Garamond` (regular & expressive italic accents, `clamp(2.25rem, 4vw, 3.75rem)`, `text-wrap: balance`).
  - *UI, Navigation & Clinical Body*: `Plus Jakarta Sans` (clean geometric legibility at 14px–16px) paired with `Noto Sans Arabic` when switched to `العربية` (`dir="rtl"`).
  - *Metrics, Biomarkers & Access PINs*: `JetBrains Mono` / `tabular-nums` for vertical alignment across scores, lab values, and KPI figures.
- **Interactive Feedback & Motion**: Smooth `<200ms` tab crossfades, animated step progress bars, tactile toggle switches, interactive modal transitions via Framer Motion (`transform` and `opacity` only), and zero-broken-image fallbacks on all photography cards.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Blending Reference Editorial Layout with the 5-Tab Clinical Engine**
  - *Chosen Approach*: Place the WREN-inspired Hero, Metrics Strip, and 3-Step / 4-Service Men's Health narrative seamlessly unified with an anchored, full-width **Interactive Clinical Suite** housing all 5 hackathon tabs and the Judge Persona switcher.
  - *Why*: Delivers the exact calm, trustworthy visual first impression from your reference image while keeping every hackathon evaluation requirement (5-step wizard, explainable report, triage router, privacy matrix, and judge analytics) one click away without page reloads.
  - *Alternatives Considered*: Hiding the 5-tab dashboard behind a separate route—passed over because judges benefit from immediate visibility of the persona switcher and clinical tabs alongside the brand front door.
- **Decision 2: Deterministic Client-Side Explainable Risk Engine**
  - *Chosen Approach*: Compute pillar sub-scores (Lifestyle, Metabolic, Anatomical, Infectious + OCR Biomarkers) and human-readable clinical rationales deterministically in React state on every input change or persona switch.
  - *Why*: Guarantees sub-millisecond reactivity, 100% zero-knowledge local execution (no health inputs transmitted over the network), deterministic reproducibility for hackathon judges, and zero external API setup friction.
- **Decision 3: Bespoke Male Editorial Photography**
  - *Chosen Approach*: Generate custom, warm architectural and lifestyle photography featuring men (telehealth consultation at home, calm wellness routine, clinician conversations, and male physician avatars) matching the natural window-lit tone of the reference image.
  - *Why*: Directly fulfills your requirement to mirror the reference's visual warmth while replacing all female imagery with culturally respectful, authentic male health photography.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Application State & Localization Provider                │
│  • Active Language (EN LTR / AR RTL)   • Quick Exit Decoy State (Active/Off) │
│  • Active Persona (A / B / C / Custom) • Screen Lock State (PIN / Unlocked)  │
│  • 5-Pillar Intake + Lab OCR State     • Consent Matrix & Erasure Engine     │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
          ┌────────────────────────────┴────────────────────────────┐
          ▼                                                         ▼
┌───────────────────────────────────┐     ┌────────────────────────────────────┐
│  Quick Exit Decoy View            │     │  Aegis Men's Health Experience     │
│  ("Gulf Morning Brief" News/Mkts) │     │  • Top Navigation & Quick Exit     │
│  • Zero medical terms in DOM      │     │  • Judge Persona Switcher Toolbar  │
│  • Discreet restore trigger       │     └─────────────────┬──────────────────┘
└───────────────────────────────────┘                       │
                       ┌────────────────────────────────────┼──────────────────┐
                       ▼                                    ▼                  ▼
        ┌──────────────────────────────┐   ┌───────────────────────────┐  ┌────────────┐
        │ Editorial Front Door (WREN)  │   │ 5-Tab Clinical Workspace  │  │ Modals &   │
        │ • Frosted Sanctuary Hero     │   │ 1. 5-Step Intake + OCR    │  │ Guardrails │
        │ • 4-Metric Proof Strip       │   │ 2. Explainable Risk Rpt   │  │ • Red Flag │
        │ • 01-03 Process Cards (Men)  │   │ 3. Smart Triage & Booking │  │   Alert    │
        │ • 4 Men's Health Service Cds │   │ 4. Privacy & QR Summary   │  │ • PIN Lock │
        │ • Care Plans & Consult Card  │   │ 5. Judge Impact Analytics │  │ • Purge    │
        └──────────────────────────────┘   └───────────────────────────┘  └────────────┘
```

### Data Model & State
- **Intake Profile Store**: Holds structured values for Pillar 1 (`heatExposureHours`, `saunaFrequency`, `sleepHours`, `stressLevel`, `smokingStatus`, `alcoholIntake`), Pillar 2 (`bmiCategory`, `hba1cStatus`, `bpFlag`, `lipidFlag`), Pillar 3 (`dullAche`, `heaviness`, `visibleSwelling`, `cryptorchidismHistory`, `traumaHistory`, plus acute red flags `severeAcutePain`, `acuteSwelling`, `hematospermia`), Pillar 4 (`postPubertyMumps`, `stiHistory`, `chronicPelvicInfection`), and Pillar 5 (`uploadedLabFile`, `parsedConcentration`, `parsedMotility`, `parsedTestosterone`, `parsedFsh`).
- **Live Risk Derivation**: Pure calculation hook computing numerical sub-scores (`0–100`) per pillar, overall classification (`low` | `moderate` | `high`), acute `hasRedFlag` boolean, and an array of localized `ExplainableFactor` objects detailing trigger inputs, physiological rationale, and actionable mitigation.
- **Consent & Masked Summary Store**: Tracks boolean sharing permissions per category (`shareMetabolic`, `shareLifestyle`, `shareAnatomical`, `shareInfectious`, `shareLabs`, `maskIdentity`), generating a live redacted clinical JSON/text digest, rotating 6-digit access PIN, and deterministic SVG QR matrix.

### Interactive Component & State Mapping
- **Judge Persona Switcher**: Selecting Persona A, B, or C populates all 5 intake pillars with clinically realistic preset profiles, updates the OCR lab state, recalculates the risk report and triage tier, and flashes a subtle confirmation toast. Editing any field manually transitions the mode to *Custom Live Profile*.
- **Screen Lock & Quick Exit**: Enabling the PIN lock presents a 4-digit keypad overlay that masks clinical tabs until unlocked; clicking **Quick Exit** swaps the root view to the neutral business/weather portal in `<50ms`.
- **Lab OCR Upload**: Dropping a file or clicking *Simulate Sample Upload* runs a brief scanning progress state (`600ms`) and populates realistic hormone and semen parameters directly into the live risk engine.
- **Smart Triage & Specialist Booking**: Toggling an acute red flag symptom immediately opens the high-contrast *Emergency Clinical Evaluation* guardrail modal. Within tiered care, users can customize/download a preconception checklist, simulate ordering a discreet home kit, or select an Abu Dhabi / UAE urologist/andrologist time slot with pre-filled anonymized referral notes and instant booking confirmation.
- **Right to be Forgotten**: Clicking *Purge All Local Data* opens a confirmation dialog that wipes all intake answers, uploaded lab state, bookings, and PINs back to a clean zero-knowledge baseline.

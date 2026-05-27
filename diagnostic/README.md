# Fierce Diagnostic

A premium, conversation-style diagnostic tool that helps L&D leaders identify which **Fierce** workshop module best fits their team — and books the session.

Built to be sent to interested prospects after initial outreach. The tool itself models the Fierce brand: bold, direct, and conversation-shaped (not survey-shaped).

## What it does

1. **Front-end** — A 5-question diagnostic styled like a fierce conversation, not a SurveyMonkey quiz. ~4 minutes per prospect.
2. **Scoring engine** — Maps responses to **5 archetypes** that cleanly cover all 16 Fierce modules, then picks the best-fit module within the top archetype.
3. **Recommendation reveal** — On-brand, animated. Names the archetype, recommends a primary + secondary module.
4. **Booking** — Embedded scheduler so the prospect books the master facilitator immediately.
5. **Sales briefing** — Every submission generates a structured briefing (recommendation + verbatim quotes + pain themes + urgency) sent to the facilitator and rep so they walk into the call already prepared.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS** for styling
- **Vercel** for hosting

No database in v1 — submissions log to the server console and (optionally) post to a webhook.

## Quick start

```bash
cd /Users/jessicatolon/Projects/fierce-diagnostic
npm install
npm run dev
```

Then open http://localhost:3000.

## Configuration

Copy `.env.example` to `.env.local` and fill in (both optional in Phase 1):

```env
SUBMISSION_WEBHOOK_URL=     # Slack incoming webhook or custom briefing endpoint
NEXT_PUBLIC_CALENDLY_URL=   # Master facilitator's Calendly link
```

If you leave them blank, submissions just print to the server console and the booking page shows a placeholder.

## The 5 archetypes

| Archetype | Modules in cluster |
|---|---|
| **Hard Conversations Aren't Happening** | Confront, Feedback, Accountability |
| **Decisions Don't Stick** | Team, Alignment, Collaboration |
| **Managers Fix Instead of Develop** | Coach, Delegate, Active Listening, Foundations |
| **Navigating Change Without Authority** | Influence, Change Management, Awareness |
| **The Human Side Is Fraying** | Emotion, Resilience, Generations |

Tweak the chip → archetype scoring in `lib/archetypes.ts` and the picker logic in `lib/scoring.ts`.

## Project structure

```
app/
  layout.tsx              # Inter font, dark theme, grain overlay
  page.tsx                # State machine: intro → context → questions → recommendation → scope → booking
  globals.css             # Fierce brand tokens, chip / button / input styles
  api/submit/route.ts     # Receives full submission, formats sales briefing, posts to webhook
components/
  BrandFrame.tsx          # Logo, progress bar, glow backdrop, corner triangles
  IntroStage.tsx          # Landing screen
  ContextStage.tsx        # Name / email / company / role / team size
  QuestionStage.tsx       # Renders any question type (text, chips_single, chips_multi)
  RecommendationStage.tsx # The reveal screen
  ScopeStage.tsx          # Workshop format + window + notes
  BookingStage.tsx        # Calendly embed + saved confirmation
lib/
  types.ts                # All shared types
  archetypes.ts           # 5 archetypes, 16 modules, 5 questions, chip → score mapping
  scoring.ts              # Score answers → primary/secondary archetype + module + pain themes + urgency
```

## Phase 2 (next session)

- Real Calendly embed
- Slack webhook for the briefing
- Vercel deploy with env vars set

## Phase 3 (later)

- Salesforce native API integration (create Lead + Task + Notes)
- PDF version of the sales briefing
- Admin dashboard with submissions over time, archetype distribution, conversion rate to booked

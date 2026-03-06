# Content System Architecture

## Objective
Create a content operating system that can move quickly in ideation, stay lightweight in coordination, and remain rigorous at ship time.

## Core Principle
Experiment anywhere.
Approve deliberately.
Ship only from canonical sources.

## Stack By Responsibility

| Domain | Working Surface | Canonical Surface | Runtime Surface |
| --- | --- | --- | --- |
| Briefs and campaign intent | Notion | Notion | n/a |
| Heavy research, decks, media, transcripts | Google Drive | Google Drive | n/a |
| Brand architecture and process rules | GitHub docs | `docs/` | n/a |
| Approved reusable copy | Notion draft + GitHub promotion | `packages/content/` | `apps/*` |
| Visual exploration and component intent | Figma | Figma + GitHub references | `apps/*` |
| Dynamic operational content | Notion draft + GitHub contract | Supabase after contract approval | app/runtime delivery |
| Release execution and sequencing | Linear | Linear | Vercel previews and production |

## Artifact Homes

### Notion
- PRDs
- campaign briefs
- content calendars
- decision context
- editorial approval states
- lightweight indices linking to Drive, Figma, Linear, and GitHub

### Google Drive
- large PDFs
- decks
- founder notes
- research interviews
- transcripts
- exported assets
- archival materials that are too heavy for Notion

### GitHub
- approved messaging architecture
- copy libraries and content contracts
- architecture documents
- runbooks
- ADRs
- prompt packs and repeatable workflows

### Supabase
- dynamic content that must be editable or routed at runtime
- governed schemas for lifecycle messaging, prompts, or operational publishing
- audit-friendly content records once the model is stable

## Promotion Model
1. Shape intent in Notion.
2. Store heavy supporting material in Google Drive.
3. Explore visual expression in Figma.
4. Create execution scope in Linear.
5. Promote approved reusable content into `packages/content/`.
6. Wire the consuming surface in `apps/*`.
7. Deploy previews through Vercel.
8. Move dynamic content to Supabase only when runtime editing is a real requirement.

## Static Vs Dynamic Content

### Static or versioned copy
Use `packages/content/` when the copy is:
- homepage or subpage messaging
- product copy that ships with the app
- CTA libraries
- proof points
- approved brand language
- reusable campaign copy blocks

### Dynamic or operational copy
Use Supabase when the copy is:
- notification templates
- in-app prompts that need live updates
- campaign experiments controlled by data or audience rules
- lifecycle messaging that needs scheduling or operational editing

Static truth should exist first.
Dynamic truth should only exist after there is a stable contract for it.

## Folder Model In The Repo
- `packages/content/` approved content contracts and reusable copy libraries
- `docs/brand/` narrative system, naming hierarchy, voice and claim rules
- `docs/workflows/` how content and design move from draft to ship
- `docs/integrations/` tool-specific rules and failure modes
- `docs/adr/` durable decisions about the stack

## Non-Negotiables
- No shipping copy should exist only in Notion.
- No heavy asset should be duplicated across Notion and Git without a reason.
- No production messaging should be sourced directly from Figma text layers.
- No dynamic content model should go into Supabase without a documented contract and owner.

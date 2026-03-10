# Figma Calibration Loop

Owner: `@marketing`
Date: `2026-03-10`
State: `active`

Depends on:
- [233-homepage-creative-interrogation.md](/Users/daniel/Documents/integration/marketing/233-homepage-creative-interrogation.md)
- [234-public-site-clean-build-doctrine.md](/Users/daniel/Documents/integration/marketing/234-public-site-clean-build-doctrine.md)
- [235-public-site-design-deliverables-matrix.md](/Users/daniel/Documents/integration/marketing/235-public-site-design-deliverables-matrix.md)
- [236-launch-spine-and-trust-chain-design-run.md](/Users/daniel/Documents/integration/marketing/236-launch-spine-and-trust-chain-design-run.md)

## Purpose
- define how Figma should be used in the public-site design run without letting Figma become the source of truth

## Rule
- Figma is used for calibration, comparison, and review
- doctrine, route hierarchy, family behavior, and implementation authority remain in the repo and harmony pack

## Inputs Required From Design / Asset Lanes
- Figma file URL or file key
- node URLs for:
  - homepage hero
  - Launch Spine sections
  - first Trust Chain sections
  - transition/auth surfaces if designed
- declared family placement for each node
- linked asset family or candidate asset pack

## Questions Figma Must Answer
### Hero
- does the hero prove category and feeling without over-explaining?
- is the hero still coherent when motion is removed?
- is the asset carrying the right burden versus typography and atmosphere?

### Launch Spine
- do `/`, `/pricing`, and `/enter` feel like one family?
- is the CTA path calm and obvious?
- does the page feel like one company and one intelligence?

### Trust Chain
- do `/product`, `/method`, `/proof`, and `/authority` feel like one trust sequence?
- does clarity outrank spectacle?
- does each page keep one dominant idea per section?

### Support Depth
- does support depth remain quieter than the launch spine and trust chain?
- does it deepen trust without reading like a paper on first screen?

## Required Outputs From Calibration
- mismatch list
- family compliance notes
- hero/media burden notes
- copy envelope pressure notes
- asset-family placement adjustments
- explicit keep / change / remove decision list

## What Figma Must Not Do
- define route hierarchy
- redefine product truth
- create page-specific aesthetics that break family behavior
- silently harden hero/media doctrine while `DQ-003` is still conditional

## Handoff Back Into The Repo
When calibration is complete, the design lane should return:
1. node links
2. mismatch list
3. keep/change/remove list
4. any new asset needs by family role
5. any copy-envelope changes required

Marketing then updates the family packet and Linear issue state.

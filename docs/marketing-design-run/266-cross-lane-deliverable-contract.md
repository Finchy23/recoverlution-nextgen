# 266 Cross-Lane Deliverable Contract

Purpose: define what asset, copy, and design need to deliver so frontend can build without reinterpreting intent.

## Asset lane must deliver
For each requested route/family asset:
- family
- source master
- poster/fallback
- allowed surfaces
- forbidden surfaces
- crop notes
- focal notes
- status: candidate or approved
- whether motion is required or optional

Frontend needs to know:
- what role the asset is playing
- whether it is hero-class or support-class
- what happens when motion is unavailable

## Copy lane must deliver
For each requested route/module:
- route
- module name
- primary line candidate(s)
- support line candidate(s)
- envelope confirmation
- claim safety note
- unresolved doctrine flags

Frontend needs to know:
- exact text burden
- max length posture
- whether a line is conditional or safe

## Design lane must deliver
For each requested route/family:
- module choreography
- hierarchy decisions
- spacing and cadence logic
- motion posture
- keep/change/remove decisions against the current live route
- Figma node references where relevant

Frontend needs to know:
- what the dominant visual move is
- what the fallback move is
- what must stay fixed across the family

## Delivery rule
If any deliverable does not state:
- route
- family
- module
- burden
then frontend should treat it as inspiration, not implementation truth.

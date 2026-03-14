# TALK Frontend Return Checklist

Last updated: 2026-03-12
Audience: frontend and Figma AI agents returning TALK shell work for package-first integration
Status: required return package for TALK shell iterations

## Purpose

Use this checklist when handing TALK shell work back for review and integration.

The goal is simple:

- reduce back-and-forth through the owner
- stop hidden assumptions from leaking into the shell
- make it obvious what is finished, what is placeholder, and what still needs runtime binding

## Required return package

Every TALK shell return should include all of these:

1. changed surface scope
- which TALK phases were touched
- which shell regions were touched

2. changed files list
- exact file paths changed
- note which files are exploratory only

3. state proof
- one screenshot or equivalent proof for each affected phase
- if a phase is intentionally not addressed, say so explicitly

4. mobile proof
- confirm phone layout for affected phases
- call out any known mobile compromise

5. motion proof
- list the key transitions changed
- call out any transition still rough or placeholder

6. accessibility check
- keyboard flow checked
- focus visibility checked
- reduced motion considered
- contrast issues called out if still unresolved

7. slot and region confirmation
- doorway
- page
- seal
- reflection
- bridge
- thread
- rest state

Mark any unresolved slot clearly by function name.

8. placeholder declaration
- list any temporary copy
- list any fake data
- list any temporary visual stand-ins

9. boundary declaration
- confirm no app-local persistence law was added
- confirm no schema detection logic was added
- confirm no prompt-evolution logic was added
- confirm no analytics contract was invented
- confirm no product routing law was invented

10. extraction note
- identify what should promote into `packages/ui/src/talk/`
- identify what should remain proving-ground-only for now

## Required review questions

Each return should answer these directly:

1. What became clearer?
2. What still feels unresolved?
3. What should remain frontend-owned?
4. What is ready for package extraction?
5. What must not be mistaken for runtime truth?

## Red flags

Do not hand back TALK work as ready if any of these are true:

- it feels more like chat than corridor
- the page behaves like a form instead of a writing surface
- the seal mechanic is visually secondary
- the bridge feels like recommendation UI
- the thread feels like analytics
- mobile collapses the hierarchy
- the implementation contains hidden backend assumptions

## Review-ready criteria

A TALK shell return is review-ready when:

- the touched phases are visually coherent
- the touched regions are clearly distinguished
- placeholders are explicitly labeled
- boundaries are declared
- extraction candidates are named
- the return package is self-explanatory without live narration

## Final instruction

Hand back the shell as a clean, bounded artifact.
Do not hand back a mystery that only makes sense in chat.

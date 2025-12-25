# Birthday Bot v3 — Technical Specifications

## 1. Purpose

Birthday Bot v3 is an experimental redesign aimed at solving architectural and stability issues accumulated in v2.

This document defines:
- technical direction
- design principles
- system boundaries

It is **not a roadmap** and **not a release promise**.

---

## 2. Core Vision

Birthday Bot v3 manages **scheduled celebrations**.

User birthdays are treated as a specific type of celebration, alongside:
- server anniversaries
- custom events

The goal is a unified, extensible, and predictable system.

---

## 3. Celebration Model

A `Celebration` represents a dated event attached to a guild.

Attributes:
- type (USER_BIRTHDAY, GUILD_BIRTHDAY, CUSTOM)
- date
- guild
- optional target (user)
- active state

All runtime logic operates on this abstraction.

---

## 4. Scheduler

- one scheduler per guild
- daily execution
- configurable execution hour
- timezone-aware
- isolated failures per guild

The scheduler contains **no premium logic**.

---

## 5. Message Templates

- defined per celebration type
- stored as JSON
- structure-only (no logic, no conditions)
- variables resolved at render time

Overrides:
- user OR role
- deterministic priority
- dashboard-managed

---

## 6. Roles, Channels & Webhooks

- roles are defined per celebration type
- channels define where messages go
- webhooks define how messages appear
- webhook failures fallback automatically to bot messages

---

## 7. Soft Deletion

All destructive actions use soft deletion:
- entities are marked as deleted immediately
- excluded from runtime logic
- permanently removed after a retention delay

This improves stability and migration safety.

---

## 8. Premium Model

- premium is owned by a user
- activated manually per guild
- limited by tier-based quotas
- no core functionality blocked

If quota is exceeded:
- extra servers enter restricted mode
- no automatic deactivation
- scheduler and existing behavior continue

Users are notified via DM once.

---

## 9. Dashboard & API

- dashboard is an alternative configuration interface
- bot exposes an internal API via @sapphire/plugin-api
- API runs in the same process as the bot
- no public API exposure

All actions map to the same internal services as Discord commands.

---

## 10. Out of Scope

- conditional template logic
- real-time analytics
- public API
- complex recurrence rules

---

## 11. Philosophy

- stability over velocity
- clarity over flexibility
- configuration over scripting
- conscious technical debt
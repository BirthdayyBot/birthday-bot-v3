# Migration v2 → v3 (Considerations)

This document explains how a migration *could* happen if v3 is validated.

It does not guarantee that a migration will occur.

---

## 1. Intent

The goal is to migrate:
- user birthdays
- server configuration
  as safely as possible.

Not all v2 behavior is guaranteed to be preserved.

---

## 2. Concept Mapping

| v2 Concept | v3 Equivalent |
|-----------|---------------|
| Birthday | Celebration (USER_BIRTHDAY) |
| Global scheduler | Per-guild scheduler |
| Announcement message | Template by type |
| Birthday role | Role per celebration type |

---

## 3. Migratable Data

Likely migratable:
- user birthdays
- guild timezone
- announcement channel
- basic message templates

Possibly not migrated:
- edge-case configurations
- deprecated flags
- legacy hacks

---

## 4. Strategy Options

- clean migration (core data only)
- partial migration with manual review
- coexistence period (v2 + v3)

No option is forced at this stage.

---

## 5. Safety Measures

- migration performed offline
- dry-run validation
- rollback possible
- no silent changes

---

## 6. Transparency

Any migration would be:
- announced in advance
- documented
- reversible where possible
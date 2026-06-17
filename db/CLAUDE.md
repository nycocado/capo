# db/ — CLAUDE.md

Raw SQL schema + seed for the MariaDB database. The DB is **not** managed by ORM migrations.

- `01-create.sql` — schema (tables, FKs, CHECKs, indexes).
- `02-insert.sql` — seed data.
- `99-drop-tables.sql` — manual teardown helper.

`01-` and `02-` are mounted into the MariaDB container's init dir and applied **only on first boot of a fresh volume**. To re-apply schema/seed changes you must `bun run docker:down` (drops the volume) then `up`, or `bun run docker:rebuild`.

MikroORM's `migrations/`, `seeders/`, and `views/` directories under `api/src/database/` are **empty stubs** — schema changes are made by editing these SQL files, then kept in sync by hand with the MikroORM entities (`api/src/database/entities/` and `api/src/modules/*/entities/`). Entity changes alone do **not** alter the DB.

## Domain model

Hierarchy: `Project → Isometric → Spool → Joint → (part1, part2 : Part)`, and `Joint → Weld`. A `Part` is a `PipeLength` **or** a `Fitting` (joined-table inheritance, shared PK). `Fitting → Port`. Revisions/sheets were dropped: each `isometric` carries its drawing PDF directly in `document`.

Three production stages, each a work-order entity that tracks one item type:

- **cut** → `cut_list` (1:1 isometric) tracks **pipe_lengths** (`to_do → in_progress → done`; `in_progress` captures `heat_number`).
- **assembly** → `assembly_list` (1:1 isometric) tracks **joints** (`to_do → done`).
- **weld** → `weld_list` (1:1 spool) tracks **welds** (`to_do → done`; capture `filler_material` + `wps`).

Each tracked item has a denormalized current `status` (native `ENUM`) **plus** an append-only audit trail in `<item>_status_event` (status, notes, created_by, created_at). The lists have **no stored status** — their progress/gating is derived from the items. Each list has `claimed_by_id` / `claimed_at` for the exclusive claim/lock.

# db/ — CLAUDE.md

Raw SQL schema + seed for MariaDB. The DB is **not** managed by ORM migrations — see the domain model in the root `CLAUDE.md`.

- `01-create.sql` — schema (tables, FKs, CHECKs, indexes).
- `02-insert.sql` — seed.
- `99-drop-tables.sql` — manual teardown.

`01-`/`02-` are mounted into the container's init dir and applied **only on first boot of a fresh volume**. To re-apply changes: `bun run docker:down` (drops the volume) + `up`, or `bun run docker:rebuild`. The `migrations/`/`seeders/`/`views/` stubs under `api/src/database/` are empty — schema changes are made by editing this SQL and keeping the MikroORM entities in sync by hand.

## Structure notes (the non-obvious)

- **Joined-table inheritance:** `pipe_length.id` and `fitting.id` are FK = PK of `part` (shared PK). A `pipe_length` is reached via `joint.part1_id`/`part2_id` — queries aggregating by pipe_length need an OR-join on both + `DISTINCT`.
- **Per-item status:** denormalized `status` native ENUM column (current state) **plus** an append-only `<item>_status_event` table (status, notes, created_by, created_at) as the audit trail. `created_by` is `SET NULL` on user delete.
- **Statusless lists:** `cut_list`/`assembly_list`/`weld_list` store no status — only `internal_id`, the 1:1 (`UNIQUE`) FK to isometric/spool, and `claimed_by_id`/`claimed_at` (the lock). Progress and gating are derived in the query.
- `isometric.document` holds the PDF (no sheet/rev).

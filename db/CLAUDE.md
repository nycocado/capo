# db/ — CLAUDE.md

Raw SQL schema + seed for the MariaDB database. The DB is **not** managed by ORM migrations.

- `01-create.sql` — schema (tables, indexes).
- `02-insert.sql` — seed data.
- `99-drop-tables.sql` — manual teardown helper.

`01-` and `02-` are mounted into the MariaDB container's init dir and applied **only on first boot of a fresh volume**. To re-apply schema/seed changes you must `bun run docker:down` (drops the volume) then `up`, or `bun run docker:rebuild`.

MikroORM's `migrations/`, `seeders/`, and `views/` directories under `api/src/database/` are **empty stubs** — schema changes are made by editing these SQL files, then kept in sync by hand with the MikroORM entities (`api/src/database/entities/` and `api/src/modules/*/entities/`). Entity changes alone do **not** alter the DB.

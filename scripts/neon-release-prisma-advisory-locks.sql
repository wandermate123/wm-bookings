-- Use when `prisma migrate deploy` fails with P1002 (advisory lock timeout).
--
-- 1) Best: Neon Dashboard → branch → "Restart compute" (clears stuck locks).
--
-- 2) Solo dev only — disconnect every OTHER session on this database:
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();

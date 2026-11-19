-- Supabase default privileges can give authenticated roles table-level access
-- beyond CRUD. TRUNCATE is not governed by row-level security.
revoke truncate, references, trigger on table public.workspaces from authenticated;

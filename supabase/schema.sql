-- Spusť tohle v Supabase: Project -> SQL Editor -> New query -> vlož a spusť.

create table if not exists app_state (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into app_state (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table app_state enable row level security;

-- Kdokoliv přihlášený (magickým odkazem) může číst a zapisovat sdílená data appky.
-- Appka je pro malý důvěryhodný tým, proto je zabezpečení na úrovni "přihlášený = má přístup".
create policy "authenticated can read app_state"
on app_state for select
to authenticated
using (true);

create policy "authenticated can update app_state"
on app_state for update
to authenticated
using (true)
with check (true);

create policy "authenticated can insert app_state"
on app_state for insert
to authenticated
with check (true);

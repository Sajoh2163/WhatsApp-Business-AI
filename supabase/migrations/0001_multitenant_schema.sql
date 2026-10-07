create extension if not exists vector;
create type member_role as enum ('owner','admin','agent');
create type order_status as enum ('new','confirmed','processing','shipped','delivered','cancelled');
create table users (id uuid primary key references auth.users on delete cascade, email text not null, full_name text, created_at timestamptz default now());
create table organizations (id uuid primary key default gen_random_uuid(), name text not null, slug text unique, business_type text, description text, opening_hours jsonb default '{}', is_demo boolean default false, onboarding_step int not null default 1, onboarding_data jsonb not null default '{}', onboarding_completed_at timestamptz, created_by uuid references users(id), created_at timestamptz default now());
create table organization_members (organization_id uuid references organizations on delete cascade, user_id uuid references users on delete cascade, role member_role not null default 'agent', primary key (organization_id, user_id));
create table customers (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, name text, phone text not null, tags text[] default '{}', notes text, created_at timestamptz default now(), unique (organization_id, phone));
create table conversations (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, customer_id uuid not null references customers, mode text not null default 'ai' check (mode in ('ai','human')), status text default 'open', assigned_to uuid references users, last_message_at timestamptz default now(), created_at timestamptz default now());
create table messages (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, conversation_id uuid not null references conversations on delete cascade, sender text not null check (sender in ('customer','ai','human')), body text, external_id text, delivery_status text default 'sent', created_at timestamptz default now());
create table products (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, name text not null, description text, price_cents int not null, currency text default 'USD', stock int, category text, image_url text, active boolean default true, created_at timestamptz default now());
create table orders (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, customer_id uuid references customers, number int, status order_status default 'new', total_cents int default 0, created_at timestamptz default now());
create table order_items (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, order_id uuid not null references orders on delete cascade, product_id uuid references products, quantity int not null, unit_price_cents int not null);
create table appointments (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, customer_id uuid references customers, starts_at timestamptz not null, ends_at timestamptz, status text default 'pending', external_calendar_id text);
create table automations (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, name text not null, trigger jsonb not null, conditions jsonb default '[]', actions jsonb not null, enabled boolean default true);
create table automation_runs (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, automation_id uuid references automations on delete cascade, status text, error text, created_at timestamptz default now());
create table knowledge_documents (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, kind text not null, title text, content text, source_url text, created_at timestamptz default now());
create table knowledge_chunks (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, document_id uuid references knowledge_documents on delete cascade, content text not null, embedding vector(1536));
create table ai_settings (organization_id uuid primary key references organizations on delete cascade, personality text default 'friendly', language text default 'en', instructions text, response_style text default 'balanced', handoff_rules jsonb default '[]');
create table whatsapp_accounts (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, phone_number_id text unique not null, waba_id text, token_secret_ref text, status text default 'disconnected');
create table notifications (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, user_id uuid references users, type text, body text, read_at timestamptz, created_at timestamptz default now());
create table subscriptions (organization_id uuid primary key references organizations on delete cascade, plan text not null default 'free' check (plan in ('free','starter','business','pro')), status text default 'active', provider text, provider_ref text, current_period_end timestamptz);
create table usage_records (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, metric text not null, quantity int default 1, period date not null default current_date);
create table audit_logs (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations on delete cascade, user_id uuid, action text not null, entity text, entity_id uuid, meta jsonb, created_at timestamptz default now());

create function is_member(org uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from organization_members where organization_id = org and user_id = auth.uid()) $$;
create function has_role(org uuid, roles member_role[]) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from organization_members where organization_id = org and user_id = auth.uid() and role = any(roles)) $$;
create function create_organization(org_name text) returns uuid language plpgsql security definer set search_path = public as $$
declare oid uuid; begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  insert into organizations(name, created_by) values (org_name, auth.uid()) returning id into oid;
  insert into organization_members values (oid, auth.uid(), 'owner');
  insert into subscriptions(organization_id) values (oid);
  insert into ai_settings(organization_id) values (oid);
  return oid; end $$;

do $$ declare t text; begin
  foreach t in array array['customers','conversations','messages','orders','order_items','appointments','notifications','products','automations','automation_runs','knowledge_documents','knowledge_chunks','usage_records','audit_logs','organization_members','whatsapp_accounts'] loop
    execute format('create index on %I (organization_id)', t); end loop;
  foreach t in array array['users','organizations','organization_members','customers','conversations','messages','orders','order_items','appointments','notifications','products','automations','automation_runs','knowledge_documents','knowledge_chunks','ai_settings','whatsapp_accounts','subscriptions','usage_records','audit_logs'] loop
    execute format('alter table %I enable row level security', t); end loop;
  foreach t in array array['customers','conversations','messages','orders','order_items','appointments','notifications'] loop
    execute format('create policy %I on %I for all using (is_member(organization_id)) with check (is_member(organization_id))', t||'_rw', t); end loop;
  foreach t in array array['products','automations','automation_runs','knowledge_documents','knowledge_chunks','ai_settings','subscriptions','usage_records'] loop
    execute format('create policy %I on %I for select using (is_member(organization_id))', t||'_r', t);
    execute format('create policy %I on %I for all using (has_role(organization_id, array[''owner'',''admin'']::member_role[])) with check (has_role(organization_id, array[''owner'',''admin'']::member_role[]))', t||'_w', t); end loop;
end $$;
create policy users_self on users for select using (id = auth.uid());
create policy org_r on organizations for select using (is_member(id));
create policy org_u on organizations for update using (has_role(id, array['owner','admin']::member_role[]));
create policy mem_r on organization_members for select using (is_member(organization_id));
create policy mem_w on organization_members for all using (has_role(organization_id, array['owner','admin']::member_role[])) with check (has_role(organization_id, array['owner','admin']::member_role[]));
create policy audit_r on audit_logs for select using (has_role(organization_id, array['owner','admin']::member_role[]));
create policy audit_i on audit_logs for insert with check (is_member(organization_id));
-- whatsapp_accounts : RLS sans policy => accessible uniquement via service_role (serveur).

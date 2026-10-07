-- Intégrité inter-tenant : FK composites (id, organization_id)
alter table customers add unique (id, organization_id);   alter table conversations add unique (id, organization_id);
alter table orders add unique (id, organization_id);      alter table products add unique (id, organization_id);
alter table automations add unique (id, organization_id); alter table knowledge_documents add unique (id, organization_id);
alter table conversations drop constraint conversations_customer_id_fkey, add foreign key (customer_id, organization_id) references customers(id, organization_id);
alter table messages drop constraint messages_conversation_id_fkey, add foreign key (conversation_id, organization_id) references conversations(id, organization_id) on delete cascade;
alter table orders drop constraint orders_customer_id_fkey, add foreign key (customer_id, organization_id) references customers(id, organization_id);
alter table order_items drop constraint order_items_order_id_fkey, add foreign key (order_id, organization_id) references orders(id, organization_id) on delete cascade;
alter table order_items drop constraint order_items_product_id_fkey, add foreign key (product_id, organization_id) references products(id, organization_id);
alter table appointments drop constraint appointments_customer_id_fkey, add foreign key (customer_id, organization_id) references customers(id, organization_id);
alter table knowledge_chunks drop constraint knowledge_chunks_document_id_fkey, add foreign key (document_id, organization_id) references knowledge_documents(id, organization_id) on delete cascade;
alter table automation_runs drop constraint automation_runs_automation_id_fkey, add foreign key (automation_id, organization_id) references automations(id, organization_id) on delete cascade;
create unique index messages_provider_uniq on messages (organization_id, external_id) where external_id is not null;
do $$ declare t text; begin
  foreach t in array array['customers','conversations','messages','orders','order_items','appointments','notifications'] loop
    execute format('drop policy %I on %I', t||'_rw', t);
    execute format('create policy %I on %I for select using (is_member(organization_id))', t||'_s', t);
    execute format('create policy %I on %I for insert with check (is_member(organization_id))', t||'_i', t);
    execute format('create policy %I on %I for update using (is_member(organization_id)) with check (is_member(organization_id))', t||'_u', t);
    execute format('create policy %I on %I for delete using (has_role(organization_id, array[''owner'',''admin'']::member_role[]))', t||'_d', t);
  end loop;
  foreach t in array array['subscriptions','usage_records'] loop execute format('drop policy %I on %I', t||'_w', t); end loop;
end $$;
drop policy mem_w on organization_members;
create policy mem_owner on organization_members for all using (has_role(organization_id, array['owner']::member_role[])) with check (has_role(organization_id, array['owner']::member_role[]));
create policy mem_admin on organization_members for all using (has_role(organization_id, array['admin']::member_role[]) and role = 'agent') with check (has_role(organization_id, array['admin']::member_role[]) and role = 'agent');
drop policy audit_i on audit_logs;
create policy audit_i on audit_logs for insert with check (is_member(organization_id) and user_id = auth.uid());
create or replace function create_organization(org_name text) returns uuid language plpgsql security definer set search_path = public as $$
declare oid uuid; begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if org_name is null or char_length(trim(org_name)) not between 2 and 80 then raise exception 'invalid organization name'; end if;
  insert into organizations(name, created_by) values (trim(org_name), auth.uid()) returning id into oid;
  insert into organization_members values (oid, auth.uid(), 'owner');
  insert into subscriptions(organization_id) values (oid); insert into ai_settings(organization_id) values (oid);
  return oid; end $$;
revoke execute on function create_organization(text) from public, anon; grant execute on function create_organization(text) to authenticated;
create function ingest_whatsapp_message(p_phone_number_id text, p_from text, p_name text, p_external_id text, p_body text) returns jsonb language plpgsql security definer set search_path = public as $$
declare org uuid; cust uuid; conv uuid; mid uuid; begin
  select organization_id into org from whatsapp_accounts where phone_number_id = p_phone_number_id and status <> 'disabled';
  if org is null then return jsonb_build_object('status', 'unknown_account'); end if;
  insert into customers(organization_id, name, phone) values (org, p_name, p_from) on conflict (organization_id, phone) do update set name = coalesce(customers.name, excluded.name) returning id into cust;
  select id into conv from conversations where organization_id = org and customer_id = cust and status = 'open' order by created_at desc limit 1;
  if conv is null then insert into conversations(organization_id, customer_id) values (org, cust) returning id into conv; end if;
  insert into messages(organization_id, conversation_id, sender, body, external_id) values (org, conv, 'customer', p_body, p_external_id)
    on conflict (organization_id, external_id) where external_id is not null do nothing returning id into mid;
  if mid is null then return jsonb_build_object('status', 'duplicate'); end if;
  update conversations set last_message_at = now() where id = conv;
  return jsonb_build_object('status', 'stored', 'organization_id', org, 'conversation_id', conv); end $$;
revoke all on function ingest_whatsapp_message(text, text, text, text, text) from public, anon, authenticated;
grant execute on function ingest_whatsapp_message(text, text, text, text, text) to service_role;

-- NON EXÉCUTÉ (pas de PostgreSQL à l'écriture). Lancer sur une base de TEST : psql -f supabase/tests/rls_isolation.sql
begin;
create function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claim.sub', u::text, true), set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true) $$;
insert into auth.users(id, email) values ('00000000-0000-0000-0000-00000000000a', 'a@t.io'), ('00000000-0000-0000-0000-00000000000b', 'b@t.io');
set local role authenticated;
do $$ declare oa uuid; ob uuid; ca uuid; n int; begin
  perform pg_temp.as_user('00000000-0000-0000-0000-00000000000a'); oa := create_organization('Org A');
  insert into customers(organization_id, phone) values (oa, '+1') returning id into ca;
  perform pg_temp.as_user('00000000-0000-0000-0000-00000000000b'); ob := create_organization('Org B');
  select count(*) into n from customers; assert n = 0, 'B voit les clients de A';
  begin insert into customers(organization_id, phone) values (oa, '+2'); assert false, 'B a écrit chez A'; exception when insufficient_privilege or check_violation then null; end;
  begin insert into conversations(organization_id, customer_id) values (ob, ca); assert false, 'FK inter-tenant acceptée'; exception when foreign_key_violation then null; end;
  update subscriptions set plan = 'pro' where organization_id = ob; get diagnostics n = row_count; assert n = 0, 'abonnement modifiable via le client';
  select count(*) into n from whatsapp_accounts; assert n = 0, 'whatsapp_accounts lisible';
  select count(*) into n from organizations; assert n = 1, 'B voit plusieurs organisations';
end $$;
rollback;

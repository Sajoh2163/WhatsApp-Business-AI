# Relais — WhatsApp AI Business Assistant
Légende : 🟢 réel+testé · 🟡 réel non testé · 🔵 mock/démo · 🔴 non implémenté

1. **Installation** : `npm install`
2. **Variables** : `cp .env.example .env.local` (commentaires dans le fichier).
3. **Demo Mode** 🔵 : `DEMO_MODE=true` (défaut) → aucune base requise, données en mémoire (`src/repositories/seed.ts`), auth désactivée.
4. **Supabase** 🟡 : créer un projet, renseigner URL + clés, `DEMO_MODE=false`. Auth > URL configuration : ajouter `http://localhost:3000/auth/callback`.
5. **Migrations** : `supabase db push`, ou coller `supabase/migrations/0001*.sql` puis `0002*.sql` dans l'éditeur SQL.
6. **Types** : `npx supabase gen types typescript --project-id <id> > src/types/supabase.ts`, puis remplacer `src/types/db.ts` (écrit à la main pour l'instant).
7. **Lancer** : `npm run dev` · tests : `npm test` (Node ≥ 22.6) · types : `npm run typecheck`.
8. **IA** : `AI_PROVIDER=demo` 🔵 ou `openai-compatible` 🟡 (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`).
9. **WhatsApp** : `WHATSAPP_PROVIDER=mock` 🔵 ou `cloud` 🟡. Tokens chiffrés (AES-256-GCM, `SECRETS_ENCRYPTION_KEY`) dans `whatsapp_accounts.token_encrypted`, par organisation. Webhook : `/api/webhooks/whatsapp`.
10. **Architecture** : `app/` → `repositories/` (toujours scopé `organization_id`) → Supabase ; `services/` (IA, WhatsApp) derrière des interfaces ; `lib/session.ts` = seule source du tenant ; `lib/rbac.ts` = permissions.
11. **Sécurité** : RLS sur toutes les tables, rôle vérifié côté serveur dans chaque server action, HMAC des webhooks, secrets jamais côté client, paramètre `next` filtré.
12. **Déploiement** : Vercel + Supabase ; variables d'environnement, `NEXT_PUBLIC_SITE_URL`, URL de webhook chez Meta.

## Audit — compléments
- **Authentification** : signup → email de confirmation → `/auth/callback` crée l'organisation (RPC `create_organization`, rôle owner) ; chaque page et chaque server action rappelle `getTenant()` (le layout seul ne protège pas). 🟡 jamais exécuté.
- **Multi-tenancy** : repository (`organization_id` obligatoire) · RLS · FK composites `(id, organization_id)` (migration 0003) · `ingest_whatsapp_message` déduit l'organisation en base. Test SQL : `supabase/tests/rls_isolation.sql` 🟡 non exécuté.
- **Webhook** : HMAC obligatoire (échec fermé sans `WHATSAPP_APP_SECRET`), limite de taille, rate-limit mémoire, idempotence par index unique `(organization_id, external_id)`. L'IA ne répond pas encore aux messages entrants 🔴.
- **Tests** : `npm test` (logique pure 🟢) ; `psql -f supabase/tests/rls_isolation.sql` sur une base de test 🟡.
- **Production** : migrations 0001→0003, `DEMO_MODE=false`, `SECRETS_ENCRYPTION_KEY` (`openssl rand -hex 32`), `SUPABASE_SERVICE_ROLE_KEY` serveur uniquement, webhook Meta → `/api/webhooks/whatsapp`.

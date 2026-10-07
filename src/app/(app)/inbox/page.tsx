import { Inbox } from "@/components/inbox/inbox";
import { getRepo } from "@/repositories";
import { getTenant } from "@/lib/session";
export default async function Page() {
  const t = await getTenant(), r = await getRepo();
  const [conversations, customers] = await Promise.all([r.listConversations(t.orgId), r.listCustomers(t.orgId)]);
  return <Inbox conversations={conversations} customers={customers} />;
}

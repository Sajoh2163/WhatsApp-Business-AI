const N = ["Aline Uwase","Eric Mugabo","Chantal Ingabire","Patrick Niyonzima","Diane Mukamana","Jean Habimana","Sandrine Uwimana","Olivier Nsengiyumva","Grace Mutesi","Claude Kamanzi","Josiane Mukeshimana","Emmanuel Ndayisaba","Beatrice Umutoni","Fabrice Rugamba","Yvonne Iradukunda"];
const P: [string, number, string][] = [["Sac cuir noir",45,"Sacs"],["Sac cuir miel",52,"Sacs"],["Portefeuille",32,"Accessoires"],["Ceinture cuir",19,"Accessoires"],["Écharpe en soie",28,"Accessoires"],["Sandales artisanales",38,"Chaussures"],["Mocassins",64,"Chaussures"],["Porte-cartes",15,"Accessoires"],["Sac bandoulière",58,"Sacs"],["Coffret cadeau",70,"Coffrets"]];
const M: [string, string][] = [["Bonjour, vous avez le sac cuir noir en stock ?","Oui ! Disponible en noir et en miel. Voulez-vous voir les options ?"],["Vous livrez à Kimironko ?","Oui, livraison le jour même avant 17h pour 2 $."],["Quel est le prix du portefeuille ?","Le portefeuille est à 32 $. Je prépare la commande ?"],["Ma commande est arrivée abîmée.","Je suis désolé, je transfère votre demande à l'équipe."]];
const ST = ["new","confirmed","processing","shipped","delivered","delivered"];
export function buildSeed(org: string) {
  const day = (n: number) => new Date(Date.UTC(2026, 9, 7 - n, 9)).toISOString();
  const customers = N.map((name, i) => ({ id: `cu${i}`, organization_id: org, name, phone: `+250 78${i % 10} ${100 + i * 37} ${200 + i * 13}`, tags: i % 5 === 0 ? ["VIP"] : i % 3 === 0 ? ["Cliente fidèle"] : ["Prospect"] }));
  const products = P.map(([name, price, category], i) => ({ id: `p${i}`, organization_id: org, name, price, stock: 4 + ((i * 7) % 20), category, active: true }));
  const conversations = Array.from({ length: 20 }, (_, i) => {
    const [q, a] = M[i % 4]!, human = i % 4 === 3, id = `cv${i}`;
    const messages = [{ id: `${id}m0`, sender: "customer", body: q }, { id: `${id}m1`, sender: human ? "human" : "ai", body: a }].map((m) => ({ ...m, organization_id: org, conversation_id: id, created_at: day(i % 5) }));
    return { id, organization_id: org, customer_id: `cu${i % 15}`, mode: human ? "human" : "ai", unread: i % 3 === 0 ? 1 : 0, messages };
  });
  const orders = Array.from({ length: 12 }, (_, i) => { const p = P[i % 10]!, q = 1 + (i % 2); return { id: `o${i}`, organization_id: org, number: 1030 + i, customer_id: `cu${i}`, product_id: `p${i % 10}`, quantity: q, total: p[1] * q, status: ST[i % 6]!, created_at: day(i) }; });
  const appointments = Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, organization_id: org, customer_id: `cu${i + 2}`, starts_at: day(-i - 1), status: i % 3 === 0 ? "pending" : "confirmed" }));
  const automations = ["Message de bienvenue","Relance après 6 h","Rappel de rendez-vous 24 h avant","Notification de commande expédiée","Demande d'avis après livraison"].map((name, i) => ({ id: `au${i}`, organization_id: org, name, enabled: i !== 4 }));
  const series = Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i).slice(5, 10), value: 90 + ((i * 37) % 80) + i * 6 }));
  return { customers, products, conversations, orders, appointments, automations, series };
}

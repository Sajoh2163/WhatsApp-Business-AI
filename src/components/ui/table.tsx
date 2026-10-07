import { Card } from "./card";
export function Table({ cols, rows, empty }: { cols: string[]; rows: (string | number)[][]; empty: string }) {
  if (!rows.length) return <Card className="p-10 text-center text-mut">{empty}</Card>;
  return <Card className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{cols.map((c) => <th key={c} className="p-3 text-left font-semibold text-mut">{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t border-line">{r.map((v, j) => <td key={j} className="p-3">{v}</td>)}</tr>)}</tbody></table></Card>;
}

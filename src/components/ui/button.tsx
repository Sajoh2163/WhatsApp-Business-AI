import type { ButtonHTMLAttributes } from "react";
export function Button({ variant = "default", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" }) {
  const v = variant === "primary" ? "bg-acc text-white border-acc" : "bg-card border-line";
  return <button className={`rounded-lg border px-4 py-2 font-semibold transition active:scale-[.98] ${v} ${className}`} {...p} />;
}

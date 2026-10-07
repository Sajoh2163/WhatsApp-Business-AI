import type { HTMLAttributes } from "react";
export const Card = ({ className = "", ...p }: HTMLAttributes<HTMLDivElement>) => <div className={`rounded-xl border border-line bg-card ${className}`} {...p} />;

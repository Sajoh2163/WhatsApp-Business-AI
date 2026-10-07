"use client";
export function ThemeToggle() { return <button aria-label="Changer de thème" className="rounded-lg border border-line px-3 py-1 text-sm font-semibold" onClick={() => { const d = document.documentElement; d.dataset.theme = d.dataset.theme === "dark" ? "light" : "dark"; }}>Thème</button>; }

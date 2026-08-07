"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/menu", label: "Menú" },
] as const;

export default function AdminNavTabs({ pendingOrders }: { pendingOrders: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-red-600 text-white shadow-sm"
                : "border border-zinc-200 text-zinc-600 hover:border-red-300 hover:text-zinc-900"
            }`}
          >
            {tab.label}
            {tab.href === "/admin/pedidos" && pendingOrders > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  active ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
                }`}
              >
                {pendingOrders}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

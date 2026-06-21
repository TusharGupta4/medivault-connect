import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import Brand from "./Brand";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  items: NavItem[];
  onNavigate?: () => void;
}

export default function Sidebar({ items, onNavigate }: Props) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="px-5 py-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} MediVault
      </div>
    </aside>
  );
}
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Bus, MapPin, Building2, Ticket, FileBarChart, LogOut, Compass,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/trips", label: "Trajets", icon: Bus },
  { to: "/destinations", label: "Destinations", icon: MapPin },
  { to: "/transporters", label: "Transporteurs", icon: Building2 },
  { to: "/reservations", label: "Réservations", icon: Ticket },
  { to: "/reports", label: "Rapports", icon: FileBarChart },
];

export function AppSidebar({ onNav }: { onNav?: () => void }) {
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">TTAP Maroc</div>
          <div className="text-[11px] text-sidebar-foreground/60 leading-tight">Tourism Transport Analytics</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNav}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 rounded-lg bg-sidebar-accent/40 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-sidebar-foreground/50">Connecté</div>
          <div className="text-sm font-semibold">admin</div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </div>
    </aside>
  );
}

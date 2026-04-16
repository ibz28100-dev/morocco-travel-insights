import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { getSession } from "@/lib/auth";

const TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/trips": "Gestion des trajets",
  "/destinations": "Destinations",
  "/transporters": "Transporteurs",
  "/reservations": "Réservations",
  "/reports": "Rapports & Exports",
};

export default function AppLayout() {
  const session = getSession();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen">
        <AppSidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-card/80 backdrop-blur px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <AppSidebar onNav={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                {TITLES[location.pathname] ?? "TTAP Maroc"}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Plateforme d'analyse du transport touristique au Maroc
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Données à jour</span>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Compass, LogIn } from "lucide-react";
import { login, getSession } from "@/lib/auth";
import { toast } from "sonner";
import heroPattern from "@/assets/hero-pattern.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  if (getSession()) { navigate("/dashboard", { replace: true }); }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (login(email, password)) {
        toast.success("Bienvenue sur TTAP Maroc");
        navigate("/dashboard");
      } else {
        toast.error("Identifiants invalides");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        <img src={heroPattern} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-secondary/80" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Compass className="h-6 w-6" />
          </div>
          <div className="text-xl font-bold">TTAP Maroc</div>
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            Pilotez le transport touristique du Royaume.
          </h2>
          <p className="text-white/85 leading-relaxed">
            Centralisez transporteurs, trajets et réservations. Analysez la demande saisonnière à travers Marrakech, Fès, Chefchaouen et au-delà.
          </p>
          <div className="flex gap-6 pt-4">
            <div><div className="text-3xl font-bold">8</div><div className="text-xs uppercase tracking-wider text-white/70">Villes</div></div>
            <div><div className="text-3xl font-bold">10+</div><div className="text-xs uppercase tracking-wider text-white/70">Transporteurs</div></div>
            <div><div className="text-3xl font-bold">100+</div><div className="text-xs uppercase tracking-wider text-white/70">Trajets</div></div>
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/70">© {new Date().getFullYear()} Tourism Transport Analytics Platform</div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <Card className="w-full max-w-md p-8 shadow-elegant border-0 animate-scale-in">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div className="font-bold">TTAP Maroc</div>
          </div>
          <h1 className="text-2xl font-bold mb-1">Connexion administrateur</h1>
          <p className="text-sm text-muted-foreground mb-6">Accédez à votre tableau de bord analytique.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Identifiant</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary hover:opacity-90 shadow-soft">
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Démo :</strong> admin / admin123
          </div>
        </Card>
      </div>
    </div>
  );
}

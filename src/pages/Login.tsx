import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, LogIn, UserPlus } from "lucide-react";
import { signIn, signUp, useAuth } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import heroPattern from "@/assets/hero-pattern.jpg";

export default function Login() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate("/dashboard", { replace: true });
  }, [session, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("Bienvenue sur TTAP Maroc");
      } else {
        await signUp(email, password, fullName);
        toast.success("Compte créé. Vérifiez votre email pour confirmer.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur d'authentification");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) toast.error("Connexion Google échouée");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur Google");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
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

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <Card className="w-full max-w-md p-8 shadow-elegant border-0 animate-scale-in">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div className="font-bold">TTAP Maroc</div>
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {mode === "signin" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Accédez à votre tableau de bord analytique.
          </p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mb-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">S'inscrire</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" />
            <TabsContent value="signup" />
          </Tabs>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Votre nom" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary hover:opacity-90 shadow-soft">
              {mode === "signin" ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {busy ? "Veuillez patienter..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" onClick={onGoogle} disabled={busy} className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </Button>
        </Card>
      </div>
    </div>
  );
}

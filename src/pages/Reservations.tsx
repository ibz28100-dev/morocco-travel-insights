import { useMemo, useState } from "react";
import { useDB, store, Reservation } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function Reservations() {
  const db = useDB();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [form, setForm] = useState<Omit<Reservation, "id">>({ trip_id: "", number_of_passengers: 1 });

  const filtered = useMemo(() => {
    return db.reservations.filter((r) => {
      const t = db.trips.find((x) => x.id === r.trip_id);
      if (!t) return false;
      if (!search) return true;
      return [t.departure_city, t.destination_city].join(" ").toLowerCase().includes(search.toLowerCase());
    });
  }, [db, search]);

  const submit = () => {
    if (!form.trip_id || form.number_of_passengers <= 0) { toast.error("Champs invalides"); return; }
    if (editing) { store.updateReservation(editing.id, form); toast.success("Réservation modifiée"); }
    else { store.addReservation(form); toast.success("Réservation ajoutée"); }
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <Card className="p-4 border-0 shadow-soft">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par itinéraire..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm({ trip_id: db.trips[0]?.id ?? "", number_of_passengers: 1 }); }} className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />Nouvelle réservation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Modifier" : "Ajouter"} une réservation</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-2">
                  <Label>Trajet</Label>
                  <Select value={form.trip_id} onValueChange={(v) => setForm({ ...form, trip_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {db.trips.slice(0, 50).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.departure_city} → {t.destination_city} · {new Date(t.date).toLocaleDateString("fr-FR")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Nombre de passagers</Label><Input type="number" min={1} value={form.number_of_passengers} onChange={(e) => setForm({ ...form, number_of_passengers: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={submit} className="bg-gradient-primary">{editing ? "Enregistrer" : "Ajouter"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Réf.</TableHead>
                <TableHead>Trajet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Passagers</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 100).map((r) => {
                const t = db.trips.find((x) => x.id === r.trip_id);
                return (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">#{r.id.slice(0, 6).toUpperCase()}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{t?.departure_city} → {t?.destination_city}</Badge></TableCell>
                    <TableCell>{t ? new Date(t.date).toLocaleDateString("fr-FR") : "—"}</TableCell>
                    <TableCell><span className="font-semibold">{r.number_of_passengers}</span></TableCell>
                    <TableCell className="font-semibold text-primary">{t ? (t.price * r.number_of_passengers).toLocaleString("fr-FR") : 0} MAD</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm({ trip_id: r.trip_id, number_of_passengers: r.number_of_passengers }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { store.deleteReservation(r.id); toast.success("Supprimée"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 text-xs text-muted-foreground border-t">Affiche les 100 premières sur {filtered.length}</div>
      </Card>
    </div>
  );
}

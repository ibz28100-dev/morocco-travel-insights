import { useMemo, useState } from "react";
import { useDB, store, Trip } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const empty = { transporter_id: "", departure_city: "", destination_city: "", date: "", price: 0 };

export default function Trips() {
  const db = useDB();
  const [search, setSearch] = useState("");
  const [destFilter, setDestFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState<Omit<Trip, "id">>(empty);

  const filtered = useMemo(() => {
    return db.trips.filter((t) => {
      const tr = db.transporters.find((x) => x.id === t.transporter_id);
      const matchesSearch = !search || [t.departure_city, t.destination_city, tr?.company_name ?? ""].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesDest = destFilter === "all" || t.destination_city === destFilter;
      const matchesDate = !dateFilter || t.date === dateFilter;
      return matchesSearch && matchesDest && matchesDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [db, search, destFilter, dateFilter]);

  const openNew = () => { setEditing(null); setForm({ ...empty, transporter_id: db.transporters[0]?.id ?? "", departure_city: db.destinations[0]?.city_name ?? "", destination_city: db.destinations[1]?.city_name ?? "", date: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const openEdit = (t: Trip) => { setEditing(t); setForm(t); setOpen(true); };

  const submit = () => {
    if (!form.transporter_id || !form.departure_city || !form.destination_city || !form.date || form.price <= 0) {
      toast.error("Veuillez remplir tous les champs"); return;
    }
    if (editing) { store.updateTrip(editing.id, form); toast.success("Trajet modifié"); }
    else { store.addTrip(form); toast.success("Trajet ajouté"); }
    setOpen(false);
  };

  const remove = (id: string) => { store.deleteTrip(id); toast.success("Trajet supprimé"); };

  return (
    <div className="space-y-5">
      <Card className="p-4 md:p-5 border-0 shadow-soft">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher (ville, transporteur)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={destFilter} onValueChange={setDestFilter}>
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Destination" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes destinations</SelectItem>
              {db.destinations.map((d) => <SelectItem key={d.id} value={d.city_name}>{d.city_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="md:w-44" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" />Nouveau trajet</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Modifier" : "Ajouter"} un trajet</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label>Transporteur</Label>
                  <Select value={form.transporter_id} onValueChange={(v) => setForm({ ...form, transporter_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{db.transporters.map((t) => <SelectItem key={t.id} value={t.id}>{t.company_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Départ</Label>
                    <Select value={form.departure_city} onValueChange={(v) => setForm({ ...form, departure_city: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{db.destinations.map((d) => <SelectItem key={d.id} value={d.city_name}>{d.city_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Select value={form.destination_city} onValueChange={(v) => setForm({ ...form, destination_city: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{db.destinations.map((d) => <SelectItem key={d.id} value={d.city_name}>{d.city_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Prix (MAD)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                </div>
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
                <TableHead>Transporteur</TableHead>
                <TableHead>Itinéraire</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Réservations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const tr = db.transporters.find((x) => x.id === t.transporter_id);
                const pax = db.reservations.filter((r) => r.trip_id === t.id).reduce((s, r) => s + r.number_of_passengers, 0);
                return (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{tr?.company_name ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{t.departure_city} → {t.destination_city}</Badge></TableCell>
                    <TableCell>{new Date(t.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="font-semibold">{t.price} MAD</TableCell>
                    <TableCell>{pax} pax</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Aucun trajet trouvé</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 text-xs text-muted-foreground border-t">{filtered.length} trajet(s) affichés</div>
      </Card>
    </div>
  );
}

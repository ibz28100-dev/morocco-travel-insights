import { useState } from "react";
import { useDB, useStore, Destination } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { CITY_IMAGES, CITY_DESCRIPTIONS } from "@/data/cities";

export default function Destinations() {
  const db = useDB();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [name, setName] = useState("");

  const submit = async () => {
    if (!name.trim()) { toast.error("Nom de ville requis"); return; }
    try {
      if (editing) { await store.updateDestination(editing.id, { city_name: name }); toast.success("Destination modifiée"); }
      else { await store.addDestination({ city_name: name }); toast.success("Destination ajoutée"); }
      setOpen(false); setName(""); setEditing(null);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{db.destinations.length} destinations enregistrées</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setName(""); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setName(""); }} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />Nouvelle destination
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Ajouter"} une destination</DialogTitle></DialogHeader>
            <div className="space-y-2 py-2">
              <Label>Nom de la ville</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Essaouira" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={submit} className="bg-gradient-primary">{editing ? "Enregistrer" : "Ajouter"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {db.destinations.map((d) => {
          const tripCount = db.trips.filter((t) => t.destination_city === d.city_name).length;
          return (
            <Card key={d.id} className="overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-smooth group">
              <div className="relative h-44 overflow-hidden bg-muted">
                {CITY_IMAGES[d.city_name] ? (
                  <img src={CITY_IMAGES[d.city_name]} alt={d.city_name} loading="lazy" width={1024} height={768} className="h-full w-full object-cover group-hover:scale-110 transition-smooth" />
                ) : (
                  <div className="h-full w-full bg-gradient-cool flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold">{d.city_name}</h3>
                  <p className="text-xs opacity-90">{tripCount} trajets disponibles</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                  {CITY_DESCRIPTIONS[d.city_name] ?? "Destination touristique au Maroc."}
                </p>
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(d); setName(d.city_name); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={async () => { try { await store.deleteDestination(d.id); toast.success("Supprimée"); } catch (e: any) { toast.error(e.message); } }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

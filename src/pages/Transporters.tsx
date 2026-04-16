import { useState } from "react";
import { useDB, store, Transporter } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Phone, Mail, Building2 } from "lucide-react";
import { toast } from "sonner";

const empty = { company_name: "", phone: "", email: "" };

export default function Transporters() {
  const db = useDB();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transporter | null>(null);
  const [form, setForm] = useState(empty);

  const submit = () => {
    if (!form.company_name || !form.phone || !form.email) { toast.error("Tous les champs requis"); return; }
    if (editing) { store.updateTransporter(editing.id, form); toast.success("Transporteur modifié"); }
    else { store.addTransporter(form); toast.success("Transporteur ajouté"); }
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{db.transporters.length} compagnies enregistrées</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(empty); }} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />Nouveau transporteur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Ajouter"} un transporteur</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-2"><Label>Nom de la société</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={submit} className="bg-gradient-primary">{editing ? "Enregistrer" : "Ajouter"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Société</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trajets</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {db.transporters.map((t) => {
                const trips = db.trips.filter((x) => x.transporter_id === t.id).length;
                return (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-white shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{t.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell><div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{t.phone}</div></TableCell>
                    <TableCell><div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{t.email}</div></TableCell>
                    <TableCell><span className="font-semibold">{trips}</span></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setForm(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { store.deleteTransporter(t.id); toast.success("Supprimé"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

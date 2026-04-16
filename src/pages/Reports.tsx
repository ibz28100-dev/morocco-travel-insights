import { useMemo } from "react";
import { useDB } from "@/data/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { exportExcel, exportPDF } from "@/lib/exports";
import { toast } from "sonner";

export default function Reports() {
  const db = useDB();

  const summary = useMemo(() => {
    const totalTrips = db.trips.length;
    const totalPax = db.reservations.reduce((s, r) => s + r.number_of_passengers, 0);
    const revenue = db.trips.reduce((s, t) => {
      const pax = db.reservations.filter((r) => r.trip_id === t.id).reduce((a, r) => a + r.number_of_passengers, 0);
      return s + pax * t.price;
    }, 0);
    const destMap = new Map<string, number>();
    db.trips.forEach((t) => destMap.set(t.destination_city, (destMap.get(t.destination_city) || 0) + 1));
    const popular = Array.from(destMap.entries()).sort((a, b) => b[1] - a[1]);
    return { totalTrips, totalPax, revenue, popular };
  }, [db]);

  const onExportExcel = () => {
    exportExcel("rapport-ttap-maroc", [
      { name: "Synthèse", rows: [
        { Indicateur: "Total trajets", Valeur: summary.totalTrips },
        { Indicateur: "Total passagers", Valeur: summary.totalPax },
        { Indicateur: "Chiffre d'affaires (MAD)", Valeur: summary.revenue },
        { Indicateur: "Moyenne passagers/trajet", Valeur: (summary.totalPax / Math.max(1, summary.totalTrips)).toFixed(2) },
      ]},
      { name: "Transporteurs", rows: db.transporters },
      { name: "Destinations", rows: db.destinations },
      { name: "Trajets", rows: db.trips.map((t) => ({
        ...t,
        transporteur: db.transporters.find((x) => x.id === t.transporter_id)?.company_name ?? "",
      }))},
      { name: "Réservations", rows: db.reservations.map((r) => {
        const t = db.trips.find((x) => x.id === r.trip_id);
        return { id: r.id, trajet: t ? `${t.departure_city} → ${t.destination_city}` : "", date: t?.date, passagers: r.number_of_passengers, total_mad: t ? t.price * r.number_of_passengers : 0 };
      })},
    ]);
    toast.success("Excel exporté");
  };

  const onExportPDF = () => {
    exportPDF(
      "Rapport analytique — TTAP Maroc",
      "rapport-ttap-maroc",
      [
        { heading: "Indicateurs clés", columns: ["Indicateur", "Valeur"], rows: [
          ["Total trajets", summary.totalTrips],
          ["Total passagers", summary.totalPax],
          ["Chiffre d'affaires (MAD)", summary.revenue.toLocaleString("fr-FR")],
          ["Moyenne passagers / trajet", (summary.totalPax / Math.max(1, summary.totalTrips)).toFixed(2)],
        ]},
        { heading: "Destinations populaires", columns: ["Ville", "Nombre de trajets"], rows: summary.popular.map(([c, n]) => [c, n]) },
        { heading: "Transporteurs", columns: ["Société", "Téléphone", "Email"], rows: db.transporters.map((t) => [t.company_name, t.phone, t.email]) },
      ]
    );
    toast.success("PDF exporté");
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6 border-0 shadow-soft bg-gradient-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary mb-4">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-1">Rapport PDF</h3>
          <p className="text-sm text-muted-foreground mb-5">Synthèse complète : KPI, destinations populaires et liste des transporteurs.</p>
          <Button onClick={onExportPDF} className="w-full bg-gradient-primary"><FileDown className="mr-2 h-4 w-4" />Télécharger PDF</Button>
        </Card>
        <Card className="p-6 border-0 shadow-soft bg-gradient-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cool mb-4">
            <FileSpreadsheet className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-1">Export Excel</h3>
          <p className="text-sm text-muted-foreground mb-5">Toutes les données (transporteurs, destinations, trajets, réservations) en un classeur.</p>
          <Button onClick={onExportExcel} className="w-full bg-gradient-cool"><FileDown className="mr-2 h-4 w-4" />Télécharger Excel</Button>
        </Card>
      </div>

      <Card className="p-6 border-0 shadow-soft">
        <h3 className="font-bold mb-4">Aperçu de la synthèse</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total trajets" value={summary.totalTrips.toString()} />
          <Stat label="Total passagers" value={summary.totalPax.toLocaleString("fr-FR")} />
          <Stat label="Chiffre d'affaires" value={`${(summary.revenue/1000).toFixed(0)}k MAD`} />
          <Stat label="Top destination" value={summary.popular[0]?.[0] ?? "—"} />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

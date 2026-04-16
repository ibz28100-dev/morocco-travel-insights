import { useMemo } from "react";
import { useDB } from "@/data/store";
import { KpiCard } from "@/components/KpiCard";
import { Card } from "@/components/ui/card";
import { Bus, Users, MapPin, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { CITY_IMAGES, CITY_DESCRIPTIONS } from "@/data/cities";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))"];

export default function Dashboard() {
  const db = useDB();

  const stats = useMemo(() => {
    const totalTrips = db.trips.length;
    const totalPassengers = db.reservations.reduce((s, r) => s + r.number_of_passengers, 0);
    const avgPassengers = totalTrips ? (totalPassengers / totalTrips).toFixed(1) : "0";
    const revenue = db.trips.reduce((s, t) => {
      const pax = db.reservations.filter((r) => r.trip_id === t.id).reduce((a, r) => a + r.number_of_passengers, 0);
      return s + pax * t.price;
    }, 0);

    // Trips per month
    const perMonth = MONTHS.map((m, i) => ({
      month: m,
      trajets: db.trips.filter((t) => new Date(t.date).getMonth() === i).length,
      passagers: db.reservations.filter((r) => {
        const trip = db.trips.find((t) => t.id === r.trip_id);
        return trip && new Date(trip.date).getMonth() === i;
      }).reduce((s, r) => s + r.number_of_passengers, 0),
    }));

    // Popular destinations
    const destMap = new Map<string, number>();
    db.trips.forEach((t) => destMap.set(t.destination_city, (destMap.get(t.destination_city) || 0) + 1));
    const popularDest = Array.from(destMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    // Passengers per destination (pie)
    const paxByDest = new Map<string, number>();
    db.reservations.forEach((r) => {
      const t = db.trips.find((x) => x.id === r.trip_id);
      if (t) paxByDest.set(t.destination_city, (paxByDest.get(t.destination_city) || 0) + r.number_of_passengers);
    });
    const paxPie = Array.from(paxByDest.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Seasonal (quarters)
    const seasons = [
      { name: "Hiver", months: [11, 0, 1] },
      { name: "Printemps", months: [2, 3, 4] },
      { name: "Été", months: [5, 6, 7] },
      { name: "Automne", months: [8, 9, 10] },
    ].map((s) => ({
      season: s.name,
      demande: db.reservations.filter((r) => {
        const t = db.trips.find((x) => x.id === r.trip_id);
        return t && s.months.includes(new Date(t.date).getMonth());
      }).reduce((acc, r) => acc + r.number_of_passengers, 0),
    }));

    return { totalTrips, totalPassengers, avgPassengers, revenue, perMonth, popularDest, paxPie, seasons };
  }, [db]);

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    boxShadow: "var(--shadow-elegant)",
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KpiCard label="Total trajets" value={stats.totalTrips} icon={Bus} variant="primary" trend="100 trajets planifiés" />
        <KpiCard label="Total passagers" value={stats.totalPassengers.toLocaleString("fr-FR")} icon={Users} variant="secondary" trend="Sur l'ensemble des réservations" />
        <KpiCard label="Moy. passagers/trajet" value={stats.avgPassengers} icon={TrendingUp} variant="accent" trend="Taux de remplissage" />
        <KpiCard label="Chiffre d'affaires" value={`${(stats.revenue / 1000).toFixed(0)}k MAD`} icon={DollarSign} variant="indigo" trend="Estimation totale" />
      </div>

      {/* Main charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 md:p-6 border-0 shadow-soft bg-gradient-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Trajets & passagers par mois</h3>
              <p className="text-xs text-muted-foreground">Évolution mensuelle 2025</p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.perMonth}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="trajets" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#g1)" />
              <Area type="monotone" dataKey="passagers" stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 md:p-6 border-0 shadow-soft bg-gradient-card">
          <h3 className="font-semibold mb-1">Demande saisonnière</h3>
          <p className="text-xs text-muted-foreground mb-4">Passagers par saison</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.seasons}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="season" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="demande" radius={[8, 8, 0, 0]}>
                {stats.seasons.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5 md:p-6 border-0 shadow-soft bg-gradient-card">
          <h3 className="font-semibold mb-1">Destinations les plus demandées</h3>
          <p className="text-xs text-muted-foreground mb-4">Nombre de trajets par ville</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.popularDest} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="city" type="category" width={90} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="hsl(var(--chart-1))">
                {stats.popularDest.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 md:p-6 border-0 shadow-soft bg-gradient-card">
          <h3 className="font-semibold mb-1">Répartition des passagers</h3>
          <p className="text-xs text-muted-foreground mb-4">Par destination</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.paxPie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}>
                {stats.paxPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top destinations gallery */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Destinations en vedette</h2>
          <p className="text-sm text-muted-foreground">Les villes touristiques du Royaume</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.popularDest.slice(0, 8).map((d) => (
            <Card key={d.city} className="group overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-smooth cursor-pointer">
              <div className="relative h-32 overflow-hidden">
                <img
                  src={CITY_IMAGES[d.city]}
                  alt={d.city}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-smooth group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 text-white">
                  <div className="flex items-center gap-1 text-xs opacity-90"><MapPin className="h-3 w-3" />Maroc</div>
                  <div className="font-bold text-base leading-tight">{d.city}</div>
                </div>
                <div className="absolute top-2 right-2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-primary">
                  {d.count} trajets
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{CITY_DESCRIPTIONS[d.city]}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

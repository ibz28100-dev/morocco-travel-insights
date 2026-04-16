import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "primary" | "secondary" | "accent" | "indigo";
};

const variants = {
  primary: "from-primary to-primary-glow",
  secondary: "from-secondary to-chart-4",
  accent: "from-accent to-primary-glow",
  indigo: "from-chart-4 to-secondary",
};

export function KpiCard({ label, value, icon: Icon, trend, variant = "primary" }: Props) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-smooth bg-gradient-card">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", variants[variant])} />
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-soft", variants[variant])}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="text-3xl md:text-4xl font-bold tracking-tight">{value}</div>
        {trend && <div className="mt-2 text-xs text-muted-foreground">{trend}</div>}
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "info";
  isOnline: boolean;
}

export function StatCard({ title, value, unit, icon: Icon, variant = "default", isOnline }: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    info: "border-secondary/20 bg-secondary/5",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    info: "text-secondary",
  };

  return (
    <Card className={cn("p-6 transition-all hover:shadow-lg", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className={`text-4xl font-bold ${isOnline ? "text-foreground" : "text-muted-foreground"}`}>{value}</h2>
            <span className="text-lg text-muted-foreground">{unit}</span>
          </div>
        </div>
        <div className={cn("rounded-lg p-3 bg-muted", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

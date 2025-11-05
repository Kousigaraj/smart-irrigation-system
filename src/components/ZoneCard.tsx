import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Sprout, Mountain, Power, Loader2 } from "lucide-react";

interface ZoneCardProps {
  zone: {
    id: string;
    name: string;
    cropType: string;
    soilType: string;
    moisture: number;
    valveOpen: boolean;
    moistureThreshold: number;
  };
  onToggleValve: (zoneId: string) => void;
  isAutoMode?: boolean;
  loading?: boolean;
  isOnline?: boolean;
}

export function ZoneCard({ zone, onToggleValve, isAutoMode = false, loading, isOnline}: ZoneCardProps) {
  const needsWater = zone.moisture < zone.moistureThreshold;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{zone.name}</h3>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Sprout className="h-3 w-3" />
                {zone.cropType}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                {zone.soilType}
              </Badge>
            </div>
          </div>
          <div
            className={`rounded-full p-2 ${
              zone.valveOpen ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            <Power className="h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Soil Moisture</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isOnline ? "text-foreground" : "text-muted-foreground"}`}>{isOnline ? zone.moisture.toFixed(1) : "--"}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            {isOnline && <div className="flex items-center gap-1 mt-1">
               <Droplets className={`h-3 w-3 ${needsWater ? "text-warning" : "text-success"}`} />
              <span className={`text-xs ${needsWater ? "text-warning" : "text-success"}`}>
                {needsWater ? "Needs water" : "Optimal"}
              </span>
            </div>}
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Threshold</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{zone.moistureThreshold}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <div className="text-sm font-medium">Solenoid Valve</div>
            <div className="text-xs text-muted-foreground">
              Status: <span className={zone.valveOpen ? "text-success" : "text-muted-foreground"}>{zone.valveOpen ? "OPEN" : "CLOSED"}</span>
              {isAutoMode && <span className="ml-1">(Auto)</span>}
            </div>
          </div>
          <Button 
            onClick={() => onToggleValve(zone.id)} 
            variant={zone.valveOpen ? "destructive" : "default"} 
            size="sm"
            disabled={isAutoMode || loading || !isOnline}
          >
             {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
              </>
            ) : zone.valveOpen ? (
              "Close Valve"
            ) : (
              "Open Valve"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

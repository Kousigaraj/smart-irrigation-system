import { useState, useEffect } from "react";
import { Thermometer, Wind, Power } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ZoneCard } from "@/components/ZoneCard";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Zone {
  id: string;
  name: string;
  soilType: string;
  cropType: string;
  threshold: number;
  valveStatus: boolean;
  lastSoilMoisture: number;
}

export default function Dashboard() {
  const [motorStatus, setMotorStatus] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/data");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const data = await res.json();
      setMotorStatus(data.motorStatus);
      setIsAutoMode(data.irrigationMode === "auto");
      setTemperature(data.temperature);
      setHumidity(data.humidity);
      setZones(data.zones);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // ✅ Switch between AUTO and MANUAL mode
  const handleModeToggle = async (checked: boolean) => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/mode-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: checked ? "auto" : "manual" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsAutoMode(checked);
      toast({
        title: data.message,
        description: checked
          ? "Automatic irrigation enabled."
          : "Manual mode enabled. You can now control valves manually.",
      });

      await fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error switching mode",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ✅ Toggle valve manually
  const toggleValve = async (zoneId: string, currentStatus: boolean) => {
    if (isAutoMode) {
      toast({
        title: "Manual Control Disabled",
        description: "Switch to manual mode to control valves manually.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/valve/${zoneId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({
        title: data.message,
        description: `Valve successfully turned ${!currentStatus ? "ON" : "OFF"}.`,
      });

      // Refresh the dashboard
      await fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error controlling valve",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Variable rate irrigation system with zone control
        </p>
      </div>

      {/* Environmental Sensors */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Temperature"
          value={temperature.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          variant="info"
        />
        <StatCard
          title="Humidity"
          value={humidity.toFixed(1)}
          unit="%"
          icon={Wind}
          variant="default"
        />
      </div>

      {/* Irrigation Mode Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-6 border-b">
          <div>
            <h3 className="text-lg font-semibold mb-1">Irrigation Mode</h3>
            <p className="text-sm text-muted-foreground">
              {isAutoMode
                ? "Valves controlled automatically by moisture thresholds"
                : "Manual control of individual zone valves"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="mode-switch" className="text-sm font-medium">
              Manual
            </Label>
            <Switch
              id="mode-switch"
              checked={isAutoMode}
              onCheckedChange={handleModeToggle}
            />
            <Label htmlFor="mode-switch" className="text-sm font-medium text-success">
              Automatic
            </Label>
          </div>
        </div>

        {/* Motor Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`rounded-full p-3 ${
                motorStatus
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Power className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Irrigation Motor</h3>
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span
                  className={
                    motorStatus ? "text-success" : "text-muted-foreground"
                  }
                >
                  {motorStatus ? "ON" : "OFF"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {motorStatus
                  ? "Motor running - valves are open"
                  : "Motor idle - all valves closed"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              Active Zones
            </div>
            <div className="text-2xl font-bold text-success">
              {zones.filter((z) => z.valveStatus).length}/{zones.length}
            </div>
          </div>
        </div>
      </Card>

      {/* Zone Controls */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Zone Control
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={{
                id: zone.id,
                name: zone.name,
                cropType: zone.cropType,
                soilType: zone.soilType,
                moisture: zone.lastSoilMoisture,
                valveOpen: zone.valveStatus,
                moistureThreshold: zone.threshold,
              }}
              onToggleValve={() =>
                toggleValve(zone.id, zone.valveStatus)
              }
              isAutoMode={isAutoMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

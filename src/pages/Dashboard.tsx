import { useState, useEffect } from "react";
import { Thermometer, Wind, Power, Loader2, AlertTriangle } from "lucide-react";
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
  const [isModeChanging, setIsModeChanging] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loadingValveId, setLoadingValveId] = useState<string | null>(null);


  // ✅ Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("https://smart-irrigation-backend-rsqq.onrender.com/api/dashboard/data");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const data = await res.json();
      setMotorStatus(data.motorStatus);
      setIsAutoMode(data.irrigationMode === "auto");
      setTemperature(data.temperature);
      setHumidity(data.humidity);
      setLastUpdate(new Date(data.updatedAt));
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


  const now = new Date();
  const diffMinutes = lastUpdate ? (now.getTime() - lastUpdate.getTime()) / 60000 : null;
  const isOnline = diffMinutes !== null && diffMinutes < 2;

  function formatTimeAgo(minutes: number): string {
    if (minutes < 60) {
      const mins = Math.floor(minutes);
      return `${mins} minute${mins === 1 ? "" : "s"}`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  // ✅ Switch between AUTO and MANUAL mode
  const handleModeToggle = async (checked: boolean) => {
    setIsModeChanging(true);
    try {
      const res = await fetch("https://smart-irrigation-backend-rsqq.onrender.com/api/dashboard/mode-control", {
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
    } finally{
      setIsModeChanging(false);
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

    setLoadingValveId(zoneId);

    try {
      const res = await fetch(`https://smart-irrigation-backend-rsqq.onrender.com/api/dashboard/valve/${zoneId}`, {
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
    } finally {
      setLoadingValveId(null);
    }
  };

  if (loading)
  return (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
      <p className="text-sm font-medium">Loading dashboard data...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-md flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <span className="font-medium">Connection lost:</span>
          </div>
          <span className="sm:ml-1">ESP32 has not sent data for over {formatTimeAgo(diffMinutes)}.</span>
        </div>
      )}  
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
          value={isOnline  ? temperature.toFixed(1) : "--"}
          unit="°C"
          icon={Thermometer}
          variant="info"
          isOnline={isOnline}
        />
        <StatCard
          title="Humidity"
          value={isOnline  ? humidity.toFixed(1) : "--"}
          unit="%"
          icon={Wind}
          variant="default"
          isOnline={isOnline}
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
              disabled={isModeChanging || !isOnline}
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
              loading={loadingValveId === zone.id}
              isOnline={isOnline}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

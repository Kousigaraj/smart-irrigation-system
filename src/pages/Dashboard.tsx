import { useState, useEffect } from "react";
import { Thermometer, Wind, Power } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ZoneCard } from "@/components/ZoneCard";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface Zone {
  id: string;
  name: string;
  cropType: string;
  soilType: string;
  moisture: number;
  valveOpen: boolean;
  moistureThreshold: number;
}

interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: Date;
}

export default function Dashboard() {
  const [motorStatus, setMotorStatus] = useState(false);
  const [zones, setZones] = useState<Zone[]>([
    {
      id: "zone-1",
      name: "Zone 1 - North Field",
      cropType: "Wheat",
      soilType: "Clay",
      moisture: 45,
      valveOpen: false,
      moistureThreshold: 35,
    },
    {
      id: "zone-2",
      name: "Zone 2 - South Field",
      cropType: "Corn",
      soilType: "Loam",
      moisture: 28,
      valveOpen: false,
      moistureThreshold: 30,
    },
    {
      id: "zone-3",
      name: "Zone 3 - East Garden",
      cropType: "Vegetables",
      soilType: "Sandy",
      moisture: 52,
      valveOpen: false,
      moistureThreshold: 40,
    },
  ]);

  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 24,
    humidity: 65,
    timestamp: new Date(),
  });

  // Load zones from localStorage
  useEffect(() => {
    const savedZones = localStorage.getItem("irrigationZones");
    if (savedZones) {
      setZones(JSON.parse(savedZones));
    }
  }, []);

  // Auto-control motor based on valve status
  useEffect(() => {
    const anyValveOpen = zones.some((zone) => zone.valveOpen);
    setMotorStatus(anyValveOpen);
  }, [zones]);

  // Simulate real-time data updates for zones and sensors
  useEffect(() => {
    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => ({
          ...zone,
          moisture: Math.max(20, Math.min(80, zone.moisture + (Math.random() - 0.5) * 2)),
        }))
      );

      setSensorData((prev) => ({
        temperature: Math.max(15, Math.min(35, prev.temperature + (Math.random() - 0.5) * 0.5)),
        humidity: Math.max(40, Math.min(90, prev.humidity + (Math.random() - 0.5) * 2)),
        timestamp: new Date(),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleValve = (zoneId: string) => {
    setZones((prevZones) => {
      const newZones = prevZones.map((zone) =>
        zone.id === zoneId ? { ...zone, valveOpen: !zone.valveOpen } : zone
      );
      localStorage.setItem("irrigationZones", JSON.stringify(newZones));
      return newZones;
    });

    const zone = zones.find((z) => z.id === zoneId);
    toast({
      title: zone?.valveOpen ? "Valve Closed" : "Valve Opened",
      description: `${zone?.name} valve is now ${zone?.valveOpen ? "closed" : "open"}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Variable rate irrigation system with zone control</p>
      </div>

      {/* Environmental Sensors */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Temperature"
          value={sensorData.temperature.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          variant="info"
        />
        <StatCard title="Humidity" value={sensorData.humidity.toFixed(1)} unit="%" icon={Wind} variant="default" />
      </div>

      {/* Motor Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`rounded-full p-3 ${
                motorStatus ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              <Power className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Irrigation Motor</h3>
              <p className="text-sm text-muted-foreground">
                Status: <span className={motorStatus ? "text-success" : "text-muted-foreground"}>{motorStatus ? "ON" : "OFF"}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {motorStatus ? "Motor running - valves are open" : "Motor idle - all valves closed"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">Active Zones</div>
            <div className="text-2xl font-bold text-success">{zones.filter((z) => z.valveOpen).length}/{zones.length}</div>
          </div>
        </div>
      </Card>

      {/* Zone Controls */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Zone Control</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} onToggleValve={toggleValve} />
          ))}
        </div>
      </div>
    </div>
  );
}

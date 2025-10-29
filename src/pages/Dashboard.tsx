import { useState, useEffect } from "react";
import { Droplets, Thermometer, Wind, Power } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "@/hooks/use-toast";

interface SensorData {
  moisture: number;
  temperature: number;
  humidity: number;
  timestamp: Date;
}

export default function Dashboard() {
  const [pumpStatus, setPumpStatus] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    moisture: 45,
    temperature: 24,
    humidity: 65,
    timestamp: new Date(),
  });

  const [moistureHistory, setMoistureHistory] = useState<Array<{ time: string; moisture: number }>>([
    { time: "10:00", moisture: 42 },
    { time: "10:30", moisture: 40 },
    { time: "11:00", moisture: 38 },
    { time: "11:30", moisture: 43 },
    { time: "12:00", moisture: 45 },
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        moisture: Math.max(20, Math.min(80, prev.moisture + (Math.random() - 0.5) * 3)),
        temperature: Math.max(15, Math.min(35, prev.temperature + (Math.random() - 0.5) * 0.5)),
        humidity: Math.max(40, Math.min(90, prev.humidity + (Math.random() - 0.5) * 2)),
        timestamp: new Date(),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update chart when sensor data changes
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    setMoistureHistory((prev) => {
      const newHistory = [...prev, { time: timeStr, moisture: Math.round(sensorData.moisture) }];
      return newHistory.slice(-10); // Keep last 10 readings
    });
  }, [sensorData.moisture]);

  const togglePump = () => {
    setPumpStatus(!pumpStatus);
    toast({
      title: pumpStatus ? "Pump Turned OFF" : "Pump Turned ON",
      description: `Irrigation pump is now ${pumpStatus ? "inactive" : "active"}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring of your irrigation system</p>
      </div>

      {/* Sensor Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Soil Moisture"
          value={sensorData.moisture.toFixed(1)}
          unit="%"
          icon={Droplets}
          variant={sensorData.moisture < 30 ? "warning" : "success"}
        />
        <StatCard
          title="Temperature"
          value={sensorData.temperature.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          variant="info"
        />
        <StatCard title="Humidity" value={sensorData.humidity.toFixed(1)} unit="%" icon={Wind} variant="default" />
      </div>

      {/* Pump Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`rounded-full p-3 ${
                pumpStatus ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              <Power className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Irrigation Pump</h3>
              <p className="text-sm text-muted-foreground">
                Status: <span className={pumpStatus ? "text-success" : "text-muted-foreground"}>{pumpStatus ? "ON" : "OFF"}</span>
              </p>
            </div>
          </div>
          <Button onClick={togglePump} variant={pumpStatus ? "destructive" : "default"} size="lg">
            {pumpStatus ? "Turn OFF" : "Turn ON"}
          </Button>
        </div>
      </Card>

      {/* Moisture Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Soil Moisture Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={moistureHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Line type="monotone" dataKey="moisture" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))" }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

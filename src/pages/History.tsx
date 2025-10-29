import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SensorReading {
  id: number;
  timestamp: string;
  moisture: number;
  temperature: number;
  humidity: number;
}

export default function History() {
  const [readings, setReadings] = useState<SensorReading[]>([]);

  useEffect(() => {
    // Generate mock historical data
    const now = new Date();
    const mockReadings: SensorReading[] = [];

    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30 * 60 * 1000); // 30-minute intervals
      mockReadings.push({
        id: 10 - i,
        timestamp: time.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        moisture: Math.round(40 + Math.random() * 30),
        temperature: Math.round(22 + Math.random() * 6),
        humidity: Math.round(60 + Math.random() * 20),
      });
    }

    setReadings(mockReadings);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sensor History</h1>
        <p className="text-muted-foreground mt-1">Historical sensor readings from your ESP32 device</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Moisture (%)</TableHead>
              <TableHead className="text-right">Temperature (°C)</TableHead>
              <TableHead className="text-right">Humidity (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((reading) => (
              <TableRow key={reading.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{reading.id}</TableCell>
                <TableCell>{reading.timestamp}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      reading.moisture < 30
                        ? "bg-warning/10 text-warning"
                        : reading.moisture > 60
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {reading.moisture}%
                  </span>
                </TableCell>
                <TableCell className="text-right">{reading.temperature}°C</TableCell>
                <TableCell className="text-right">{reading.humidity}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          📊 Showing the last 10 sensor readings. Data is currently simulated for demonstration.
        </p>
      </Card>
    </div>
  );
}

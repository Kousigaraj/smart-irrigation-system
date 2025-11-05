import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle } from "lucide-react";

interface ZoneData {
  name: string;
  soilMoisture: number;
}

interface HistoryRecord {
  _id: string;
  createdAt: string;
  temperature: number;
  humidity: number;
  zones: ZoneData[];
}

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("https://smart-irrigation-backend-rsqq.onrender.com/api/history/data");
        const data = await res.json();
        setRecords(data);
        setLastUpdate(new Date(data[0]?.createdAt));
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000); // auto-refresh every 5s
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
        <h1 className="text-3xl font-bold text-foreground">Sensor History</h1>
        <p className="text-muted-foreground mt-1">
          Historical sensor readings from your ESP32 device
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Timestamp</TableHead>
              {records[0]?.zones.map((zone, i) => (
                <TableHead key={i} className="text-right">
                  {zone.name || `Zone ${i + 1}`} Moisture (%)
                </TableHead>
              ))}
              <TableHead className="text-right">Temperature (°C)</TableHead>
              <TableHead className="text-right">Humidity (%)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              records
                .slice(-10)
                .map((record, index) => (
                  <TableRow key={record._id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {new Date(record.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>

                    {record.zones.map((zone, i) => (
                      <TableCell key={i} className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            zone.soilMoisture < 30
                              ? "bg-warning/10 text-warning"
                              : zone.soilMoisture > 60
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {zone.soilMoisture}%
                        </span>
                      </TableCell>
                    ))}

                    <TableCell className="text-right">{record.temperature.toFixed(1)}°C</TableCell>
                    <TableCell className="text-right">{record.humidity.toFixed(1)}%</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          📊 Showing the last 10 sensor readings (auto-refreshes every 5 seconds)
        </p>
      </Card>
    </div>
  );
}

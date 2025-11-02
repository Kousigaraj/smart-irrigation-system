import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Thermometer, CloudRain } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WeatherDay {
  date: string;
  temp: number;
  humidity: number;
  rainfall: number;
  rainProb: number;
  windSpeed: number;
  description: string;
}

export default function Weather() {
  const [city, setCity] = useState("Loading...");
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/weather");
        if (!res.ok) throw new Error("Failed to fetch weather data");

        const data = await res.json();

        if (!data.forecast || !Array.isArray(data.forecast)) {
          throw new Error("Invalid weather data format");
        }

        // Convert API response (3-hour intervals) into daily summaries
        const days: Record<
          string,
          {
            temps: number[];
            humidities: number[];
            winds: number[];
            rain: number;
            pops: number[];
            description: string;
          }
        > = {};

        data.forecast.forEach((item: any) => {
          const date = item.dt_txt.split(" ")[0];
          if (!days[date]) {
            days[date] = {
              temps: [],
              humidities: [],
              winds: [],
              rain: 0,
              pops: [],
              description: item.weather?.[0]?.description || "N/A",
            };
          }
          days[date].temps.push(item.main.temp);
          days[date].humidities.push(item.main.humidity);
          days[date].winds.push(item.wind.speed);
          days[date].rain += item.rain?.["3h"] || 0;
          days[date].pops.push(item.pop || 0);
        });

        const dailyForecast: WeatherDay[] = Object.entries(days).map(
          ([date, stats], index) => ({
            date: index === 0 ? "Today" : index === 1 ? "Tomorrow" : `Day ${index + 1}`,
            temp: parseFloat(
              (stats.temps.reduce((a, b) => a + b, 0) / stats.temps.length).toFixed(1)
            ),
            humidity: Math.round(
              stats.humidities.reduce((a, b) => a + b, 0) / stats.humidities.length
            ),
            rainfall: parseFloat(stats.rain.toFixed(1)),
            rainProb: Math.round(
              (stats.pops.reduce((a, b) => a + b, 0) / stats.pops.length) * 100
            ),
            windSpeed: parseFloat(
              (stats.winds.reduce((a, b) => a + b, 0) / stats.winds.length).toFixed(1)
            ),
            description: stats.description,
          })
        );

        setCity(data.city);
        setForecast(dailyForecast.slice(0, 5)); // Only 5 days
        setLoading(false);

        toast({
          title: "Weather Updated",
          description: `Fetched latest forecast for ${data.city}`,
        });
      } catch (error: any) {
        console.error("Weather fetch error:", error);
        toast({
          title: "Weather Fetch Failed",
          description: error.message || "Unable to get weather data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Fetching weather data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Weather Forecast</h1>
        <p className="text-muted-foreground mt-1">
          5-day weather outlook for {city}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forecast.map((day, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{day.date}</h3>
                <Cloud className="h-8 w-8 text-secondary" />
              </div>

              <p className="text-sm text-muted-foreground capitalize">
                {day.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="font-semibold">{day.temp}°C</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Rain Probability</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      day.rainProb > 60 ? "text-blue-600" : "text-muted-foreground"
                    }`}
                  >
                    {day.rainProb}%
                  </span>
                </div>

                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Rainfall</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      day.rainfall > 10 ? "text-warning" : ""
                    }`}
                  >
                    {day.rainfall} mm
                  </span>
                </div> */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Wind Speed</span>
                  </div>
                  <span className="font-semibold">{day.windSpeed} km/h</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Humidity</span>
                  </div>
                  <span className="font-semibold">{day.humidity}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

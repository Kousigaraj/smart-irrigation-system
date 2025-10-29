import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Thermometer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WeatherDay {
  date: string;
  temp: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
}

export default function Weather() {
  const [city, setCity] = useState("Loading...");
  const [forecast, setForecast] = useState<WeatherDay[]>([]);

  useEffect(() => {
    // Get city from settings or use default
    const savedSettings = localStorage.getItem("irrigationSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCity(settings.city || "Your Location");
    } else {
      setCity("Your Location");
    }

    // Mock weather data for demonstration
    // In production, fetch from OpenWeatherMap API
    const mockForecast: WeatherDay[] = [
      { date: "Today", temp: 26, humidity: 65, rainfall: 10, windSpeed: 12, description: "Partly Cloudy" },
      { date: "Tomorrow", temp: 24, humidity: 70, rainfall: 40, windSpeed: 15, description: "Light Rain" },
      { date: "Day 3", temp: 27, humidity: 60, rainfall: 5, windSpeed: 10, description: "Sunny" },
      { date: "Day 4", temp: 25, humidity: 68, rainfall: 20, windSpeed: 14, description: "Cloudy" },
      { date: "Day 5", temp: 23, humidity: 75, rainfall: 60, windSpeed: 18, description: "Heavy Rain" },
    ];

    setForecast(mockForecast);

    // Show info about API integration
    toast({
      title: "Weather Forecast",
      description: "Connect OpenWeatherMap API in Settings for live data",
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Weather Forecast</h1>
        <p className="text-muted-foreground mt-1">5-day weather outlook for {city}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forecast.map((day, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{day.date}</h3>
                <Cloud className="h-8 w-8 text-secondary" />
              </div>

              <p className="text-sm text-muted-foreground">{day.description}</p>

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
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Rainfall</span>
                  </div>
                  <span className={`font-semibold ${day.rainfall > 50 ? "text-warning" : ""}`}>{day.rainfall}%</span>
                </div>

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

      <Card className="p-6 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Add your OpenWeatherMap API key in Settings to get real-time weather data for your location.
        </p>
      </Card>
    </div>
  );
}

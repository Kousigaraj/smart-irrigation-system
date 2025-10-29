import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SettingsData {
  moistureThreshold: number;
  deviceName: string;
  apiEndpoint: string;
  city: string;
  weatherApiKey: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    moistureThreshold: 30,
    deviceName: "ESP32-Garden-01",
    apiEndpoint: "http://192.168.1.100",
    city: "Your City",
    weatherApiKey: "",
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("irrigationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("irrigationSettings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleChange = (field: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your irrigation system</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input
              id="deviceName"
              value={settings.deviceName}
              onChange={(e) => handleChange("deviceName", e.target.value)}
              placeholder="ESP32-Garden-01"
            />
            <p className="text-xs text-muted-foreground">Identifier for your ESP32 device</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moistureThreshold">Moisture Threshold (%)</Label>
            <Input
              id="moistureThreshold"
              type="number"
              min="0"
              max="100"
              value={settings.moistureThreshold}
              onChange={(e) => handleChange("moistureThreshold", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Irrigation will activate when moisture drops below this value
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiEndpoint">API Endpoint</Label>
            <Input
              id="apiEndpoint"
              value={settings.apiEndpoint}
              onChange={(e) => handleChange("apiEndpoint", e.target.value)}
              placeholder="http://192.168.1.100"
            />
            <p className="text-xs text-muted-foreground">Backend server URL for ESP32 communication</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={settings.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Your City"
            />
            <p className="text-xs text-muted-foreground">Location for weather forecast</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weatherApiKey">OpenWeatherMap API Key</Label>
            <Input
              id="weatherApiKey"
              type="password"
              value={settings.weatherApiKey}
              onChange={(e) => handleChange("weatherApiKey", e.target.value)}
              placeholder="Enter your API key"
            />
            <p className="text-xs text-muted-foreground">
              Get your free API key at{" "}
              <a
                href="https://openweathermap.org/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openweathermap.org
              </a>
            </p>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

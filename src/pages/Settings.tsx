import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  cropType: string;
  soilType: string;
  moistureThreshold: number;
}

interface SettingsData {
  deviceName: string;
  apiEndpoint: string;
  city: string;
  weatherApiKey: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    deviceName: "ESP32-Garden-01",
    apiEndpoint: "http://192.168.1.100",
    city: "Your City",
    weatherApiKey: "",
  });

  const [zones, setZones] = useState<Zone[]>([
    {
      id: "zone-1",
      name: "Zone 1 - North Field",
      cropType: "Wheat",
      soilType: "Clay",
      moistureThreshold: 35,
    },
    {
      id: "zone-2",
      name: "Zone 2 - South Field",
      cropType: "Corn",
      soilType: "Loam",
      moistureThreshold: 30,
    },
    {
      id: "zone-3",
      name: "Zone 3 - East Garden",
      cropType: "Vegetables",
      soilType: "Sandy",
      moistureThreshold: 40,
    },
  ]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("irrigationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedZones = localStorage.getItem("irrigationZones");
    if (savedZones) {
      setZones(JSON.parse(savedZones));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("irrigationSettings", JSON.stringify(settings));
    localStorage.setItem("irrigationZones", JSON.stringify(zones));
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleChange = (field: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleZoneChange = (zoneId: string, field: keyof Zone, value: string | number) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === zoneId ? { ...zone, [field]: value } : zone))
    );
  };

  const addZone = () => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      cropType: "",
      soilType: "",
      moistureThreshold: 30,
    };
    setZones((prev) => [...prev, newZone]);
  };

  const removeZone = (zoneId: string) => {
    setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    toast({
      title: "Zone Removed",
      description: "The zone has been deleted.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your irrigation system and zones</p>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
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
        </div>
      </Card>

      {/* Zone Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Zone Configuration</h2>
          <Button onClick={addZone} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </div>
        <div className="space-y-4">
          {zones.map((zone, index) => (
            <Card key={zone.id} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-foreground">Zone {index + 1}</h3>
                <Button onClick={() => removeZone(zone.id)} variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`zone-name-${zone.id}`}>Zone Name</Label>
                  <Input
                    id={`zone-name-${zone.id}`}
                    value={zone.name}
                    onChange={(e) => handleZoneChange(zone.id, "name", e.target.value)}
                    placeholder="Zone 1 - North Field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`zone-crop-${zone.id}`}>Crop Type</Label>
                  <Input
                    id={`zone-crop-${zone.id}`}
                    value={zone.cropType}
                    onChange={(e) => handleZoneChange(zone.id, "cropType", e.target.value)}
                    placeholder="Wheat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`zone-soil-${zone.id}`}>Soil Type</Label>
                  <Input
                    id={`zone-soil-${zone.id}`}
                    value={zone.soilType}
                    onChange={(e) => handleZoneChange(zone.id, "soilType", e.target.value)}
                    placeholder="Clay"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`zone-threshold-${zone.id}`}>Moisture Threshold (%)</Label>
                  <Input
                    id={`zone-threshold-${zone.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={zone.moistureThreshold}
                    onChange={(e) => handleZoneChange(zone.id, "moistureThreshold", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">
        Save All Settings
      </Button>
    </div>
  );
}

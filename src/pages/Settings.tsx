import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2} from "lucide-react";

interface Zone {
  _id?: string;
  id?: string;
  name: string;
  cropType: string;
  soilType: string;
  threshold: number;
}

interface SettingsData {
  city: string;
  openWeatherApiKey: string;
  zones: Zone[];
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    city: "",
    openWeatherApiKey: "",
    zones: [],
  });
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // 🔹 Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://smart-irrigation-backend-rsqq.onrender.com/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();

        setSettings({
          city: data.city || "",
          openWeatherApiKey: data.openWeatherApiKey || "",
          zones: data.zones || [],
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load settings from backend.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 🔹 Save settings to backend
  const handleSave = async () => {
    setButtonLoading(true);
    try {
      const res = await fetch("https://smart-irrigation-backend-rsqq.onrender.com/api/settings", {
        method: "PUT", // Use PUT for updates
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to update settings");

      const updated = await res.json();
      setSettings(updated);

      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not save settings to backend.",
        variant: "destructive",
      });
    } finally{
      setButtonLoading(false);
    }
  };

  // 🔹 Handle top-level settings
  const handleChange = (field: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // 🔹 Handle zone changes (works for both _id and id)
  const handleZoneChange = (zoneKey: string, field: keyof Zone, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      zones: prev.zones.map((zone) =>
        (zone._id === zoneKey || zone.id === zoneKey)
          ? { ...zone, [field]: value }
          : zone
      ),
    }));
  };

  // 🔹 Add new zone
  const addZone = () => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${settings.zones.length + 1}`,
      cropType: "",
      soilType: "",
      threshold: 30,
    };
    setSettings((prev) => ({ ...prev, zones: [...prev.zones, newZone] }));
  };

  // 🔹 Remove zone
  const removeZone = (zoneKey: string) => {
    setSettings((prev) => ({
      ...prev,
      zones: prev.zones.filter((zone) => zone._id !== zoneKey && zone.id !== zoneKey),
    }));

    toast({
      title: "Zone Removed",
      description: "The zone has been deleted.",
    });
  };

  if (loading)
  return (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
      <p className="text-sm font-medium">Loading settings data...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your irrigation system and zones
        </p>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={settings.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Your City"
            />
            <p className="text-xs text-muted-foreground">
              Location for weather forecast
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weatherApiKey">OpenWeatherMap API Key</Label>
            <Input
              id="weatherApiKey"
              type="password"
              value={settings.openWeatherApiKey}
              onChange={(e) => handleChange("openWeatherApiKey", e.target.value)}
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
          {settings.zones.map((zone, index) => (
            <Card key={zone._id || zone.id} className="p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  Zone {index + 1}
                </h3>
                <Button
                  onClick={() => removeZone(zone._id || zone.id!)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`zone-name-${zone._id || zone.id}`}>Zone Name</Label>
                  <Input
                    id={`zone-name-${zone._id || zone.id}`}
                    value={zone.name}
                    onChange={(e) =>
                      handleZoneChange(zone._id || zone.id!, "name", e.target.value)
                    }
                    placeholder="Zone 1 - North Field"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`zone-crop-${zone._id || zone.id}`}>Crop Type</Label>
                  <Input
                    id={`zone-crop-${zone._id || zone.id}`}
                    value={zone.cropType}
                    onChange={(e) =>
                      handleZoneChange(zone._id || zone.id!, "cropType", e.target.value)
                    }
                    placeholder="Wheat"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`zone-soil-${zone._id || zone.id}`}>Soil Type</Label>
                  <Input
                    id={`zone-soil-${zone._id || zone.id}`}
                    value={zone.soilType}
                    onChange={(e) =>
                      handleZoneChange(zone._id || zone.id!, "soilType", e.target.value)
                    }
                    placeholder="Clay"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`zone-threshold-${zone._id || zone.id}`}>
                    Moisture Threshold (%)
                  </Label>
                  <Input
                    id={`zone-threshold-${zone._id || zone.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={zone.threshold}
                    onChange={(e) =>
                      handleZoneChange(
                        zone._id || zone.id!,
                        "threshold",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">
        {buttonLoading ?
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
          </> 
          :
          "Save All Settings"
        }
      </Button>
    </div>
  );
}

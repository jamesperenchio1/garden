"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { IoTDevice } from "@/types";
import {
  Plus,
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  Waves,
  Zap,
  Wifi,
  WifiOff,
  AlertTriangle,
  Sun,
  Camera,
  CloudSun,
  ToggleLeft,
} from "lucide-react";

type DeviceType = IoTDevice["type"];

const deviceMeta: Record<
  DeviceType,
  { label: string; icon: React.ReactNode; unit: string; min: number; max: number }
> = {
  ph_sensor: { label: "pH Sensor", icon: <Gauge className="size-4" />, unit: "pH", min: 5.5, max: 7.0 },
  ec_sensor: { label: "EC Sensor", icon: <Activity className="size-4" />, unit: "mS/cm", min: 1.0, max: 3.0 },
  temp_sensor: { label: "Temperature", icon: <Thermometer className="size-4" />, unit: "°C", min: 18, max: 32 },
  humidity_sensor: { label: "Humidity", icon: <Droplets className="size-4" />, unit: "%", min: 40, max: 80 },
  light_sensor: { label: "Light", icon: <Sun className="size-4" />, unit: "lux", min: 5000, max: 50000 },
  flow_meter: { label: "Flow Meter", icon: <Waves className="size-4" />, unit: "L/min", min: 0.5, max: 10 },
  pump_controller: { label: "Pump", icon: <Zap className="size-4" />, unit: "on/off", min: 0, max: 1 },
  valve_controller: { label: "Valve", icon: <ToggleLeft className="size-4" />, unit: "open/close", min: 0, max: 1 },
  camera: { label: "Camera", icon: <Camera className="size-4" />, unit: "frames", min: 0, max: 30 },
  weather_station: { label: "Weather", icon: <CloudSun className="size-4" />, unit: "—", min: 0, max: 1 },
};

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function simulateReading(type: DeviceType): { value: number; unit: string } {
  const meta = deviceMeta[type];
  const spread = (meta.max - meta.min) * 0.3;
  const val = randomInRange(meta.min - spread, meta.max + spread);
  return { value: Number(val.toFixed(2)), unit: meta.unit };
}

const automationExamples = [
  { condition: "If pH < 5.5 then alert", type: "ph_sensor" as DeviceType },
  { condition: "If EC > 3.0 then alert", type: "ec_sensor" as DeviceType },
  { condition: "If temperature > 35°C then turn on fan", type: "temp_sensor" as DeviceType },
  { condition: "If humidity < 30% then alert", type: "humidity_sensor" as DeviceType },
  { condition: "If flow < 0.5 L/min then check pump", type: "flow_meter" as DeviceType },
];

export default function IoTDashboardPage() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [devName, setDevName] = useState("");
  const [devType, setDevType] = useState<DeviceType>("ph_sensor");
  const [thresholdMin, setThresholdMin] = useState("");
  const [thresholdMax, setThresholdMax] = useState("");

  // Simulate readings
  useEffect(() => {
    const id = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => {
          if (!d.connected) return d;
          const reading = simulateReading(d.type);
          return {
            ...d,
            lastReading: {
              value: reading.value,
              unit: reading.unit,
              timestamp: new Date(),
            },
            batteryLevel: Math.max(
              0,
              (d.batteryLevel ?? 100) - Math.random() * 0.2
            ),
          };
        })
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function addDevice() {
    if (!devName.trim()) return;
    const meta = deviceMeta[devType];
    const reading = simulateReading(devType);
    const device: IoTDevice = {
      id: Math.random().toString(36).slice(2),
      name: devName.trim(),
      type: devType,
      connected: true,
      lastReading: {
        value: reading.value,
        unit: reading.unit,
        timestamp: new Date(),
      },
      batteryLevel: Math.random() * 30 + 70,
      alertsEnabled: true,
      thresholdMin: thresholdMin ? Number(thresholdMin) : meta.min,
      thresholdMax: thresholdMax ? Number(thresholdMax) : meta.max,
    };
    setDevices((prev) => [...prev, device]);
    setDevName("");
    setThresholdMin("");
    setThresholdMax("");
    setAddOpen(false);
  }

  function toggleConnected(id: string) {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
  }

  const alertCount = useMemo(() => {
    return devices.filter((d) => {
      if (!d.connected || !d.lastReading) return false;
      const min = d.thresholdMin ?? deviceMeta[d.type].min;
      const max = d.thresholdMax ?? deviceMeta[d.type].max;
      return d.lastReading.value < min || d.lastReading.value > max;
    }).length;
  }, [devices]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">IoT Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor sensors and controllers in real time
          </p>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" />
              {alertCount} alert{alertCount > 1 ? "s" : ""}
            </Badge>
          )}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger>
              <Button size="sm">
                <Plus className="mr-1 size-4" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add IoT Device</DialogTitle>
                <DialogDescription>
                  Connect a new sensor or controller
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="d-name">Device name</Label>
                  <Input
                    id="d-name"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="e.g. Reservoir pH"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(deviceMeta) as DeviceType[]).map((t) => (
                      <Button
                        key={t}
                        type="button"
                        variant={devType === t ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDevType(t)}
                      >
                        {deviceMeta[t].icon}
                        <span className="ml-1 text-xs">
                          {deviceMeta[t].label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="t-min">Threshold min</Label>
                    <Input
                      id="t-min"
                      type="number"
                      step="0.1"
                      value={thresholdMin}
                      onChange={(e) => setThresholdMin(e.target.value)}
                      placeholder={String(deviceMeta[devType].min)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="t-max">Threshold max</Label>
                    <Input
                      id="t-max"
                      type="number"
                      step="0.1"
                      value={thresholdMax}
                      onChange={(e) => setThresholdMax(e.target.value)}
                      placeholder={String(deviceMeta[devType].max)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addDevice}>Add Device</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          <Activity className="mx-auto mb-2 size-10 opacity-50" />
          No devices connected. Add your first sensor to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((d) => {
            const meta = deviceMeta[d.type];
            const val = d.lastReading?.value ?? 0;
            const min = d.thresholdMin ?? meta.min;
            const max = d.thresholdMax ?? meta.max;
            const outOfRange = d.connected && (val < min || val > max);
            return (
              <Card
                key={d.id}
                className={cn(
                  "transition-shadow",
                  outOfRange && "border-destructive/40 shadow-sm"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-8 items-center justify-center rounded-md",
                          d.connected
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{d.name}</CardTitle>
                        <div className="text-xs text-muted-foreground">
                          {meta.label}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {outOfRange && (
                        <Badge variant="destructive" className="text-[10px]">
                          Alert
                        </Badge>
                      )}
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => toggleConnected(d.id)}
                        title={d.connected ? "Connected" : "Disconnected"}
                      >
                        {d.connected ? (
                          <Wifi className="size-4 text-emerald-500" />
                        ) : (
                          <WifiOff className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span
                      className={cn(
                        "text-2xl font-semibold",
                        outOfRange ? "text-destructive" : "text-foreground"
                      )}
                    >
                      {d.lastReading ? d.lastReading.value : "—"}
                    </span>
                    <span className="mb-0.5 text-xs text-muted-foreground">
                      {meta.unit}
                    </span>
                  </div>

                  {d.lastReading && (
                    <div className="text-[10px] text-muted-foreground">
                      Last update:{" "}
                      {d.lastReading.timestamp.toLocaleTimeString()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Battery</span>
                      <span>
                        {d.batteryLevel ? Math.round(d.batteryLevel) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={d.batteryLevel ?? 0}
                      className="h-1.5"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Automation Rules */}
      <div className="mt-6">
        <Accordion>
          <AccordionItem value="rules">
            <AccordionTrigger className="text-sm font-medium">
              Automation Rules
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {automationExamples.map((rule, i) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex size-7 items-center justify-center rounded bg-background text-muted-foreground">
                        {deviceMeta[rule.type].icon}
                      </div>
                      <div className="text-sm">{rule.condition}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

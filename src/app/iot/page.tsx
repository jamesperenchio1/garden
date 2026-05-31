'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Activity, Wifi, WifiOff, Plus, Trash2, Droplets, Thermometer, Sun, Wind, Battery } from 'lucide-react';

export type DeviceType = 'ph_sensor' | 'ec_sensor' | 'temp_sensor' | 'humidity_sensor' | 'light_sensor' | 'flow_meter' | 'pump_controller' | 'valve_controller' | 'camera' | 'weather_station';

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  connected: boolean;
  lastReading?: {
    value: number;
    unit: string;
    timestamp: Date;
  };
  batteryLevel?: number;
  mqttTopic?: string;
  ipAddress?: string;
  location?: string;
  alertsEnabled: boolean;
  thresholdMin?: number;
  thresholdMax?: number;
}

const DEVICE_TYPE_CONFIG: Record<DeviceType, { label: string; icon: React.ReactNode; unit: string; defaultMin: number; defaultMax: number }> = {
  ph_sensor: { label: 'pH Sensor', icon: <Droplets className="h-4 w-4" />, unit: 'pH', defaultMin: 5.5, defaultMax: 6.5 },
  ec_sensor: { label: 'EC Sensor', icon: <Activity className="h-4 w-4" />, unit: 'mS/cm', defaultMin: 1.0, defaultMax: 2.5 },
  temp_sensor: { label: 'Temperature', icon: <Thermometer className="h-4 w-4" />, unit: '°C', defaultMin: 18, defaultMax: 30 },
  humidity_sensor: { label: 'Humidity', icon: <Wind className="h-4 w-4" />, unit: '%', defaultMin: 50, defaultMax: 80 },
  light_sensor: { label: 'Light', icon: <Sun className="h-4 w-4" />, unit: 'lux', defaultMin: 10000, defaultMax: 50000 },
  flow_meter: { label: 'Flow Meter', icon: <Droplets className="h-4 w-4" />, unit: 'L/min', defaultMin: 0.5, defaultMax: 5.0 },
  pump_controller: { label: 'Pump', icon: <Activity className="h-4 w-4" />, unit: 'on/off', defaultMin: 0, defaultMax: 1 },
  valve_controller: { label: 'Valve', icon: <Droplets className="h-4 w-4" />, unit: 'on/off', defaultMin: 0, defaultMax: 1 },
  camera: { label: 'Camera', icon: <Activity className="h-4 w-4" />, unit: 'status', defaultMin: 0, defaultMax: 1 },
  weather_station: { label: 'Weather', icon: <Wind className="h-4 w-4" />, unit: 'var', defaultMin: 0, defaultMax: 100 },
};

const DEMO_DEVICES: IoTDevice[] = [
  {
    id: 'demo-ph-01',
    name: 'Reservoir pH',
    type: 'ph_sensor',
    connected: true,
    lastReading: { value: 6.1, unit: 'pH', timestamp: new Date(Date.now() - 5 * 60000) },
    batteryLevel: 87,
    mqttTopic: 'garden/reservoir/ph',
    location: 'Main Reservoir',
    alertsEnabled: true,
    thresholdMin: 5.5,
    thresholdMax: 6.5,
  },
  {
    id: 'demo-ec-01',
    name: 'Nutrient EC',
    type: 'ec_sensor',
    connected: true,
    lastReading: { value: 1.8, unit: 'mS/cm', timestamp: new Date(Date.now() - 3 * 60000) },
    batteryLevel: 92,
    mqttTopic: 'garden/reservoir/ec',
    location: 'Main Reservoir',
    alertsEnabled: true,
    thresholdMin: 1.2,
    thresholdMax: 2.2,
  },
  {
    id: 'demo-temp-01',
    name: 'Greenhouse Temp',
    type: 'temp_sensor',
    connected: true,
    lastReading: { value: 29.4, unit: '°C', timestamp: new Date(Date.now() - 2 * 60000) },
    batteryLevel: 65,
    mqttTopic: 'garden/greenhouse/temp',
    location: 'Greenhouse',
    alertsEnabled: true,
    thresholdMin: 20,
    thresholdMax: 32,
  },
  {
    id: 'demo-pump-01',
    name: 'Main Pump',
    type: 'pump_controller',
    connected: false,
    lastReading: { value: 0, unit: 'off', timestamp: new Date(Date.now() - 60 * 60000) },
    mqttTopic: 'garden/system/pump',
    location: 'Pump House',
    alertsEnabled: true,
  },
];

export default function IoTPage() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('ph_sensor');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceLocation, setNewDeviceLocation] = useState('');

  useEffect(() => {
    // Load from localStorage or seed with demos
    const stored = localStorage.getItem('garden.iot.devices');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDevices(parsed.map((d: IoTDevice) => ({
          ...d,
          lastReading: d.lastReading ? { ...d.lastReading, timestamp: new Date(d.lastReading.timestamp) } : undefined,
        })));
      } catch {
        setDevices(DEMO_DEVICES);
      }
    } else {
      setDevices(DEMO_DEVICES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('garden.iot.devices', JSON.stringify(devices));
  }, [devices]);

  const addDevice = () => {
    const config = DEVICE_TYPE_CONFIG[newDeviceType];
    const device: IoTDevice = {
      id: `iot-${Date.now()}`,
      name: newDeviceName || config.label,
      type: newDeviceType,
      connected: false,
      location: newDeviceLocation || undefined,
      alertsEnabled: true,
      thresholdMin: config.defaultMin,
      thresholdMax: config.defaultMax,
    };
    setDevices([...devices, device]);
    setShowAddDialog(false);
    setNewDeviceName('');
    setNewDeviceLocation('');
  };

  const removeDevice = (id: string) => {
    setDevices(devices.filter((d) => d.id !== id));
  };

  const toggleConnection = (id: string) => {
    setDevices(devices.map((d) => {
      if (d.id !== id) return d;
      const connected = !d.connected;
      return {
        ...d,
        connected,
        lastReading: connected ? (d.lastReading ?? { value: configValue(d), unit: DEVICE_TYPE_CONFIG[d.type].unit, timestamp: new Date() }) : d.lastReading,
      };
    }));
  };

  const configValue = (d: IoTDevice): number => {
    const config = DEVICE_TYPE_CONFIG[d.type];
    if (d.type === 'ph_sensor') return 6.0;
    if (d.type === 'ec_sensor') return 1.5;
    if (d.type === 'temp_sensor') return 26;
    if (d.type === 'humidity_sensor') return 65;
    if (d.type === 'light_sensor') return 25000;
    if (d.type === 'flow_meter') return 2.0;
    return 1;
  };

  const updateThreshold = (id: string, field: 'thresholdMin' | 'thresholdMax', value: number) => {
    setDevices(devices.map((d) => d.id === id ? { ...d, [field]: value } : d));
  };

  const simulateReading = (id: string) => {
    setDevices(devices.map((d) => {
      if (d.id !== id || !d.connected) return d;
      const config = DEVICE_TYPE_CONFIG[d.type];
      let value = configValue(d);
      // Add some random noise
      const noise = (Math.random() - 0.5) * (value * 0.1);
      value = Math.round((value + noise) * 10) / 10;
      return {
        ...d,
        lastReading: { value, unit: config.unit, timestamp: new Date() },
        batteryLevel: Math.max(0, (d.batteryLevel ?? 100) - Math.random() * 2),
      };
    }));
  };

  const getStatusColor = (d: IoTDevice) => {
    if (!d.connected) return 'bg-gray-100 text-gray-500';
    if (!d.lastReading) return 'bg-blue-100 text-blue-700';
    if (d.thresholdMin !== undefined && d.lastReading.value < d.thresholdMin) return 'bg-red-100 text-red-700';
    if (d.thresholdMax !== undefined && d.lastReading.value > d.thresholdMax) return 'bg-red-100 text-red-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusLabel = (d: IoTDevice) => {
    if (!d.connected) return 'Offline';
    if (!d.lastReading) return 'Online';
    if (d.thresholdMin !== undefined && d.lastReading.value < d.thresholdMin) return 'Low Alert';
    if (d.thresholdMax !== undefined && d.lastReading.value > d.thresholdMax) return 'High Alert';
    return 'Normal';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Devices</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and control IoT sensors, pumps, and automation.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      <Tabs defaultValue="devices">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="readings">Live Readings</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => {
              const config = DEVICE_TYPE_CONFIG[device.type];
              return (
                <Card key={device.id} className={device.connected ? '' : 'opacity-70'}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${device.connected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {config.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{device.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{config.label}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${getStatusColor(device)}`}>
                        {getStatusLabel(device)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {device.connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        Connection
                      </span>
                      <Switch
                        checked={device.connected}
                        onCheckedChange={() => toggleConnection(device.id)}
                      />
                    </div>

                    {device.lastReading && (
                      <div className="p-2 bg-muted rounded text-center">
                        <span className="text-2xl font-bold">{device.lastReading.value}</span>
                        <span className="text-sm text-muted-foreground ml-1">{device.lastReading.unit}</span>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(device.lastReading.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    )}

                    {device.batteryLevel !== undefined && (
                      <div className="flex items-center gap-2 text-xs">
                        <Battery className="h-3 w-3" />
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${device.batteryLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${device.batteryLevel}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground">{Math.round(device.batteryLevel)}%</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => simulateReading(device.id)}
                        disabled={!device.connected}
                      >
                        Simulate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeDevice(device.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="readings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Sensor Feed</CardTitle>
              <CardDescription>Real-time data from connected devices</CardDescription>
            </CardHeader>
            <CardContent>
              {devices.filter((d) => d.connected).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No connected devices.</p>
              ) : (
                <div className="space-y-2">
                  {devices.filter((d) => d.connected).map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        {DEVICE_TYPE_CONFIG[d.type].icon}
                        <span className="text-sm font-medium">{d.name}</span>
                        <span className="text-xs text-muted-foreground">{d.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {d.lastReading ? (
                          <span className="text-sm font-mono">
                            {d.lastReading.value} {d.lastReading.unit}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No data</span>
                        )}
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(d).includes('green') ? 'bg-green-500' : getStatusColor(d).includes('red') ? 'bg-red-500' : 'bg-blue-500'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Automation Rules</CardTitle>
              <CardDescription>Set thresholds and trigger actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.map((d) => {
                const config = DEVICE_TYPE_CONFIG[d.type];
                if (d.type === 'camera' || d.type === 'weather_station') return null;
                return (
                  <div key={d.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{d.name}</span>
                      <Switch
                        checked={d.alertsEnabled}
                        onCheckedChange={(v) => setDevices(devices.map((dev) => dev.id === d.id ? { ...dev, alertsEnabled: v } : dev))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Min Threshold ({config.unit})</Label>
                        <Input
                          type="number"
                          value={d.thresholdMin ?? ''}
                          onChange={(e) => updateThreshold(d.id, 'thresholdMin', Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Max Threshold ({config.unit})</Label>
                        <Input
                          type="number"
                          value={d.thresholdMax ?? ''}
                          onChange={(e) => updateThreshold(d.id, 'thresholdMax', Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Device Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <CardTitle className="text-base">Add Device</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Device Type</Label>
                <Select value={newDeviceType} onValueChange={(v) => setNewDeviceType(v as DeviceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEVICE_TYPE_CONFIG).map(([type, cfg]) => (
                      <SelectItem key={type} value={type}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} placeholder={DEVICE_TYPE_CONFIG[newDeviceType].label} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Location</Label>
                <Input value={newDeviceLocation} onChange={(e) => setNewDeviceLocation(e.target.value)} placeholder="e.g. Greenhouse, Reservoir" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={addDevice}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

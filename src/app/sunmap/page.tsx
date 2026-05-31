'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, RotateCcw, Info } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  heightMeters: number;
  label: string;
}

interface GardenBed {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PIXELS_PER_METER = 50;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Solar declination approximations by month (degrees)
const SOLAR_DECLINATION: number[] = [
  -23.1, -17.3, -8.0, 4.1, 15.0, 21.8,
  23.2, 18.2, 8.6, -2.9, -14.2, -21.5,
];

// Daylight hours approximations by month for Bangkok (13.75°N)
const DAYLIGHT_HOURS: number[] = [
  11.3, 11.6, 12.1, 12.4, 12.7, 12.8,
  12.8, 12.6, 12.3, 11.9, 11.5, 11.2,
];

export default function SunMapPage() {
  const { location } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [hour, setHour] = useState(12);
  const [showShadows, setShowShadows] = useState(true);
  const [showSunPath, setShowSunPath] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);

  // Default garden layout
  const [beds] = useState<GardenBed[]>([
    { id: 'bed-1', x: 100, y: 100, width: 200, height: 80, label: 'Bed 1: Leafy Greens' },
    { id: 'bed-2', x: 350, y: 100, width: 200, height: 80, label: 'Bed 2: Fruiting Veg' },
    { id: 'bed-3', x: 100, y: 220, width: 200, height: 80, label: 'Bed 3: Herbs' },
    { id: 'bed-4', x: 350, y: 220, width: 200, height: 80, label: 'Bed 4: Root Crops' },
    { id: 'bed-5', x: 100, y: 340, width: 450, height: 80, label: 'Bed 5: Large Plants' },
  ]);

  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { id: 'wall-north', x: 50, y: 40, width: 700, height: 20, heightMeters: 2.5, label: 'North Wall' },
    { id: 'house', x: 550, y: 450, width: 200, height: 120, heightMeters: 6, label: 'House' },
    { id: 'tree-1', x: 80, y: 480, width: 60, height: 60, heightMeters: 8, label: 'Large Tree' },
    { id: 'shed', x: 400, y: 480, width: 100, height: 80, heightMeters: 3, label: 'Shed' },
  ]);

  const [draggedObstacle, setDraggedObstacle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const latitude = location.latitude ?? 13.75; // Bangkok default

  // Solar position calculation
  const calculateSolarPosition = useCallback((monthIndex: number, localHour: number) => {
    const declination = SOLAR_DECLINATION[monthIndex];
    const daylight = DAYLIGHT_HOURS[monthIndex];
    const sunrise = 12 - daylight / 2;
    const sunset = 12 + daylight / 2;

    if (localHour < sunrise || localHour > sunset) {
      return { altitude: -10, azimuth: 180, visible: false, sunrise, sunset };
    }

    // Hour angle: 0 at solar noon, -15°/hr before, +15°/hr after
    const hourAngle = (localHour - 12) * 15;

    // Solar altitude
    const latRad = (latitude * Math.PI) / 180;
    const decRad = (declination * Math.PI) / 180;
    const haRad = (hourAngle * Math.PI) / 180;

    const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
    const altitude = (Math.asin(sinAlt) * 180) / Math.PI;

    // Solar azimuth
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
    let azimuth = (Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180) / Math.PI;
    if (hourAngle > 0) azimuth = 360 - azimuth;

    return { altitude, azimuth, visible: altitude > 0, sunrise, sunset };
  }, [latitude]);

  // Check if a point is in shadow
  const isPointInShadow = useCallback((px: number, py: number, sunAlt: number, sunAz: number) => {
    if (sunAlt <= 0) return true;

    for (const obs of obstacles) {
      if (sunAlt <= 0) continue;
      const shadowLengthMeters = obs.heightMeters / Math.tan((sunAlt * Math.PI) / 180);
      const shadowLengthPixels = shadowLengthMeters * PIXELS_PER_METER;

      const azRad = ((sunAz - 90) * Math.PI) / 180;
      const dx = Math.cos(azRad) * shadowLengthPixels;
      const dy = Math.sin(azRad) * shadowLengthPixels;

      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const toPx = px - cx;
      const toPy = py - cy;

      const dot = toPx * dx + toPy * dy;
      if (dot < 0) continue;

      const shadowLen = Math.sqrt(dx * dx + dy * dy);
      if (shadowLen === 0) continue;
      const proj = dot / shadowLen;
      if (proj > shadowLen) continue;

      const perpX = toPx - (dx / shadowLen) * proj;
      const perpY = toPy - (dy / shadowLen) * proj;
      const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);

      const obsRadius = Math.max(obs.width, obs.height) / 2;
      const shadowWidth = obsRadius * (1 + proj / shadowLen * 0.5);

      if (perpDist < shadowWidth) return true;
    }
    return false;
  }, [obstacles]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sun = calculateSolarPosition(month, hour);

    // Clear
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += PIXELS_PER_METER) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += PIXELS_PER_METER) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Compass
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('N ↑', CANVAS_WIDTH / 2 - 10, 20);
    ctx.fillText('E →', CANVAS_WIDTH - 25, CANVAS_HEIGHT / 2);
    ctx.fillText('S ↓', CANVAS_WIDTH / 2 - 10, CANVAS_HEIGHT - 10);
    ctx.fillText('W ←', 10, CANVAS_HEIGHT / 2);

    // Draw shadows
    if (showShadows && sun.visible) {
      for (const obs of obstacles) {
        const sunAlt = sun.altitude;
        const sunAz = sun.azimuth;
        if (sunAlt <= 0) continue;
        const shadowLengthMeters = obs.heightMeters / Math.tan((sunAlt * Math.PI) / 180);
        const shadowLengthPixels = shadowLengthMeters * PIXELS_PER_METER;
        const azRad = ((sunAz - 90) * Math.PI) / 180;
        const dx = Math.cos(azRad) * shadowLengthPixels;
        const dy = Math.sin(azRad) * shadowLengthPixels;
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const obsRadius = Math.max(obs.width, obs.height) / 2;
        const shadowWidth = obsRadius * 1.5;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.moveTo(
          cx - shadowWidth * Math.cos((sunAz * Math.PI) / 180 + Math.PI / 2),
          cy - shadowWidth * Math.sin((sunAz * Math.PI) / 180 + Math.PI / 2)
        );
        ctx.lineTo(
          cx + shadowWidth * Math.cos((sunAz * Math.PI) / 180 + Math.PI / 2),
          cy + shadowWidth * Math.sin((sunAz * Math.PI) / 180 + Math.PI / 2)
        );
        ctx.lineTo(
          cx + dx + shadowWidth * 0.5 * Math.cos((sunAz * Math.PI) / 180 + Math.PI / 2),
          cy + dy + shadowWidth * 0.5 * Math.sin((sunAz * Math.PI) / 180 + Math.PI / 2)
        );
        ctx.lineTo(
          cx + dx - shadowWidth * 0.5 * Math.cos((sunAz * Math.PI) / 180 + Math.PI / 2),
          cy + dy - shadowWidth * 0.5 * Math.sin((sunAz * Math.PI) / 180 + Math.PI / 2)
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw sun path arc
    if (showSunPath) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      let first = true;
      for (let h = Math.ceil(sun.sunrise); h <= Math.floor(sun.sunset); h += 0.5) {
        const s = calculateSolarPosition(month, h);
        if (!s.visible) continue;
        const pathX = CANVAS_WIDTH / 2 + (s.azimuth - 180) * 2;
        const pathY = 50 + (90 - s.altitude) * 3;
        if (first) {
          ctx.moveTo(pathX, pathY);
          first = false;
        } else {
          ctx.lineTo(pathX, pathY);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (sun.visible) {
        const sunX = CANVAS_WIDTH / 2 + (sun.azimuth - 180) * 2;
        const sunY = 50 + (90 - sun.altitude) * 3;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText('☀', sunX - 4, sunY + 3);
      }
    }

    // Draw garden beds
    for (const bed of beds) {
      const isSelected = bed.id === selectedBed;
      const centerX = bed.x + bed.width / 2;
      const centerY = bed.y + bed.height / 2;
      const inShadow = isPointInShadow(centerX, centerY, sun.altitude, sun.azimuth);

      ctx.fillStyle = isSelected ? '#dcfce7' : inShadow ? '#f1f5f9' : '#fef9c3';
      ctx.strokeStyle = isSelected ? '#16a34a' : inShadow ? '#94a3b8' : '#eab308';
      ctx.lineWidth = isSelected ? 3 : 2;

      ctx.fillRect(bed.x, bed.y, bed.width, bed.height);
      ctx.strokeRect(bed.x, bed.y, bed.width, bed.height);

      ctx.fillStyle = '#334155';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bed.label, centerX, centerY + 4);

      if (inShadow && sun.visible) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.fillText('☁ Shadow', centerX, centerY + 18);
      } else if (sun.visible) {
        ctx.fillStyle = '#eab308';
        ctx.font = '10px sans-serif';
        ctx.fillText('☀ Full sun', centerX, centerY + 18);
      }
    }

    // Draw obstacles
    for (const obs of obstacles) {
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y + obs.height / 2 + 3);
      ctx.fillText(`${obs.heightMeters}m`, obs.x + obs.width / 2, obs.y + obs.height / 2 + 14);
    }

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(10, CANVAS_HEIGHT - 80, 140, 70);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(10, CANVAS_HEIGHT - 80, 140, 70);
    ctx.fillStyle = '#334155';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', 15, CANVAS_HEIGHT - 65);
    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(15, CANVAS_HEIGHT - 55, 15, 10);
    ctx.strokeRect(15, CANVAS_HEIGHT - 55, 15, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText('Full sun', 35, CANVAS_HEIGHT - 47);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(15, CANVAS_HEIGHT - 38, 15, 10);
    ctx.strokeRect(15, CANVAS_HEIGHT - 38, 15, 10);
    ctx.fillStyle = '#334155';
    ctx.fillText('Shadow', 35, CANVAS_HEIGHT - 30);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('─ Sun path', 15, CANVAS_HEIGHT - 15);
  }, [month, hour, showShadows, showSunPath, obstacles, beds, selectedBed, calculateSolarPosition, isPointInShadow]);

  // Animation
  useEffect(() => {
    if (!animating) return;
    const sun = calculateSolarPosition(month, hour);
    if (hour >= Math.floor(sun.sunset)) {
      setAnimating(false);
      return;
    }
    const timer = setTimeout(() => setHour((h) => h + 0.25), 200);
    return () => clearTimeout(timer);
  }, [animating, hour, month, calculateSolarPosition]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const bed of beds) {
      if (x >= bed.x && x <= bed.x + bed.width && y >= bed.y && y <= bed.y + bed.height) {
        setSelectedBed(bed.id);
        return;
      }
    }
    setSelectedBed(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const obs of obstacles) {
      if (x >= obs.x && x <= obs.x + obs.width && y >= obs.y && y <= obs.y + obs.height) {
        setDraggedObstacle(obs.id);
        setDragOffset({ x: x - obs.x, y: y - obs.y });
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedObstacle) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setObstacles((prev) =>
      prev.map((obs) =>
        obs.id === draggedObstacle
          ? { ...obs, x: Math.max(0, Math.min(CANVAS_WIDTH - obs.width, x - dragOffset.x)), y: Math.max(0, Math.min(CANVAS_HEIGHT - obs.height, y - dragOffset.y)) }
          : obs
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedObstacle(null);
  };

  const selectedBedData = beds.find((b) => b.id === selectedBed);
  const sun = calculateSolarPosition(month, hour);

  // Daily sun exposure analysis for selected bed
  const analyzeBedExposure = useCallback((bed: GardenBed) => {
    const centerX = bed.x + bed.width / 2;
    const centerY = bed.y + bed.height / 2;
    let sunHours = 0;
    const hourly: { hour: number; sun: boolean; shadow: boolean }[] = [];

    for (let h = Math.ceil(sun.sunrise * 4) / 4; h <= Math.floor(sun.sunset * 4) / 4; h += 0.25) {
      const s = calculateSolarPosition(month, h);
      const inShadow = s.visible ? isPointInShadow(centerX, centerY, s.altitude, s.azimuth) : true;
      if (s.visible && !inShadow) sunHours += 0.25;
      hourly.push({ hour: h, sun: s.visible && !inShadow, shadow: inShadow });
    }

    return { sunHours, hourly };
  }, [month, calculateSolarPosition, isPointInShadow, sun.sunrise, sun.sunset]);

  const bedAnalysis = selectedBedData ? analyzeBedExposure(selectedBedData) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sun & Shadow Map</h1>
          <p className="text-sm text-muted-foreground">
            Visualize sunlight and shadows across your garden throughout the year.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {location.name} · {latitude.toFixed(2)}°N
        </Badge>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Canvas */}
        <Card>
          <CardContent className="pt-6">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-auto border rounded-lg cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Click a bed to analyze. Drag obstacles to reposition. Grid = 1m squares.
            </p>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Time & Season</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Time of Day</Label>
                  <span className="text-xs text-muted-foreground">
                    {String(Math.floor(hour)).padStart(2, '0')}:{String(Math.round((hour % 1) * 60)).padStart(2, '0')}
                  </span>
                </div>
                <Slider
                  value={[hour]}
                  min={5}
                  max={19}
                  step={0.25}
                  onValueChange={(v) => setHour(Array.isArray(v) ? v[0] : v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>05:00</span>
                  <span>12:00</span>
                  <span>19:00</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={animating ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (animating) {
                      setAnimating(false);
                    } else {
                      setHour(Math.ceil(sun.sunrise));
                      setAnimating(true);
                    }
                  }}
                >
                  {animating ? <Moon className="h-4 w-4 mr-1" /> : <Sun className="h-4 w-4 mr-1" />}
                  {animating ? 'Stop' : 'Animate Day'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setHour(12)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shadow-toggle" className="text-sm cursor-pointer">Show Shadows</Label>
                  <Switch id="shadow-toggle" checked={showShadows} onCheckedChange={setShowShadows} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="path-toggle" className="text-sm cursor-pointer">Show Sun Path</Label>
                  <Switch id="path-toggle" checked={showSunPath} onCheckedChange={setShowSunPath} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected bed analysis */}
          {selectedBedData && bedAnalysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Bed Analysis</CardTitle>
                <CardDescription>{selectedBedData.label}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Sun hours today</span>
                  <span className="font-semibold">{bedAnalysis.sunHours.toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Daylight total</span>
                  <span className="font-semibold">{DAYLIGHT_HOURS[month].toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Sun exposure</span>
                  <span className="font-semibold">
                    {Math.round((bedAnalysis.sunHours / DAYLIGHT_HOURS[month]) * 100)}%
                  </span>
                </div>

                {/* Hourly strip */}
                <div className="flex flex-wrap gap-0.5">
                  {bedAnalysis.hourly.filter((_, i) => i % 2 === 0).map((h) => (
                    <div
                      key={h.hour}
                      className={`w-6 h-6 rounded text-[9px] flex items-center justify-center ${
                        h.sun ? 'bg-yellow-200 text-yellow-800' : 'bg-slate-200 text-slate-600'
                      }`}
                      title={`${String(Math.floor(h.hour)).padStart(2, '0')}:${String(Math.round((h.hour % 1) * 60)).padStart(2, '0')}`}
                    >
                      {String(Math.floor(h.hour)).padStart(2, '0')}
                    </div>
                  ))}
                </div>

                <div className="p-2 bg-amber-50 rounded text-xs text-amber-800">
                  <Info className="h-3 w-3 inline mr-1" />
                  {bedAnalysis.sunHours < 4
                    ? 'Low light — consider shade-tolerant crops or relocating.'
                    : bedAnalysis.sunHours < 6
                    ? 'Partial shade — good for leafy greens and herbs.'
                    : 'Full sun — ideal for fruiting vegetables and tropical fruits.'}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Season tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Season Optimizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {latitude < 15 && (
                <>
                  <p className="p-2 bg-green-50 rounded text-green-800">
                    Tropical latitude — sun is high year-round. North-south bed orientation maximizes morning/evening light.
                  </p>
                  {(month >= 2 && month <= 4) && (
                    <p className="p-2 bg-amber-50 rounded text-amber-800">Hot season: Prioritize afternoon shade for sensitive crops.</p>
                  )}
                  {(month >= 5 && month <= 9) && (
                    <p className="p-2 bg-blue-50 rounded text-blue-800">Rainy season: Ensure good drainage. Monitor for fungal issues.</p>
                  )}
                  {(month >= 10 || month <= 1) && (
                    <p className="p-2 bg-cyan-50 rounded text-cyan-800">Cool season: Best time for leafy greens. Maximize sun exposure.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

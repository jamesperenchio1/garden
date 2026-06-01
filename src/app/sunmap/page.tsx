"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { cn } from "@/lib/utils";
import {
  Sun,
  Plus,
  TreePine,
  Building2,
  Fence,
  Trash2,
  Move,
} from "lucide-react";

const BANGKOK_LAT = 13.7563;
const PLOT_W = 800;
const PLOT_H = 600;

type ObstacleType = "tree" | "building" | "fence";

interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SunPos {
  altitude: number; // radians above horizon
  azimuth: number; // radians from north, clockwise
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calcSunPosition(lat: number, date: Date, hour: number): SunPos {
  const dayOfYear = getDayOfYear(date);
  const declination =
    -23.45 * Math.cos(toRad((360 / 365) * (dayOfYear + 10)));
  const latRad = toRad(lat);
  const decRad = toRad(declination);
  const hourAngle = toRad((hour - 12) * 15);

  const sinAlt =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngle);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  const cosAz =
    (Math.sin(decRad) - Math.sin(latRad) * sinAlt) /
    (Math.cos(latRad) * Math.cos(altitude));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (hourAngle > 0) azimuth = 2 * Math.PI - azimuth;

  return { altitude, azimuth };
}

function seasonFromMonth(m: number): string {
  if (m >= 2 && m <= 4) return "Hot (Mar-May)";
  if (m >= 5 && m <= 9) return "Rainy (Jun-Oct)";
  if (m >= 10 && m <= 11) return "Cool (Nov-Dec)";
  return "Cool (Jan-Feb)";
}

const seasonPresets: Record<string, number> = {
  "Hot (Mar-May)": 90,
  "Rainy (Jun-Oct)": 200,
  "Cool (Nov-Dec)": 330,
  "Cool (Jan-Feb)": 30,
};

const obstacleIcons: Record<ObstacleType, React.ReactNode> = {
  tree: <TreePine className="size-4" />,
  building: <Building2 className="size-4" />,
  fence: <Fence className="size-4" />,
};

const obstacleColors: Record<ObstacleType, string> = {
  tree: "bg-emerald-700",
  building: "bg-slate-600",
  fence: "bg-amber-800",
};

export default function SunmapPage() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [hour, setHour] = useState(12);
  const [season, setSeason] = useState(seasonFromMonth(new Date().getMonth()));
  const [addOpen, setAddOpen] = useState(false);
  const [obType, setObType] = useState<ObstacleType>("tree");
  const [obWidth, setObWidth] = useState("60");
  const [obHeight, setObHeight] = useState("60");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const plotRef = useRef<HTMLDivElement>(null);

  const simDate = useMemo(() => {
    const d = new Date();
    const dayOfYear = seasonPresets[season] || 90;
    d.setMonth(0);
    d.setDate(dayOfYear);
    return d;
  }, [season]);

  const sun = calcSunPosition(BANGKOK_LAT, simDate, hour);

  const shadowLength = sun.altitude > 0.05 ? 120 / Math.tan(sun.altitude) : 5000;
  const shadowDx = Math.sin(sun.azimuth) * Math.min(shadowLength, 300);
  const shadowDy = Math.cos(sun.azimuth) * Math.min(shadowLength, 300);

  function handlePlotMouseDown(e: React.MouseEvent) {
    if (!plotRef.current || draggingId) return;
    const rect = plotRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on obstacle
    const clicked = obstacles.find(
      (o) => x >= o.x && x <= o.x + o.width && y >= o.y && y <= o.y + o.height
    );
    if (clicked) {
      setDraggingId(clicked.id);
      setDragOffset({ x: x - clicked.x, y: y - clicked.y });
    }
  }

  function handlePlotMouseMove(e: React.MouseEvent) {
    if (!draggingId || !plotRef.current) return;
    const rect = plotRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setObstacles((prev) =>
      prev.map((o) =>
        o.id === draggingId
          ? {
              ...o,
              x: Math.max(0, Math.min(PLOT_W - o.width, x)),
              y: Math.max(0, Math.min(PLOT_H - o.height, y)),
            }
          : o
      )
    );
  }

  function handlePlotMouseUp() {
    setDraggingId(null);
  }

  function handleAddObstacle() {
    const w = Number(obWidth) || 60;
    const h = Number(obHeight) || 60;
    const ob: Obstacle = {
      id: Math.random().toString(36).slice(2),
      type: obType,
      x: Math.random() * (PLOT_W - w),
      y: Math.random() * (PLOT_H - h),
      width: w,
      height: h,
    };
    setObstacles((prev) => [...prev, ob]);
    setAddOpen(false);
  }

  function removeObstacle(id: string) {
    setObstacles((prev) => prev.filter((o) => o.id !== id));
  }

  // Simple sunlight analysis: divide plot into a grid and check occlusion
  const analysis = useMemo(() => {
    const cols = 20;
    const rows = 15;
    const cellW = PLOT_W / cols;
    const cellH = PLOT_H / rows;
    let fullSun = 0;
    let partialSun = 0;
    let shade = 0;

    // Sample sun positions from 6am to 6pm
    const sunPositions: SunPos[] = [];
    for (let h = 6; h <= 18; h += 1) {
      sunPositions.push(calcSunPosition(BANGKOK_LAT, simDate, h));
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;

        let sunHours = 0;
        for (const sp of sunPositions) {
          if (sp.altitude <= 0) continue;
          const len = 120 / Math.tan(Math.max(sp.altitude, 0.05));
          const dx = Math.sin(sp.azimuth) * len;
          const dy = Math.cos(sp.azimuth) * len;

          let occluded = false;
          for (const o of obstacles) {
            // Ray from cell opposite sun direction to obstacle
            // Check if obstacle casts shadow over this cell
            // Simplified: project obstacle onto ground and test point-in-rect
            const corners = [
              { x: o.x, y: o.y },
              { x: o.x + o.width, y: o.y },
              { x: o.x + o.width, y: o.y + o.height },
              { x: o.x, y: o.y + o.height },
            ];
            for (const corner of corners) {
              const shadowX = corner.x + dx;
              const shadowY = corner.y + dy;
              // Very simplified: if cell is near shadow vector from obstacle
              if (
                cx >= Math.min(corner.x, shadowX) - 10 &&
                cx <= Math.max(corner.x, shadowX) + 10 &&
                cy >= Math.min(corner.y, shadowY) - 10 &&
                cy <= Math.max(corner.y, shadowY) + 10
              ) {
                occluded = true;
                break;
              }
            }
            if (occluded) break;
          }
          if (!occluded) sunHours++;
        }

        if (sunHours > 6) fullSun++;
        else if (sunHours >= 3) partialSun++;
        else shade++;
      }
    }

    const total = fullSun + partialSun + shade || 1;
    return {
      fullSunPct: Math.round((fullSun / total) * 100),
      partialSunPct: Math.round((partialSun / total) * 100),
      shadePct: Math.round((shade / total) * 100),
    };
  }, [obstacles, simDate]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Sun className="size-5 text-amber-500" />
            Sun Map
          </h1>
          <p className="text-sm text-muted-foreground">
            Simulate sunlight and shadows across your garden plot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger>
              <Button size="sm">
                <Plus className="mr-1 size-4" />
                Add Obstacle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Obstacle</DialogTitle>
                <DialogDescription>
                  Add a tree, building, or fence that casts shadows
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-1.5">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    {(["tree", "building", "fence"] as ObstacleType[]).map(
                      (t) => (
                        <Button
                          key={t}
                          type="button"
                          variant={obType === t ? "default" : "outline"}
                          size="sm"
                          onClick={() => setObType(t)}
                        >
                          {obstacleIcons[t]}
                          <span className="ml-1 capitalize">{t}</span>
                        </Button>
                      )
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="ob-w">Width (px)</Label>
                    <Input
                      id="ob-w"
                      type="number"
                      value={obWidth}
                      onChange={(e) => setObWidth(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="ob-h">Height (px)</Label>
                    <Input
                      id="ob-h"
                      type="number"
                      value={obHeight}
                      onChange={(e) => setObHeight(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddObstacle}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-3">
            <Label className="text-xs">Time of day</Label>
            <div className="mt-1 flex items-center gap-3">
              <Slider
                value={[hour]}
                min={6}
                max={18}
                step={0.5}
                onValueChange={(v) => setHour(Array.isArray(v) ? v[0] : v)}
                className="flex-1"
              />
              <span className="w-16 text-right text-sm font-medium">
                {Math.floor(hour)}:{((hour % 1) * 60).toString().padStart(2, "0")}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <Label className="text-xs">Season</Label>
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.keys(seasonPresets).map((s) => (
                <Button
                  key={s}
                  variant={season === s ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSeason(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <Label className="text-xs">Sun info</Label>
            <div className="mt-1 text-sm text-muted-foreground">
              Altitude: {toDeg(sun.altitude).toFixed(1)}° · Azimuth:{" "}
              {toDeg(sun.azimuth).toFixed(1)}°
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plot */}
      <div className="mb-4 overflow-auto rounded-xl border bg-sky-50/40 dark:bg-sky-950/10">
        <div
          ref={plotRef}
          className="relative select-none"
          style={{ width: PLOT_W, height: PLOT_H }}
          onMouseDown={handlePlotMouseDown}
          onMouseMove={handlePlotMouseMove}
          onMouseUp={handlePlotMouseUp}
          onMouseLeave={handlePlotMouseUp}
        >
          {/* Grid */}
          <svg className="absolute inset-0 pointer-events-none" width={PLOT_W} height={PLOT_H}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={PLOT_W} height={PLOT_H} fill="url(#grid)" />
          </svg>

          {/* Sun indicator */}
          {sun.altitude > 0 && (
            <div
              className="absolute z-10"
              style={{
                left: PLOT_W / 2 + Math.sin(sun.azimuth) * 80 - 12,
                top: PLOT_H / 2 - Math.cos(sun.azimuth) * 80 - 12,
              }}
            >
              <Sun className="size-6 text-amber-500" />
            </div>
          )}

          {/* Shadows */}
          {obstacles.map((o) => (
            <div
              key={`shadow-${o.id}`}
              className="absolute bg-black/20"
              style={{
                left: o.x + Math.min(0, shadowDx),
                top: o.y + Math.min(0, shadowDy),
                width: o.width + Math.abs(shadowDx),
                height: o.height + Math.abs(shadowDy),
                transform: `skew(${toDeg(Math.atan2(shadowDy, o.width || 1)) * 0.1}deg, ${toDeg(Math.atan2(shadowDx, o.height || 1)) * 0.1}deg)`,
                transformOrigin: `${shadowDx > 0 ? "left" : "right"} ${shadowDy > 0 ? "top" : "bottom"}`,
                zIndex: 1,
              }}
            />
          ))}

          {/* Obstacles */}
          {obstacles.map((o) => (
            <div
              key={o.id}
              className={cn(
                "absolute z-20 flex items-center justify-center rounded-md text-white shadow cursor-move",
                obstacleColors[o.type]
              )}
              style={{
                left: o.x,
                top: o.y,
                width: o.width,
                height: o.height,
              }}
              title={`${o.type} (${o.width}×${o.height})`}
            >
              <div className="flex items-center gap-1 text-xs font-medium">
                {obstacleIcons[o.type]}
                <span className="capitalize">{o.type}</span>
              </div>
              <button
                className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                style={{ opacity: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeObstacle(o.id);
                }}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}

          {/* Drag hint */}
          {obstacles.length > 0 && (
            <div className="absolute bottom-2 left-2 z-30 rounded bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
              <Move className="mr-1 inline size-3" />
              Drag obstacles to move
            </div>
          )}
        </div>
      </div>

      {/* Analysis */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium">Full sun</div>
              <div className="text-xs text-muted-foreground">&gt; 6 hours</div>
            </div>
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
            >
              {analysis.fullSunPct}%
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium">Partial sun</div>
              <div className="text-xs text-muted-foreground">3–6 hours</div>
            </div>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            >
              {analysis.partialSunPct}%
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium">Shade</div>
              <div className="text-xs text-muted-foreground">&lt; 3 hours</div>
            </div>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {analysis.shadePct}%
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import type { SoilBed, BedPlant } from "@/types";
import { getCompanionship } from "@/data/companion-planting";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sprout,
  Plus,
  Ruler,
  AlertTriangle,
  ArrowLeft,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SoilPage() {
  const [beds, setBeds] = useState<SoilBed[]>([]);
  const [selectedBed, setSelectedBed] = useState<SoilBed | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addPlantOpen, setAddPlantOpen] = useState(false);

  const [bedName, setBedName] = useState("");
  const [bedWidth, setBedWidth] = useState("");
  const [bedHeight, setBedHeight] = useState("");

  const [plantName, setPlantName] = useState("");
  const [plantX, setPlantX] = useState("");
  const [plantY, setPlantY] = useState("");
  const [plantSpacing, setPlantSpacing] = useState("30");

  useEffect(() => {
    db.soilBeds.toArray().then(setBeds);
  }, []);

  async function saveBeds(next: SoilBed[]) {
    setBeds(next);
    await db.soilBeds.clear();
    await db.soilBeds.bulkAdd(next);
  }

  async function handleAddBed() {
    const width = Number(bedWidth);
    const height = Number(bedHeight);
    if (!bedName.trim() || !width || !height) return;
    const bed: SoilBed = {
      name: bedName.trim(),
      widthCm: width,
      heightCm: height,
      plants: [],
      createdAt: new Date(),
    };
    const next = [...beds, bed];
    await saveBeds(next);
    setBedName("");
    setBedWidth("");
    setBedHeight("");
    setAddOpen(false);
  }

  async function handleAddPlant() {
    if (!selectedBed || !plantName.trim()) return;
    const p: BedPlant = {
      plantName: plantName.trim(),
      x: Number(plantX) || 0,
      y: Number(plantY) || 0,
      spacingRadius: Number(plantSpacing) || 30,
    };
    const next = beds.map((b) =>
      b === selectedBed ? { ...b, plants: [...b.plants, p] } : b
    );
    await saveBeds(next);
    const updated = next.find((b) => b.name === selectedBed.name && b.createdAt.getTime() === selectedBed.createdAt.getTime()) || null;
    setSelectedBed(updated);
    setPlantName("");
    setPlantX("");
    setPlantY("");
    setPlantSpacing("30");
    setAddPlantOpen(false);
  }

  function getWarnings(bed: SoilBed): { pair: [string, string]; reason: string }[] {
    const warnings: { pair: [string, string]; reason: string }[] = [];
    for (let i = 0; i < bed.plants.length; i++) {
      for (let j = i + 1; j < bed.plants.length; j++) {
        const a = bed.plants[i].plantName;
        const b = bed.plants[j].plantName;
        const rel = getCompanionship(a, b);
        if (rel && rel.relationship === "harmful") {
          warnings.push({ pair: [a, b], reason: rel.reason });
        }
      }
    }
    return warnings;
  }

  if (selectedBed) {
    const warnings = getWarnings(selectedBed);
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setSelectedBed(null)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to beds
        </Button>

        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{selectedBed.name}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedBed.widthCm} cm × {selectedBed.heightCm} cm
            </p>
          </div>
          <Dialog open={addPlantOpen} onOpenChange={setAddPlantOpen}>
            <DialogTrigger>
              <Button size="sm">
                <Plus className="mr-1 size-4" />
                Add Plant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Plant to Bed</DialogTitle>
                <DialogDescription>
                  Place a plant in {selectedBed.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="p-name">Plant name</Label>
                  <Input
                    id="p-name"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    placeholder="e.g. Thai Basil"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-x">X (cm)</Label>
                    <Input
                      id="p-x"
                      type="number"
                      value={plantX}
                      onChange={(e) => setPlantX(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="p-y">Y (cm)</Label>
                    <Input
                      id="p-y"
                      type="number"
                      value={plantY}
                      onChange={(e) => setPlantY(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="p-spacing">Spacing radius (cm)</Label>
                  <Input
                    id="p-spacing"
                    type="number"
                    value={plantSpacing}
                    onChange={(e) => setPlantSpacing(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddPlantOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPlant}>Add Plant</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {warnings.length > 0 && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="size-4" />
              Companion warnings
            </div>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-destructive/90">
                  {w.pair[0]} + {w.pair[1]}: {w.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedBed.plants.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            <Sprout className="mx-auto mb-2 size-8 opacity-50" />
            No plants in this bed yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedBed.plants.map((p, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.plantName}</div>
                    <Badge variant="secondary" className="text-xs">
                      <Ruler className="mr-1 size-3" />
                      {p.spacingRadius} cm
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Position: ({p.x}, {p.y})
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Simple visual grid representation */}
        {selectedBed.plants.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium">Bed layout</h3>
            <div className="overflow-auto rounded-lg border bg-muted/30 p-2">
              <div
                className="relative"
                style={{
                  width: Math.min(selectedBed.widthCm, 600),
                  height: Math.min(selectedBed.heightCm, 400),
                }}
              >
                {/* Bed outline */}
                <div className="absolute inset-0 rounded border-2 border-dashed border-muted-foreground/30" />
                {selectedBed.plants.map((p, i) => {
                  const scaleX = Math.min(selectedBed.widthCm, 600) / selectedBed.widthCm;
                  const scaleY = Math.min(selectedBed.heightCm, 400) / selectedBed.heightCm;
                  return (
                    <div
                      key={i}
                      className="absolute flex items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/40"
                      style={{
                        left: p.x * scaleX,
                        top: p.y * scaleY,
                        width: Math.max(20, p.spacingRadius * 2 * Math.min(scaleX, scaleY)),
                        height: Math.max(20, p.spacingRadius * 2 * Math.min(scaleX, scaleY)),
                      }}
                      title={`${p.plantName} (${p.x}, ${p.y})`}
                    >
                      <span className="text-[10px] font-medium text-primary/80 truncate px-1">
                        {p.plantName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Soil Bed Planner</h1>
          <p className="text-sm text-muted-foreground">
            Plan and manage your garden beds
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Plus className="mr-1 size-4" />
              Add Bed
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Soil Bed</DialogTitle>
              <DialogDescription>
                Create a new bed for your garden
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="b-name">Bed name</Label>
                <Input
                  id="b-name"
                  value={bedName}
                  onChange={(e) => setBedName(e.target.value)}
                  placeholder="e.g. Raised Bed A"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="b-width">Width (cm)</Label>
                  <Input
                    id="b-width"
                    type="number"
                    value={bedWidth}
                    onChange={(e) => setBedWidth(e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="b-height">Height (cm)</Label>
                  <Input
                    id="b-height"
                    type="number"
                    value={bedHeight}
                    onChange={(e) => setBedHeight(e.target.value)}
                    placeholder="240"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBed}>Create Bed</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {beds.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          <Grid3X3 className="mx-auto mb-2 size-10 opacity-50" />
          No soil beds yet. Create your first bed to start planning.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beds.map((bed, idx) => {
            const warnings = getWarnings(bed);
            return (
              <Card
                key={idx}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedBed(bed)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{bed.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler className="size-4" />
                    {bed.widthCm} cm × {bed.heightCm} cm
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sprout className="size-4" />
                    {bed.plants.length} plant{bed.plants.length !== 1 ? "s" : ""}
                  </div>
                  {warnings.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertTriangle className="size-3.5" />
                      {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

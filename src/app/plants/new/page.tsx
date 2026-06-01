"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlants } from "@/hooks/use-plants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sprout } from "lucide-react";
import type { PlantCategory, GrowingMethod } from "@/types";

const CATEGORIES: { label: string; value: PlantCategory }[] = [
  { label: "Vegetable", value: "vegetable" },
  { label: "Herb", value: "herb" },
  { label: "Fruit", value: "fruit" },
  { label: "Flower", value: "flower" },
  { label: "Ornamental", value: "ornamental" },
  { label: "Medicinal", value: "medicinal" },
];

const GROWING_METHODS: { label: string; value: GrowingMethod }[] = [
  { label: "Soil", value: "soil" },
  { label: "Hydroponic", value: "hydroponic" },
  { label: "Aeroponic", value: "aeroponic" },
  { label: "Aquaponic", value: "aquaponic" },
];

export default function NewPlantPage() {
  const router = useRouter();
  const { addPlant } = usePlants();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [category, setCategory] = useState<PlantCategory>("vegetable");
  const [growingMethod, setGrowingMethod] = useState<GrowingMethod>("soil");
  const [systemType, setSystemType] = useState("");
  const [location, setLocation] = useState("");
  const [plantedDate, setPlantedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await addPlant({
        name: name.trim(),
        variety: variety.trim() || undefined,
        category,
        growingMethod,
        systemType: systemType.trim() || undefined,
        location: location.trim() || undefined,
        plantedDate: new Date(plantedDate),
        notes: notes.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        healthTags: [],
        updatedAt: new Date(),
      });
      router.push("/plants");
    } catch (err) {
      setSaving(false);
      // eslint-disable-next-line no-console
      console.error("Failed to add plant:", err);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => router.push("/plants")}
      >
        <ArrowLeft className="size-4" />
        Back to Plants
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="size-5 text-primary" />
            Add a New Plant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Thai Basil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Variety */}
            <div className="space-y-1.5">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                placeholder="e.g. Holy Basil (Kaphrao)"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
              />
            </div>

            {/* Category & Growing Method */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PlantCategory)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="growingMethod">Growing Method</Label>
                <select
                  id="growingMethod"
                  value={growingMethod}
                  onChange={(e) => setGrowingMethod(e.target.value as GrowingMethod)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {GROWING_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* System Type & Location */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="systemType">System Type</Label>
                <Input
                  id="systemType"
                  placeholder="e.g. NFT, DWC, Kratky"
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Backyard bed A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Planted Date */}
            <div className="space-y-1.5">
              <Label htmlFor="plantedDate">Planted Date</Label>
              <Input
                id="plantedDate"
                type="date"
                value={plantedDate}
                onChange={(e) => setPlantedDate(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any observations, soil mix, seed source..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="e.g. organic, heirloom, indoor"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/plants")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? "Saving..." : "Add Plant"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

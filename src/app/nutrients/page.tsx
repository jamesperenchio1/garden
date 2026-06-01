"use client";

import * as React from "react";
import {
  nutrientBrands,
  nutrientTargets,
  getNutrientTarget,
} from "@/data/nutrient-brands";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Beaker, Droplets, FlaskConical } from "lucide-react";

const plants = Array.from(
  new Set(nutrientTargets.map((t) => t.plant))
).sort();

const stages = ["seedling", "vegetative", "flowering", "fruiting"] as const;

export default function NutrientsPage() {
  const [selectedPlant, setSelectedPlant] = React.useState(plants[0] || "");
  const [selectedStage, setSelectedStage] =
    React.useState<(typeof stages)[number]>("seedling");
  const [selectedBrand, setSelectedBrand] = React.useState(
    nutrientBrands[0]?.name || ""
  );
  const [reservoirSize, setReservoirSize] = React.useState<string>("");

  const target = getNutrientTarget(selectedPlant, selectedStage);
  const brand = nutrientBrands.find((b) => b.name === selectedBrand);

  const liters = parseFloat(reservoirSize) || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nutrient Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate nutrient targets and mixing ratios for your hydroponic
            setup.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Plant</Label>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {plants.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Growth Stage</Label>
            <select
              value={selectedStage}
              onChange={(e) =>
                setSelectedStage(e.target.value as (typeof stages)[number])
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Nutrient Brand</Label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {nutrientBrands.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} ({b.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Values */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Beaker className="size-4 text-primary" />
                Target Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {target ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">EC</span>
                    <Badge variant="secondary">
                      {target.ec.min} – {target.ec.max} mS/cm
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">pH</span>
                    <Badge variant="secondary">
                      {target.ph.min} – {target.ph.max}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      NPK (ppm)
                    </span>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        N: {target.npk.n}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        P: {target.npk.p}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        K: {target.npk.k}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Micronutrients (ppm)
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {Object.entries(target.micronutrients).map(
                        ([key, value]) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className="text-xs"
                          >
                            {key.toUpperCase()}: {value}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No target data available for this plant/stage combination.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Calculator */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="size-4 text-primary" />
                Mixing Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Reservoir Size (liters)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 20"
                  value={reservoirSize}
                  onChange={(e) => setReservoirSize(e.target.value)}
                  className="h-8"
                />
              </div>

              {liters > 0 && brand && (
                <div className="space-y-2">
                  {brand.products.map((product) => {
                    const mlNeeded =
                      (product.mixingRatio.ml / product.mixingRatio.perLiters) *
                      liters;
                    const isRecommended = product.stage.includes(
                      selectedStage.toLowerCase() as (typeof stages)[number]
                    );
                    return (
                      <div
                        key={product.name}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-2.5",
                          isRecommended
                            ? "border-primary/20 bg-primary/5"
                            : "border-muted bg-muted/30 opacity-60"
                        )}
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.type}
                            {product.npk ? ` • NPK ${product.npk}` : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {mlNeeded.toFixed(1)} ml
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.mixingRatio.ml} ml /{" "}
                            {product.mixingRatio.perLiters} L
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {liters <= 0 && (
                <p className="text-xs text-muted-foreground">
                  Enter a reservoir size to see mixing amounts.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Brand Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="size-4 text-primary" />
              {brand?.name} Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {brand?.products.map((product) => (
                <div
                  key={product.name}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {product.name}
                    </span>
                    <Badge
                      variant={
                        product.type === "base"
                          ? "default"
                          : product.type === "supplement"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {product.type}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {product.npk ? `NPK ${product.npk}` : "No NPK"}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.stage.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          s === selectedStage.toLowerCase() &&
                            "border-primary text-primary"
                        )}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlants } from "@/hooks/use-plants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Sprout, ArrowRight } from "lucide-react";
import type { PlantCategory } from "@/types";

const CATEGORIES: { label: string; value: PlantCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Vegetable", value: "vegetable" },
  { label: "Herb", value: "herb" },
  { label: "Fruit", value: "fruit" },
  { label: "Flower", value: "flower" },
];

function categoryColor(category: PlantCategory): string {
  switch (category) {
    case "vegetable":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "herb":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
    case "fruit":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "flower":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    case "ornamental":
      return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200";
    case "medicinal":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function growingMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    soil: "Soil",
    hydroponic: "Hydroponic",
    aeroponic: "Aeroponic",
    aquaponic: "Aquaponic",
  };
  return labels[method] || method;
}

export default function PlantsPage() {
  const router = useRouter();
  const { plants, loading } = usePlants();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<PlantCategory | "all">("all");

  const filtered = useMemo(() => {
    return plants.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.variety && p.variety.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [plants, activeCategory, search]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Plants</h1>
          <p className="text-muted-foreground">
            {plants.length} {plants.length === 1 ? "plant" : "plants"} in your garden
          </p>
        </div>
        <Button onClick={() => router.push("/plants/new")}>
          <Plus className="size-4" />
          Add Plant
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              size="sm"
              variant={activeCategory === cat.value ? "default" : "outline"}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Plant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Sprout className="mb-3 size-10 text-muted-foreground" />
          <p className="text-lg font-medium">No plants found</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {plants.length === 0
              ? "Start your garden by adding your first plant."
              : "Try adjusting your search or filters."}
          </p>
          {plants.length === 0 && (
            <Button onClick={() => router.push("/plants/new")}>
              <Plus className="size-4" />
              Add Plant
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plant) => (
            <Link key={plant.id} href={`/plants/detail?id=${plant.id}`} className="group">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium group-hover:text-primary">{plant.name}</h3>
                      {plant.variety && (
                        <p className="text-sm text-muted-foreground">{plant.variety}</p>
                      )}
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      className={`${categoryColor(plant.category)} border-0 hover:opacity-90`}
                    >
                      {plant.category}
                    </Badge>
                    <Badge variant="outline">{growingMethodLabel(plant.growingMethod)}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Planted{" "}
                      {new Date(plant.plantedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {plant.healthTags.length > 0 && (
                      <span>{plant.healthTags.length} health note(s)</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

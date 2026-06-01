"use client";

import * as React from "react";
import {
  companionRelations,
  getCompanionsFor,
  getAntagonistsFor,
  getCompanionship,
} from "@/data/companion-planting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Leaf, Skull, Minus } from "lucide-react";

const allPlants = Array.from(
  new Set(
    companionRelations.flatMap((r) => [r.plantA, r.plantB])
  )
).sort();

function PlantCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search plant..." />
          <CommandList>
            <CommandEmpty>No plant found.</CommandEmpty>
            <CommandGroup>
              {allPlants.map((plant) => (
                <CommandItem
                  key={plant}
                  value={plant}
                  onSelect={() => {
                    onChange(plant);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === plant ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {plant}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CompanionsPage() {
  const [selectedPlant, setSelectedPlant] = React.useState("");
  const [plantA, setPlantA] = React.useState("");
  const [plantB, setPlantB] = React.useState("");

  const companions = selectedPlant ? getCompanionsFor(selectedPlant) : [];
  const antagonists = selectedPlant ? getAntagonistsFor(selectedPlant) : [];

  const relatedPlants = new Set(
    companionRelations
      .filter(
        (r) =>
          r.plantA.toLowerCase() === selectedPlant.toLowerCase() ||
          r.plantB.toLowerCase() === selectedPlant.toLowerCase()
      )
      .flatMap((r) => [r.plantA, r.plantB])
  );
  const neutralPlants = allPlants.filter(
    (p) =>
      p.toLowerCase() !== selectedPlant.toLowerCase() &&
      !relatedPlants.has(p)
  );

  const compatibility =
    plantA && plantB && plantA !== plantB
      ? getCompanionship(plantA, plantB)
      : null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Companion Planting Guide
          </h1>
          <p className="text-muted-foreground">
            Discover which plants grow well together and which to keep apart.
          </p>
        </div>

        {/* Plant Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Plant</CardTitle>
          </CardHeader>
          <CardContent>
            <PlantCombobox
              value={selectedPlant}
              onChange={setSelectedPlant}
              placeholder="Choose a plant..."
            />
          </CardContent>
        </Card>

        {selectedPlant && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Beneficial Companions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
                  <Leaf className="size-5" />
                  Beneficial Companions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No known beneficial companions.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {companions.map((relation, idx) => {
                      const other =
                        relation.plantA.toLowerCase() ===
                        selectedPlant.toLowerCase()
                          ? relation.plantB
                          : relation.plantA;
                      return (
                        <div
                          key={idx}
                          className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950"
                        >
                          <div className="font-medium text-green-900 dark:text-green-100">
                            {other}
                          </div>
                          <div className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                            {relation.reason}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Antagonists */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
                  <Skull className="size-5" />
                  Antagonists
                </CardTitle>
              </CardHeader>
              <CardContent>
                {antagonists.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No known antagonists.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {antagonists.map((relation, idx) => {
                      const other =
                        relation.plantA.toLowerCase() ===
                        selectedPlant.toLowerCase()
                          ? relation.plantB
                          : relation.plantA;
                      return (
                        <div
                          key={idx}
                          className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950"
                        >
                          <div className="font-medium text-red-900 dark:text-red-100">
                            {other}
                          </div>
                          <div className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                            {relation.reason}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Neutral */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-400">
                  <Minus className="size-5" />
                  Neutral / No Known Interaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                {neutralPlants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    All other plants have known interactions.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {neutralPlants.map((plant) => (
                      <Badge
                        key={plant}
                        variant="outline"
                        className="text-xs"
                      >
                        {plant}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Separator />

        {/* Compatibility Checker */}
        <Card>
          <CardHeader>
            <CardTitle>Compatibility Checker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Plant A</Label>
                <PlantCombobox
                  value={plantA}
                  onChange={setPlantA}
                  placeholder="Choose plant A..."
                />
              </div>
              <div className="space-y-2">
                <Label>Plant B</Label>
                <PlantCombobox
                  value={plantB}
                  onChange={setPlantB}
                  placeholder="Choose plant B..."
                />
              </div>
            </div>

            {plantA && plantB && plantA !== plantB && (
              <div
                className={cn(
                  "rounded-lg border p-4",
                  !compatibility
                    ? "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                    : compatibility.relationship === "beneficial"
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : compatibility.relationship === "harmful"
                    ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                    : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                )}
              >
                {!compatibility ? (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Minus className="size-5" />
                    <div>
                      <div className="font-medium">Neutral</div>
                      <div className="text-xs">
                        No known interaction between these plants.
                      </div>
                    </div>
                  </div>
                ) : compatibility.relationship === "beneficial" ? (
                  <div className="flex items-start gap-2 text-green-800 dark:text-green-200">
                    <Leaf className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <div className="font-medium">Beneficial</div>
                      <div className="text-xs">{compatibility.reason}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-red-800 dark:text-red-200">
                    <Skull className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <div className="font-medium">Harmful</div>
                      <div className="text-xs">{compatibility.reason}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { usePlants } from "@/hooks/use-plants"
import { usePlantYields, useYieldReference, calculateYieldRating } from "@/hooks/use-yields"
import { predictPlantGrowth } from "@/lib/plant-predictions"
import { getCompanionsFor, getAntagonistsFor } from "@/data/companion-planting"
import { getNutrientTarget } from "@/data/nutrient-brands"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Leaf, Droplets, Sun, Shovel, FlaskConical, Heart, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"

function otherPlant(relation: { plantA: string; plantB: string }, plantName: string): string {
  return relation.plantA.toLowerCase().includes(plantName.toLowerCase()) ? relation.plantB : relation.plantA
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

function PlantDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const { plants, loading } = usePlants()

  const plant = plants.find((p) => String(p.id) === id)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Leaf className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Plant not found</p>
        <Link href="/plants">
          <Button variant="outline">Back to Plants</Button>
        </Link>
      </div>
    )
  }

  const prediction = predictPlantGrowth(plant.name, plant.plantedDate)
  const companions = getCompanionsFor(plant.name)
  const antagonists = getAntagonistsFor(plant.name)
  const nutrient = getNutrientTarget(plant.name, prediction.currentStage)

  const nextDays = daysUntil(prediction.nextMilestoneDate)
  const totalCycle = prediction.predictedLastHarvestDate
    ? Math.max(1, daysUntil(prediction.predictedLastHarvestDate) + prediction.daysSincePlanted)
    : 100
  const progressToNext = Math.max(0, Math.min(100, Math.round((1 - nextDays / totalCycle) * 100)))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/plants")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{plant.name}</h2>
          {plant.variety && <p className="text-muted-foreground">{plant.variety}</p>}
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="outline">{plant.category}</Badge>
          <Badge variant="secondary">{plant.growingMethod}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Growth Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{prediction.currentStage}</p>
            <p className="text-sm text-muted-foreground">{prediction.daysSincePlanted} days since planted</p>
            {prediction.nextMilestone && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Next: {prediction.nextMilestone}</p>
                <Progress value={progressToNext} className="mt-1 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {nextDays > 0 ? `~${nextDays} days` : "Due now"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Heart className="h-4 w-4" />
              Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{plant.healthTags.length} tags</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {plant.healthTags.map((tag, i) => (
                <Badge key={i} variant={tag.severity === "high" ? "destructive" : tag.severity === "medium" ? "default" : "outline"}>
                  {tag.value}
                </Badge>
              ))}
              {plant.healthTags.length === 0 && (
                <span className="text-sm text-muted-foreground">No health issues recorded</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FlaskConical className="h-4 w-4" />
              Nutrients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nutrient ? (
              <div className="space-y-1 text-sm">
                <p>EC: {nutrient.ec.min}–{nutrient.ec.max}</p>
                <p>pH: {nutrient.ph.min}–{nutrient.ph.max}</p>
                <p>NPK: {nutrient.npk.n}-{nutrient.npk.p}-{nutrient.npk.k}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No nutrient data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Companion Plants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {companions.map((c, i) => (
                  <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {otherPlant(c, plant.name)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No known companions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Antagonists
            </CardTitle>
          </CardHeader>
          <CardContent>
            {antagonists.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {antagonists.map((c, i) => (
                  <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {otherPlant(c, plant.name)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No known antagonists</p>
            )}
          </CardContent>
        </Card>
      </div>

      <YieldSection plantId={plant.id!} plantName={plant.name} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Location:</span> {plant.location || "—"}</p>
            <p><span className="font-medium">System:</span> {plant.systemType || "—"}</p>
            <p><span className="font-medium">Planted:</span> {new Date(plant.plantedDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Tags:</span> {plant.tags.join(", ") || "—"}</p>
            {plant.notes && <p className="mt-2 text-muted-foreground">{plant.notes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predicted Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prediction.predictedFloweringDate && (
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Flowering: {new Date(prediction.predictedFloweringDate).toLocaleDateString()}</span>
              </div>
            )}
            {prediction.predictedFruitingDate && (
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-green-500" />
                <span>Fruiting: {new Date(prediction.predictedFruitingDate).toLocaleDateString()}</span>
              </div>
            )}
            {prediction.predictedFirstHarvestDate && (
              <div className="flex items-center gap-2 text-sm">
                <Shovel className="h-4 w-4 text-amber-500" />
                <span>First Harvest: {new Date(prediction.predictedFirstHarvestDate).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function YieldSection({ plantId, plantName }: { plantId: number; plantName: string }) {
  const { yields, totalGrams, loading } = usePlantYields(plantId)
  const { reference } = useYieldReference(plantName)
  const rating = calculateYieldRating(totalGrams, reference)

  if (loading) return <Card className="h-32 animate-pulse bg-muted" />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Yield Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-3xl font-bold">{totalGrams}g</p>
            <p className="text-sm text-muted-foreground">Total harvested</p>
          </div>
          {reference && (
            <div>
              <p className="text-3xl font-bold">{rating}%</p>
              <p className="text-sm text-muted-foreground">of expected ({reference.expectedYieldGramsPerPlant}g)</p>
              <Progress value={Math.min(rating, 100)} className="mt-2 w-40 h-2" />
            </div>
          )}
          <div className="ml-auto">
            <p className="text-sm text-muted-foreground">{yields.length} harvests recorded</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PlantDetailPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    }>
      <PlantDetailContent />
    </Suspense>
  )
}

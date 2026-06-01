"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { db } from "@/lib/db"
import { seedYieldReferences } from "@/data/seed-yield-references"
import { localPlants } from "@/data/local-plants-db"

export function SeedDbInit() {
  useEffect(() => {
    let cancelled = false

    async function seed() {
      try {
        const yieldCount = await db.yieldReferences.count()
        if (yieldCount === 0 && !cancelled) {
          await db.yieldReferences.bulkAdd(seedYieldReferences())
        }

        const customCount = await db.customPlants.count()
        if (customCount === 0 && !cancelled) {
          await db.customPlants.bulkAdd(localPlants)
        }

        if (!cancelled) {
          toast.success("Database initialized")
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to initialize database")
        }
      }
    }

    seed()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}

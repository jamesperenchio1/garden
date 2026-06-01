'use client';

import { useState, useMemo } from 'react';
import { getPlantingWindowsForMonth, getActivityForPlant } from '@/data/thai-plants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type ActivityKey = 'sow' | 'transplant' | 'harvest';

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const plants = useMemo(() => getPlantingWindowsForMonth(month), [month]);

  const prevMonth = () => setMonth((m) => (m === 1 ? 12 : m - 1));
  const nextMonth = () => setMonth((m) => (m === 12 ? 1 : m + 1));

  const groups = useMemo(() => {
    const result: Record<ActivityKey, typeof plants> = {
      sow: [],
      transplant: [],
      harvest: [],
    };
    plants.forEach((plant) => {
      const acts = getActivityForPlant(plant, month);
      if (acts.some((a) => a.type.startsWith('sow') && a.active)) result.sow.push(plant);
      if (acts.some((a) => a.type === 'transplant' && a.active)) result.transplant.push(plant);
      if (acts.some((a) => a.type === 'harvest' && a.active)) result.harvest.push(plant);
    });
    return result;
  }, [plants, month]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planting Calendar</h1>
          <p className="text-muted-foreground">What to plant and when</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            Prev
          </Button>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            Next
          </Button>
        </div>
      </div>

      {plants.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No planting activities for {MONTHS[month - 1]}.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Plant cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plants.map((plant) => {
              const acts = getActivityForPlant(plant, month);
              const active = {
                sow: acts.some((a) => a.type.startsWith('sow') && a.active),
                transplant: acts.some((a) => a.type === 'transplant' && a.active),
                harvest: acts.some((a) => a.type === 'harvest' && a.active),
              };
              return (
                <Card key={plant.plantName}>
                  <CardHeader>
                    <CardTitle className="text-base">{plant.plantName}</CardTitle>
                    <CardDescription className="capitalize">
                      {plant.plantCategory}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {active.sow && (
                        <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
                          Sow
                        </Badge>
                      )}
                      {active.transplant && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100">
                          Transplant
                        </Badge>
                      )}
                      {active.harvest && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100">
                          Harvest
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                      {plant.notes}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Grouped list */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium">By Activity</h2>
            {(['sow', 'transplant', 'harvest'] as ActivityKey[]).map((key) => (
              <div key={key}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {key === 'sow' ? 'Sow' : key === 'transplant' ? 'Transplant' : 'Harvest'}
                </h3>
                {groups[key].length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No {key} activities this month.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {groups[key].map((plant) => (
                      <Card key={plant.plantName} size="sm">
                        <CardContent className="flex items-center justify-between py-3">
                          <span className="text-sm font-medium">{plant.plantName}</span>
                          <Badge variant="secondary" className="capitalize">
                            {plant.plantCategory}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

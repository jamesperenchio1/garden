'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, GitCompare } from 'lucide-react';
import type { HydroSystem } from '@/types/system';
import { growingSystems } from '@/data/growing-systems';
import { COMPONENT_DEFS } from './component-panel';

interface ComparePanelProps {
  systems: HydroSystem[];
  onClose: () => void;
}

interface SystemStats {
  system: HydroSystem;
  componentCount: number;
  connectionCount: number;
  hasPump: boolean;
  hasReservoir: boolean;
  componentTypes: string[];
  estimatedFlowNodes: number;
}

function computeStats(system: HydroSystem): SystemStats {
  const componentCount = system.components.length;
  const connectionCount = system.components.reduce((sum, c) => sum + c.connections.length, 0);
  const hasPump = system.components.some((c) => c.type === 'pump');
  const hasReservoir = system.components.some((c) => c.type === 'reservoir');
  const typeCounts: Record<string, number> = {};
  for (const comp of system.components) {
    typeCounts[comp.type] = (typeCounts[comp.type] ?? 0) + 1;
  }
  const componentTypes = Object.entries(typeCounts).map(
    ([t, n]) => `${COMPONENT_DEFS.find((d) => d.type === t)?.label ?? t}${n > 1 ? ` ×${n}` : ''}`
  );
  // flow node estimate: every connected component contributes
  const connectedIds = new Set(
    system.components.flatMap((c) => [c.id, ...c.connections])
  );
  const estimatedFlowNodes = connectedIds.size;

  return {
    system,
    componentCount,
    connectionCount,
    hasPump,
    hasReservoir,
    componentTypes,
    estimatedFlowNodes,
  };
}

function StatRow({ label, values, good }: { label: string; values: (string | number | boolean)[]; good?: boolean[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${values.length}, 1fr)` }}>
      <div className="text-xs text-muted-foreground py-1.5">{label}</div>
      {values.map((v, i) => {
        const isGood = good ? good[i] : undefined;
        const display = typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v);
        return (
          <div
            key={i}
            className={`text-xs font-medium py-1.5 text-center rounded ${
              isGood === true
                ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                : isGood === false
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                : ''
            }`}
          >
            {display}
          </div>
        );
      })}
    </div>
  );
}

export function ComparePanel({ systems, onClose }: ComparePanelProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    systems.slice(0, 3).map((s) => s.id!).filter(Boolean)
  );

  const toggleSystem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const selected = systems.filter((s) => s.id && selectedIds.includes(s.id));
  const stats = selected.map(computeStats);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Compare Systems</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* System selector */}
      <div className="px-4 py-3 border-b">
        <p className="text-xs text-muted-foreground mb-2">Select up to 4 systems to compare</p>
        <div className="flex flex-wrap gap-2">
          {systems.map((s) => {
            const isSelected = s.id !== undefined && selectedIds.includes(s.id);
            const info = growingSystems.find((g) => g.type === s.type);
            return (
              <button
                key={s.id}
                onClick={() => s.id && toggleSystem(s.id)}
                className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted border-border hover:bg-accent'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {selected.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Select at least one system above</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Header row with system names */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${stats.length}, 1fr)` }}>
              <div />
              {stats.map(({ system }) => {
                const info = growingSystems.find((g) => g.type === system.type);
                return (
                  <div key={system.id} className="text-center">
                    <p className="text-xs font-semibold truncate">{system.name}</p>
                    <Badge variant="outline" className="text-[10px] mt-0.5">{info?.name ?? system.type}</Badge>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Stats comparison */}
            <div className="space-y-1">
              <StatRow
                label="Components"
                values={stats.map((s) => s.componentCount)}
              />
              <StatRow
                label="Connections"
                values={stats.map((s) => s.connectionCount)}
              />
              <StatRow
                label="Has Pump"
                values={stats.map((s) => s.hasPump)}
                good={stats.map((s) => s.hasPump)}
              />
              <StatRow
                label="Has Reservoir"
                values={stats.map((s) => s.hasReservoir)}
                good={stats.map((s) => s.hasReservoir)}
              />
              <StatRow
                label="Flow Nodes"
                values={stats.map((s) => s.estimatedFlowNodes)}
              />
            </div>

            <Separator />

            {/* System info from growing-systems */}
            {stats.map(({ system }) => {
              const info = growingSystems.find((g) => g.type === system.type);
              if (!info) return null;
              return (
                <Card key={system.id} className="text-xs">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm">{system.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-2">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{info.difficulty}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">Water: {info.waterUsage}</Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{info.description}</p>
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400 mb-1">Pros</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {info.pros.slice(0, 3).map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400 mb-1">Cons</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {info.cons.slice(0, 3).map((c) => <li key={c}>{c}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

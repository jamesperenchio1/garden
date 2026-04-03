'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  Link2,
  Unlink,
} from 'lucide-react';
import type { ComponentType, SystemComponent } from '@/types/system';

// ---------------------------------------------------------------------------
// Component catalogue
// ---------------------------------------------------------------------------

interface ComponentDef {
  type: ComponentType;
  label: string;
  description: string;
  colour: string;
}

const COMPONENT_DEFS: ComponentDef[] = [
  { type: 'reservoir', label: 'Reservoir', description: 'Water / nutrient storage tank', colour: 'bg-blue-700' },
  { type: 'pump', label: 'Pump', description: 'Moves nutrient solution', colour: 'bg-gray-800' },
  { type: 'pipe', label: 'Pipe', description: 'Carries water between components', colour: 'bg-gray-400' },
  { type: 'gutter', label: 'Gutter / Rail', description: 'NFT or rail-gutter channel', colour: 'bg-amber-800' },
  { type: 'net_pot', label: 'Net Pot', description: 'Small mesh plant cup', colour: 'bg-gray-700' },
  { type: 'grow_bed', label: 'Grow Bed', description: 'Ebb & flow / media bed', colour: 'bg-green-700' },
  { type: 'air_stone', label: 'Air Stone', description: 'Aerates nutrient solution', colour: 'bg-gray-100' },
  { type: 'valve', label: 'Valve', description: 'Controls water flow', colour: 'bg-red-600' },
  { type: 'drip_emitter', label: 'Drip Emitter', description: 'Precise drip delivery', colour: 'bg-green-500' },
  { type: 'wicking_material', label: 'Wicking Material', description: 'Passive capillary medium', colour: 'bg-stone-500' },
  { type: 'vertical_tower', label: 'Vertical Tower', description: 'Multi-pocket tower', colour: 'bg-green-600' },
  { type: 'fish_tank', label: 'Fish Tank', description: 'Aquaponics fish habitat', colour: 'bg-blue-500' },
];

// ---------------------------------------------------------------------------
// Property editors for selected component
// ---------------------------------------------------------------------------

interface PropertyEditorProps {
  component: SystemComponent;
  allComponents: SystemComponent[];
  onUpdate: (id: string, updates: Partial<SystemComponent>) => void;
  onConnect: (fromId: string, toId: string) => void;
  onRemove: (id: string) => void;
}

function PropertyEditor({ component, allComponents, onUpdate, onConnect, onRemove }: PropertyEditorProps) {
  const def = COMPONENT_DEFS.find((d) => d.type === component.type);

  const updatePosition = (axis: 'x' | 'y' | 'z', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    onUpdate(component.id, {
      position: { ...component.position, [axis]: num },
    });
  };

  const updateRotationY = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    onUpdate(component.id, {
      rotation: { ...component.rotation, y: (num * Math.PI) / 180 },
    });
  };

  const connectableTargets = allComponents.filter(
    (c) => c.id !== component.id && !component.connections.includes(c.id)
  );
  const connectedComponents = allComponents.filter((c) =>
    component.connections.includes(c.id)
  );

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{def?.label ?? component.type}</p>
          <p className="text-xs text-muted-foreground">{component.id}</p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(component.id)}
          className="h-7 w-7"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Separator />

      {/* Position */}
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Position</p>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis}>
              <Label className="text-xs mb-1 block text-center">{axis.toUpperCase()}</Label>
              <Input
                type="number"
                step={0.5}
                value={component.position[axis].toFixed(2)}
                onChange={(e) => updatePosition(axis, e.target.value)}
                className="h-7 text-xs text-center px-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation Y */}
      <div>
        <Label className="text-xs mb-1 block text-muted-foreground uppercase tracking-wide">Rotation Y (°)</Label>
        <Input
          type="number"
          step={15}
          value={Math.round((component.rotation.y * 180) / Math.PI)}
          onChange={(e) => updateRotationY(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      <Separator />

      {/* Connections */}
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Connections</p>
        {connectedComponents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">None</p>
        ) : (
          <div className="space-y-1">
            {connectedComponents.map((c) => {
              const cDef = COMPONENT_DEFS.find((d) => d.type === c.type);
              return (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${cDef?.colour ?? 'bg-gray-400'}`} />
                  <span className="flex-1 truncate">{cDef?.label ?? c.type}</span>
                  <span className="text-muted-foreground">{c.id}</span>
                </div>
              );
            })}
          </div>
        )}

        {connectableTargets.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Connect to:</p>
            <div className="space-y-1">
              {connectableTargets.slice(0, 6).map((c) => {
                const cDef = COMPONENT_DEFS.find((d) => d.type === c.type);
                return (
                  <Button
                    key={c.id}
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs justify-start gap-2"
                    onClick={() => onConnect(component.id, c.id)}
                  >
                    <Link2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{cDef?.label ?? c.type} ({c.id})</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

interface ComponentPanelProps {
  components: SystemComponent[];
  selectedComponentId: string | null;
  onAddComponent: (type: ComponentType) => void;
  onUpdateComponent: (id: string, updates: Partial<SystemComponent>) => void;
  onConnectComponents: (fromId: string, toId: string) => void;
  onRemoveComponent: (id: string) => void;
  onSelectComponent: (id: string | null) => void;
}

export function ComponentPanel({
  components,
  selectedComponentId,
  onAddComponent,
  onUpdateComponent,
  onConnectComponents,
  onRemoveComponent,
  onSelectComponent,
}: ComponentPanelProps) {
  const selected = components.find((c) => c.id === selectedComponentId) ?? null;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Add components section */}
      <div className="flex-shrink-0">
        <div className="px-3 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Components</p>
          <p className="text-xs text-muted-foreground">Click to add to scene</p>
        </div>
        <ScrollArea className="h-[280px]">
          <div className="px-2 py-1 space-y-0.5">
            {COMPONENT_DEFS.map((def) => (
              <button
                key={def.type}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent text-left transition-colors group"
                onClick={() => onAddComponent(def.type)}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${def.colour}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-tight">{def.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">{def.description}</p>
                </div>
                <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Scene components list */}
      <div className="flex-shrink-0">
        <div className="px-3 pt-2 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            In Scene ({components.length})
          </p>
        </div>
        <ScrollArea className="h-[140px]">
          <div className="px-2 py-1 space-y-0.5">
            {components.length === 0 && (
              <p className="text-xs text-muted-foreground italic px-2 py-1">
                No components yet
              </p>
            )}
            {components.map((comp) => {
              const def = COMPONENT_DEFS.find((d) => d.type === comp.type);
              const isSelected = selectedComponentId === comp.id;
              return (
                <button
                  key={comp.id}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => onSelectComponent(isSelected ? null : comp.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${def?.colour ?? 'bg-gray-400'}`} />
                  <span className="text-xs font-medium flex-1 truncate">{def?.label ?? comp.type}</span>
                  <span className="text-[10px] text-muted-foreground">{comp.id}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Properties panel */}
      <div className="flex-1 min-h-0">
        <div className="px-3 pt-2 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Properties</p>
        </div>
        <ScrollArea className="h-full">
          {selected ? (
            <PropertyEditor
              component={selected}
              allComponents={components}
              onUpdate={onUpdateComponent}
              onConnect={onConnectComponents}
              onRemove={onRemoveComponent}
            />
          ) : (
            <p className="text-xs text-muted-foreground italic px-3 py-2">
              Select a component to edit its properties.
            </p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export { COMPONENT_DEFS };

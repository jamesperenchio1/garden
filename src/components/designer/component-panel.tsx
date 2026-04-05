'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  Link2,
  Link,
  Unlink,
  Ruler,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import type {
  Connection,
  ComponentType,
  SystemComponent,
} from '@/types/system';
import { useDesignerStore } from '@/store/designer-store';
import { computePathLength } from './flow-simulation';

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
  pendingConnectFromId: string | null;
  onUpdate: (id: string, updates: Partial<SystemComponent>) => void;
  onRemove: (id: string) => void;
  onStartConnect: (fromId: string) => void;
  onCancelConnect: () => void;
  onRemoveConnection: (fromId: string, toId: string) => void;
  onUpdateConnection: (
    fromId: string,
    toId: string,
    updates: Partial<Connection>
  ) => void;
}

function PropertyEditor({
  component,
  allComponents,
  pendingConnectFromId,
  onUpdate,
  onRemove,
  onStartConnect,
  onCancelConnect,
  onRemoveConnection,
  onUpdateConnection,
}: PropertyEditorProps) {
  const def = COMPONENT_DEFS.find((d) => d.type === component.type);
  const [uniformScale, setUniformScale] = useState(true);

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

  const updateScale = (axis: 'x' | 'y' | 'z', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    if (uniformScale) {
      onUpdate(component.id, { scale: { x: num, y: num, z: num } });
    } else {
      onUpdate(component.id, {
        scale: { ...component.scale, [axis]: num },
      });
    }
  };

  const connectedComponents = allComponents
    .map((c) => {
      const conn = component.connections.find((cn) => cn.toId === c.id);
      return conn ? { target: c, connection: conn } : null;
    })
    .filter((x): x is { target: SystemComponent; connection: Connection } => x !== null);

  const isConnectingFromHere = pendingConnectFromId === component.id;

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

      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Size</p>
          <button
            type="button"
            onClick={() => setUniformScale((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            title={uniformScale ? 'Uniform scale (click to unlock)' : 'Per-axis (click to lock)'}
          >
            {uniformScale ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {uniformScale ? 'Uniform' : 'Per-axis'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis}>
              <Label className="text-xs mb-1 block text-center">{axis.toUpperCase()}</Label>
              <Input
                type="number"
                step={0.1}
                min={0.1}
                value={component.scale[axis].toFixed(2)}
                onChange={(e) => updateScale(axis, e.target.value)}
                className="h-7 text-xs text-center px-1"
                disabled={uniformScale && axis !== 'x'}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Connections */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Connections ({connectedComponents.length})
          </p>
          {isConnectingFromHere ? (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={onCancelConnect}
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={() => onStartConnect(component.id)}
              disabled={pendingConnectFromId !== null}
              title="Click to start a connection, then click another component. Click empty grid to add bends."
            >
              <Link className="h-3 w-3" />
              Start connection
            </Button>
          )}
        </div>

        {isConnectingFromHere && (
          <p className="text-[10px] text-muted-foreground italic mb-2">
            Click on the grid to add a bend, click another component to finish.
          </p>
        )}

        {connectedComponents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">None</p>
        ) : (
          <div className="space-y-2">
            {connectedComponents.map(({ target, connection }) => {
              const cDef = COMPONENT_DEFS.find((d) => d.type === target.type);
              const path = [component.position, ...connection.waypoints, target.position];
              const computedLength = computePathLength(path);
              const displayLength = connection.lengthOverride ?? computedLength;
              return (
                <div
                  key={target.id}
                  className="rounded-md border bg-muted/30 p-2 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${cDef?.colour ?? 'bg-gray-400'}`}
                    />
                    <span className="flex-1 truncate font-medium">
                      {cDef?.label ?? target.type}
                    </span>
                    <button
                      onClick={() => onRemoveConnection(component.id, target.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remove connection"
                    >
                      <Unlink className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Ruler className="h-2.5 w-2.5 text-muted-foreground" />
                    <Input
                      type="number"
                      step={0.1}
                      min={0}
                      value={displayLength.toFixed(2)}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        if (isNaN(n) || n < 0) return;
                        onUpdateConnection(component.id, target.id, {
                          lengthOverride: n,
                        });
                      }}
                      className="h-6 text-[10px] px-1 flex-1"
                    />
                    <span className="text-muted-foreground">m</span>
                    {connection.lengthOverride !== undefined && (
                      <button
                        onClick={() =>
                          onUpdateConnection(component.id, target.id, {
                            lengthOverride: undefined,
                          })
                        }
                        className="text-[9px] text-muted-foreground hover:text-foreground"
                        title="Reset to computed length"
                      >
                        reset
                      </button>
                    )}
                  </div>
                  {connection.waypoints.length > 0 && (
                    <p className="text-[9px] text-muted-foreground">
                      {connection.waypoints.length} bend
                      {connection.waypoints.length === 1 ? '' : 's'} · computed{' '}
                      {computedLength.toFixed(2)}m
                    </p>
                  )}
                </div>
              );
            })}
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
  pendingType: ComponentType | null;
  onSelectType: (type: ComponentType | null) => void;
  onUpdateComponent: (id: string, updates: Partial<SystemComponent>) => void;
  onRemoveComponent: (id: string) => void;
  onSelectComponent: (id: string | null) => void;
}

export function ComponentPanel({
  components,
  selectedComponentId,
  pendingType,
  onSelectType,
  onUpdateComponent,
  onRemoveComponent,
  onSelectComponent,
}: ComponentPanelProps) {
  const selected = components.find((c) => c.id === selectedComponentId) ?? null;

  const connectMode = useDesignerStore((s) => s.connectMode);
  const startConnectMode = useDesignerStore((s) => s.startConnectMode);
  const cancelConnectMode = useDesignerStore((s) => s.cancelConnectMode);
  const removeConnection = useDesignerStore((s) => s.removeConnection);
  const updateConnection = useDesignerStore((s) => s.updateConnection);

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Add components section */}
      <div className="flex-shrink-0">
        <div className="px-3 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Components</p>
          <p className="text-xs text-muted-foreground">
            {pendingType
              ? `Click the grid to place ${pendingType.replace('_', ' ')}`
              : 'Click a component, then click the grid to place'}
          </p>
        </div>
        <ScrollArea className="h-[280px]">
          <div className="px-2 py-1 space-y-0.5">
            {COMPONENT_DEFS.map((def) => {
              const isActive = pendingType === def.type;
              return (
                <button
                  key={def.type}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors group ${
                    isActive
                      ? 'bg-green-100 dark:bg-green-900/30 border border-green-500/50'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => onSelectType(isActive ? null : def.type)}
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${def.colour}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-tight">{def.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight truncate">{def.description}</p>
                  </div>
                  {isActive ? (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">place</Badge>
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                  )}
                </button>
              );
            })}
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
              pendingConnectFromId={connectMode.active ? connectMode.fromId : null}
              onUpdate={onUpdateComponent}
              onRemove={onRemoveComponent}
              onStartConnect={startConnectMode}
              onCancelConnect={cancelConnectMode}
              onRemoveConnection={removeConnection}
              onUpdateConnection={updateConnection}
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

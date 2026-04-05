'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Save,
  Undo2,
  Grid3x3,
  Waves,
  ArrowLeft,
  GitCompare,
  Trash2,
  Link2,
  Sun,
  Moon,
} from 'lucide-react';
import { useDesignerStore } from '@/store/designer-store';
import { useSystems } from '@/hooks/use-systems';
import { ComponentPanel } from '@/components/designer/component-panel';
import type { ComponentType, SystemComponent } from '@/types/system';

// Dynamic import of canvas — Three.js requires browser APIs, no SSR
const SystemCanvas = dynamic(
  () => import('@/components/designer/system-canvas').then((m) => m.SystemCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-muted/20 rounded-lg">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading 3D canvas…</p>
        </div>
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Undo history — simple snapshot stack
// ---------------------------------------------------------------------------

const MAX_HISTORY = 30;

function useHistory(components: SystemComponent[]) {
  const historyRef = useRef<SystemComponent[][]>([]);

  const pushSnapshot = useCallback(() => {
    historyRef.current = [
      ...historyRef.current.slice(-(MAX_HISTORY - 1)),
      JSON.parse(JSON.stringify(components)),
    ];
  }, [components]);

  const popSnapshot = useCallback((): SystemComponent[] | null => {
    if (historyRef.current.length === 0) return null;
    const snap = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    return snap;
  }, []);

  return { pushSnapshot, popSnapshot };
}

// ---------------------------------------------------------------------------
// Pending placement — which type to place on next click
// ---------------------------------------------------------------------------

export default function DesignerEditorPage() {
  const params = useParams();
  const router = useRouter();
  const systemId = Number(params.id);

  const { systems, updateSystem, loading: systemsLoading } = useSystems();

  const {
    components,
    selectedComponentId,
    addComponent,
    removeComponent,
    selectComponent,
    updateComponent,
    clearAll,
    loadComponents,
    theme,
    setTheme,
    connectMode,
    cancelConnectMode,
  } = useDesignerStore();

  const [showGrid, setShowGrid] = useState(true);
  const [showFlow, setShowFlow] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingType, setPendingType] = useState<ComponentType | null>(null);

  const { pushSnapshot, popSnapshot } = useHistory(components);

  // -----------------------------------------------------------------------
  // Load system from IndexedDB on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (systemsLoading) return;
    const sys = systems.find((s) => s.id === systemId);
    if (!sys) return;
    loadComponents(sys.components ?? []);
    setIsDirty(false);
  }, [systemId, systems, systemsLoading, loadComponents]);

  // -----------------------------------------------------------------------
  // Auto-save to IndexedDB on every change
  // -----------------------------------------------------------------------
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAutoSave = useCallback(() => {
    setIsDirty(true);
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      const sys = systems.find((s) => s.id === systemId);
      if (!sys) return;
      await updateSystem(systemId, { components });
      setIsDirty(false);
    }, 1500);
  }, [components, systemId, systems, updateSystem]);

  useEffect(() => {
    if (components.length === 0 && !isDirty) return;
    triggerAutoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components]);

  // -----------------------------------------------------------------------
  // Save immediately
  // -----------------------------------------------------------------------
  const handleSave = useCallback(async () => {
    const sys = systems.find((s) => s.id === systemId);
    if (!sys) return;
    await updateSystem(systemId, { components });
    setIsDirty(false);
    toast.success('System saved');
  }, [components, systemId, systems, updateSystem]);

  // -----------------------------------------------------------------------
  // Undo
  // -----------------------------------------------------------------------
  const handleUndo = useCallback(() => {
    const snap = popSnapshot();
    if (!snap) {
      toast.info('Nothing to undo');
      return;
    }
    loadComponents(snap);
    setIsDirty(true);
  }, [popSnapshot, loadComponents]);

  // -----------------------------------------------------------------------
  // Explicit placement: selecting a component type arms the next floor click.
  // Spam-clicking the catalogue no longer spawns items — nothing happens
  // until the user actually clicks the grid.
  // -----------------------------------------------------------------------
  const handleSelectType = useCallback((type: ComponentType | null) => {
    setPendingType(type);
  }, []);

  const handlePlaceOnCanvas = useCallback(
    (position: { x: number; y: number; z: number }) => {
      if (!pendingType) return;
      pushSnapshot();
      // Clamp y=0 so components rest on the grid plane, never below it.
      addComponent(pendingType, { ...position, y: 0 });
      // keep pendingType active so the user can place multiple of the same
      // type in a row — Esc cancels, clicking the button again toggles off.
      setIsDirty(true);
    },
    [addComponent, pendingType, pushSnapshot]
  );

  const handleUpdateComponent = useCallback(
    (id: string, updates: Partial<SystemComponent>) => {
      pushSnapshot();
      updateComponent(id, updates);
      setIsDirty(true);
    },
    [updateComponent, pushSnapshot]
  );

  const handleRemoveComponent = useCallback(
    (id: string) => {
      pushSnapshot();
      removeComponent(id);
      selectComponent(null);
      setIsDirty(true);
    },
    [removeComponent, selectComponent, pushSnapshot]
  );

  // -----------------------------------------------------------------------
  // Keyboard shortcuts
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (e.key === 'Escape') {
        selectComponent(null);
        setPendingType(null);
        cancelConnectMode();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentId && document.activeElement?.tagName !== 'INPUT') {
          handleRemoveComponent(selectedComponentId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, handleUndo, selectComponent, selectedComponentId, handleRemoveComponent, cancelConnectMode]);

  const currentSystem = systems.find((s) => s.id === systemId);

  if (!systemsLoading && !currentSystem) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">System not found.</p>
        <Button variant="outline" onClick={() => router.push('/designer')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Designer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 md:-m-6">
      {/* ------------------------------------------------------------------ */}
      {/* Toolbar */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-background/95 backdrop-blur flex-shrink-0 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.push('/designer')} className="h-7 gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{currentSystem?.name ?? '…'}</p>
        </div>

        {isDirty && (
          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
            Unsaved
          </Badge>
        )}

        <Separator orientation="vertical" className="h-5" />

        {/* Toggle buttons */}
        <Button
          variant={showGrid ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowGrid((v) => !v)}
          className="h-7 gap-1"
          title="Toggle grid"
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Grid</span>
        </Button>

        <Button
          variant={showFlow ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowFlow((v) => !v)}
          className="h-7 gap-1"
          title="Toggle flow simulation"
        >
          <Waves className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Flow</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-7 gap-1"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          className="h-7 gap-1"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Undo</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          className="h-7 gap-1 bg-green-600 hover:bg-green-700"
          title="Save (Ctrl+S)"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main area: left panel + canvas + right panel */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Component Panel */}
        <div className="w-56 flex-shrink-0 border-r bg-background overflow-hidden flex flex-col">
          <ComponentPanel
            components={components}
            selectedComponentId={selectedComponentId}
            pendingType={pendingType}
            onSelectType={handleSelectType}
            onUpdateComponent={handleUpdateComponent}
            onRemoveComponent={handleRemoveComponent}
            onSelectComponent={selectComponent}
          />
        </div>

        {/* Center: 3D Canvas */}
        <div className="flex-1 min-w-0 relative">
          {pendingType && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
              Click on the grid to place {pendingType.replace('_', ' ')} — Esc to cancel
            </div>
          )}
          {connectMode.active && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
              Connecting… click a component to finish, click the grid to add a bend — Esc to cancel
            </div>
          )}
          <SystemCanvas
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={selectComponent}
            onPlaceComponent={handlePlaceOnCanvas}
            showGrid={showGrid}
            showFlow={showFlow}
          />
        </div>

        {/* Right: Selected component quick info */}
        <div className="w-52 flex-shrink-0 border-l bg-background overflow-hidden">
          <SelectedComponentPanel
            components={components}
            selectedComponentId={selectedComponentId}
            onUpdate={handleUpdateComponent}
            onRemove={handleRemoveComponent}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right panel — selected component details / quick actions
// ---------------------------------------------------------------------------

interface SelectedComponentPanelProps {
  components: SystemComponent[];
  selectedComponentId: string | null;
  onUpdate: (id: string, updates: Partial<SystemComponent>) => void;
  onRemove: (id: string) => void;
}

function SelectedComponentPanel({
  components,
  selectedComponentId,
  onUpdate,
  onRemove,
}: SelectedComponentPanelProps) {
  const selected = components.find((c) => c.id === selectedComponentId);

  if (!selected) {
    return (
      <div className="p-3 h-full flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Details
        </p>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Click a component in the scene or panel to select it.
          </p>
        </div>
        <div className="border rounded-md p-2.5 mt-auto space-y-1 text-[11px] text-muted-foreground">
          <p className="font-medium text-foreground text-xs mb-1.5">Shortcuts</p>
          <p>Ctrl+S — save</p>
          <p>Ctrl+Z — undo</p>
          <p>Delete — remove selected</p>
          <p>Esc — deselect</p>
          <p>Scroll — zoom</p>
          <p>Right-drag — pan</p>
        </div>
      </div>
    );
  }

  const labelMap: Record<string, string> = {
    reservoir: 'Reservoir',
    pump: 'Pump',
    pipe: 'Pipe',
    gutter: 'Gutter/Rail',
    net_pot: 'Net Pot',
    grow_bed: 'Grow Bed',
    air_stone: 'Air Stone',
    valve: 'Valve',
    drip_emitter: 'Drip Emitter',
    wicking_material: 'Wicking Material',
    vertical_tower: 'Vertical Tower',
    fish_tank: 'Fish Tank',
  };

  const connectedIds = new Set(selected.connections.map((conn) => conn.toId));
  const connectedComponents = components.filter((c) => connectedIds.has(c.id));

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          Selected
        </p>
        <p className="font-semibold text-sm">{labelMap[selected.type] ?? selected.type}</p>
        <p className="text-[10px] text-muted-foreground">{selected.id}</p>
      </div>

      <Separator />

      <div className="space-y-1.5 text-xs">
        <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">Position</p>
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis} className="flex items-center justify-between">
            <span className="text-muted-foreground">{axis.toUpperCase()}</span>
            <span className="font-mono">{selected.position[axis].toFixed(2)}</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-1.5 text-xs">
        <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">
          Connections ({connectedComponents.length})
        </p>
        {connectedComponents.length === 0 ? (
          <p className="text-muted-foreground italic">None</p>
        ) : (
          connectedComponents.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <Link2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="truncate">{labelMap[c.type] ?? c.type}</span>
            </div>
          ))
        )}
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-7 text-xs gap-1"
          onClick={() => onRemove(selected.id)}
        >
          <Trash2 className="h-3 w-3" />
          Remove
        </Button>
      </div>
    </div>
  );
}

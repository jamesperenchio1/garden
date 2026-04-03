'use client';

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { getCompanionship, getCompanionsFor } from '@/data/companion-planting';
import type { BedPlant, SoilBed, Compatibility } from '@/types/companion';

// ─── constants ──────────────────────────────────────────────────────────────

const MIN_SCALE = 0.3;
const MAX_SCALE = 8;
const GRID_STEP_CM = 10; // major grid every 10 cm
const PLANT_RADIUS_PX = 18; // visual radius of the plant circle at scale=1
const SPACING_ALPHA = 0.12;

// Compatibility colours
const COMPAT_COLOR: Record<Compatibility, string> = {
  beneficial: '#22c55e', // green-500
  harmful: '#ef4444',    // red-500
  neutral: '#eab308',    // yellow-500
};

// Pastel fill colours rotated per plant index
const PLANT_FILLS = [
  '#bbf7d0', '#bfdbfe', '#fde68a', '#fecaca', '#e9d5ff',
  '#fed7aa', '#a7f3d0', '#fce7f3', '#cffafe', '#d1fae5',
];

// ─── helpers ────────────────────────────────────────────────────────────────

function plantFill(index: number): string {
  return PLANT_FILLS[index % PLANT_FILLS.length];
}

/**
 * For each plant in the bed, compute the "worst" compatibility with any
 * neighbour that is within (plant.spacingRadius + neighbour.spacingRadius) * scale pixels.
 * Returns a map: plant index → Compatibility | null
 */
function computeCompatibilityOverlay(
  plants: BedPlant[]
): (Compatibility | null)[] {
  return plants.map((p, i) => {
    // Use numeric rank: 0=null, 1=neutral, 2=beneficial, 3=harmful
    let rank = 0;
    for (let j = 0; j < plants.length; j++) {
      if (i === j) continue;
      const other = plants[j];
      const dx = p.position.x - other.position.x;
      const dy = p.position.y - other.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > p.spacingRadius + other.spacingRadius) continue;
      const rel = getCompanionship(p.plantName, other.plantName);
      if (!rel) continue;
      const r = rel.compatibility === 'harmful' ? 3 : rel.compatibility === 'beneficial' ? 2 : 1;
      if (r > rank) rank = r;
      if (rank === 3) break; // worst possible — stop early
    }
    if (rank === 3) return 'harmful';
    if (rank === 2) return 'beneficial';
    if (rank === 1) return 'neutral';
    return null;
  });
}

// ─── types ───────────────────────────────────────────────────────────────────

interface BedDesignerProps {
  bed: SoilBed;
  /** Called after every change so the parent can persist to IndexedDB. */
  onPlantsChange: (plants: BedPlant[]) => void;
}

// ─── component ───────────────────────────────────────────────────────────────

export function BedDesigner({ bed, onPlantsChange }: BedDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // canvas logical size
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 });

  // view-state
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 40, y: 40 }); // canvas px where bed (0,0) is drawn

  // plants (local copy, synced up on every change)
  const [plants, setPlants] = useState<BedPlant[]>(bed.plants);
  const plantsRef = useRef<BedPlant[]>(bed.plants);

  // drag state
  const dragging = useRef<{ index: number; offsetX: number; offsetY: number } | null>(null);
  // pan state
  const panning = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  // selected plant index (for info panel)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // keep plantsRef in sync
  useEffect(() => {
    plantsRef.current = plants;
  }, [plants]);

  // sync when bed changes from outside (e.g., loaded from DB)
  useEffect(() => {
    setPlants(bed.plants);
    plantsRef.current = bed.plants;
  }, [bed.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── resize observer ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      setCanvasSize({
        w: Math.floor(e.contentRect.width),
        h: Math.max(400, Math.floor(e.contentRect.height)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── fit bed to canvas on mount / bed dimension change ───────────────────
  useEffect(() => {
    const padding = 60; // px
    const scaleX = (canvasSize.w - padding * 2) / bed.width;
    const scaleY = (canvasSize.h - padding * 2) / bed.length;
    const newScale = Math.min(scaleX, scaleY, 4);
    setScale(newScale);
    setOrigin({
      x: (canvasSize.w - bed.width * newScale) / 2,
      y: (canvasSize.h - bed.length * newScale) / 2,
    });
  }, [bed.width, bed.length, canvasSize]);

  // ── coordinate helpers ───────────────────────────────────────────────────
  /** canvas px → bed cm */
  const canvasToBed = useCallback(
    (cx: number, cy: number) => ({
      x: (cx - origin.x) / scale,
      y: (cy - origin.y) / scale,
    }),
    [origin, scale]
  );

  /** bed cm → canvas px */
  const bedToCanvas = useCallback(
    (bx: number, by: number) => ({
      x: origin.x + bx * scale,
      y: origin.y + by * scale,
    }),
    [origin, scale]
  );

  // ── hit-test ─────────────────────────────────────────────────────────────
  const hitTest = useCallback(
    (cx: number, cy: number): number => {
      const ps = plantsRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const { x, y } = bedToCanvas(ps[i].position.x, ps[i].position.y);
        const dist = Math.hypot(cx - x, cy - y);
        if (dist <= Math.max(PLANT_RADIUS_PX, ps[i].spacingRadius * scale)) return i;
      }
      return -1;
    },
    [bedToCanvas, scale]
  );

  // ── draw ─────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = canvasSize;
    const ps = plantsRef.current;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, w, h);

    // Clip to bed
    const bedW = bed.width * scale;
    const bedH = bed.length * scale;
    const ox = origin.x;
    const oy = origin.y;

    // Bed fill
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(ox, oy, bedW, bedH);

    // Grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.5;
    const step = GRID_STEP_CM * scale;

    for (let x = 0; x <= bed.width; x += GRID_STEP_CM) {
      const px = ox + x * scale;
      ctx.beginPath();
      ctx.moveTo(px, oy);
      ctx.lineTo(px, oy + bedH);
      ctx.stroke();
    }
    for (let y = 0; y <= bed.length; y += GRID_STEP_CM) {
      const py = oy + y * scale;
      ctx.beginPath();
      ctx.moveTo(ox, py);
      ctx.lineTo(ox + bedW, py);
      ctx.stroke();
    }

    // Grid labels (every 50 cm, only if there's room)
    if (step * 5 > 20) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = `${Math.max(9, 11 * Math.min(scale, 1))}px sans-serif`;
      ctx.textAlign = 'center';
      for (let x = 0; x <= bed.width; x += 50) {
        const px = ox + x * scale;
        ctx.fillText(`${x}`, px, oy - 4);
      }
      ctx.textAlign = 'right';
      for (let y = 0; y <= bed.length; y += 50) {
        const py = oy + y * scale;
        ctx.fillText(`${y}`, ox - 4, py + 3);
      }
    }

    // Axis labels
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${bed.width} cm`, ox + bedW / 2, oy + bedH + 16);
    ctx.save();
    ctx.translate(ox - 20, oy + bedH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${bed.length} cm`, 0, 0);
    ctx.restore();

    // Bed border
    ctx.strokeStyle = '#6b4226';
    ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, bedW, bedH);

    // ── Compute compatibility overlay ────────────────────────────────────
    const compat = computeCompatibilityOverlay(ps);

    // ── Draw plants ──────────────────────────────────────────────────────
    ps.forEach((plant, i) => {
      const { x: cx, y: cy } = bedToCanvas(plant.position.x, plant.position.y);
      const spacingPx = plant.spacingRadius * scale;
      const r = PLANT_RADIUS_PX;
      const isSelected = selectedIndex === i;
      const border = compat[i] ? COMPAT_COLOR[compat[i]!] : '#94a3b8';

      // Spacing circle
      ctx.beginPath();
      ctx.arc(cx, cy, spacingPx, 0, Math.PI * 2);
      ctx.fillStyle = `${border}${Math.round(SPACING_ALPHA * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
      ctx.strokeStyle = `${border}66`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Plant circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = plantFill(i);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#3b82f6' : border;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Selection glow
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(59,130,246,0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Plant label
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${Math.max(8, Math.min(11, r * 0.65))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Abbreviate long names
      const label = plant.plantName.length > 10
        ? plant.plantName.slice(0, 8) + '…'
        : plant.plantName;
      ctx.fillText(label, cx, cy);
      ctx.textBaseline = 'alphabetic';
    });
  }, [bed.width, bed.length, canvasSize, scale, origin, bedToCanvas, selectedIndex]);

  // re-draw whenever anything changes
  useEffect(() => {
    draw();
  }, [draw, plants]);

  // ── pointer event handlers ────────────────────────────────────────────────

  function getCanvasXY(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      cx: e.clientX - rect.left,
      cy: e.clientY - rect.top,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const { cx, cy } = getCanvasXY(e);
    const idx = hitTest(cx, cy);
    if (idx >= 0) {
      // drag plant
      const { x, y } = bedToCanvas(plants[idx].position.x, plants[idx].position.y);
      dragging.current = { index: idx, offsetX: cx - x, offsetY: cy - y };
      setSelectedIndex(idx);
      canvasRef.current!.setPointerCapture(e.pointerId);
    } else {
      // start pan
      panning.current = { startX: cx, startY: cy, ox: origin.x, oy: origin.y };
      setSelectedIndex(null);
      canvasRef.current!.setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const { cx, cy } = getCanvasXY(e);

    if (dragging.current) {
      const { index, offsetX, offsetY } = dragging.current;
      const bedPos = canvasToBed(cx - offsetX + PLANT_RADIUS_PX, cy - offsetY + PLANT_RADIUS_PX);
      // Clamp to bed bounds
      const clamped = {
        x: Math.max(0, Math.min(bed.width, bedPos.x - PLANT_RADIUS_PX / scale)),
        y: Math.max(0, Math.min(bed.length, bedPos.y - PLANT_RADIUS_PX / scale)),
      };
      setPlants((prev) => {
        const next = prev.map((p, i) =>
          i === index ? { ...p, position: clamped } : p
        );
        plantsRef.current = next;
        return next;
      });
      draw();
      return;
    }

    if (panning.current) {
      const dx = cx - panning.current.startX;
      const dy = cy - panning.current.startY;
      setOrigin({ x: panning.current.ox + dx, y: panning.current.oy + dy });
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (dragging.current) {
      // persist on drag end
      onPlantsChange([...plantsRef.current]);
      dragging.current = null;
    }
    panning.current = null;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }

  // ── wheel zoom ────────────────────────────────────────────────────────────
  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const { cx, cy } = getCanvasXY(e as unknown as React.PointerEvent<HTMLCanvasElement>);
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * delta));
      // zoom toward cursor
      setOrigin((o) => ({
        x: cx - (cx - o.x) * (next / prev),
        y: cy - (cy - o.y) * (next / prev),
      }));
      return next;
    });
  }

  // ── selected plant info ───────────────────────────────────────────────────
  const selectedPlant = selectedIndex !== null ? plants[selectedIndex] ?? null : null;
  const selectedCompanions = useMemo(() => {
    if (!selectedPlant) return [];
    return getCompanionsFor(selectedPlant.plantName);
  }, [selectedPlant]);

  // ── remove selected ───────────────────────────────────────────────────────
  function removeSelected() {
    if (selectedIndex === null) return;
    setPlants((prev) => {
      const next = prev.filter((_, i) => i !== selectedIndex);
      plantsRef.current = next;
      onPlantsChange(next);
      return next;
    });
    setSelectedIndex(null);
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground">{bed.name}</span>
        <span>{bed.width} × {bed.length} cm</span>
        <span className="text-muted-foreground">·</span>
        <span>{plants.length} plant{plants.length !== 1 ? 's' : ''}</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 opacity-70" />
            Good
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 opacity-70" />
            Bad
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
            Neutral
          </span>
        </div>
        <span className="text-muted-foreground">Scroll=zoom · Drag canvas=pan · Drag plant=move</span>
      </div>

      <div className="flex gap-3 flex-1 min-h-0">
        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative flex-1 rounded-xl overflow-hidden border bg-green-50 select-none"
          style={{ minHeight: 360 }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            style={{ display: 'block', width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          />
        </div>

        {/* Info panel */}
        {selectedPlant && (
          <div className="w-56 shrink-0 flex flex-col gap-3 rounded-xl border bg-card p-3 text-sm overflow-y-auto">
            <div>
              <div className="font-semibold text-base">{selectedPlant.plantName}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Spacing: {selectedPlant.spacingRadius} cm radius
              </div>
              <div className="text-xs text-muted-foreground">
                Position: ({Math.round(selectedPlant.position.x)}, {Math.round(selectedPlant.position.y)}) cm
              </div>
            </div>

            {selectedCompanions.length > 0 && (
              <div>
                <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                  Companions
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedCompanions.map((c) => (
                    <div
                      key={c.name}
                      className="rounded-lg p-2 text-xs"
                      style={{
                        background:
                          c.compatibility === 'beneficial'
                            ? '#f0fdf4'
                            : c.compatibility === 'harmful'
                            ? '#fef2f2'
                            : '#fefce8',
                        borderLeft: `3px solid ${COMPAT_COLOR[c.compatibility]}`,
                      }}
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-muted-foreground leading-tight mt-0.5">{c.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={removeSelected}
              className="mt-auto text-xs text-destructive hover:underline text-left"
            >
              Remove plant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

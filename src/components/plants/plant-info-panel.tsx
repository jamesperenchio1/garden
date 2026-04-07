'use client';

import {
  Sun,
  Droplets,
  Ruler,
  Calendar,
  Thermometer,
  Sprout,
  Leaf,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TreflePlantDetail } from '@/lib/api/plants';

interface PlantInfoPanelProps {
  detail: TreflePlantDetail | null;
  loading: boolean;
}

interface InfoRow {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function PlantInfoPanel({ detail, loading }: PlantInfoPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Loading plant details…</span>
      </div>
    );
  }

  if (!detail) return null;

  const rows: InfoRow[] = [];

  if (detail.sun_requirements) {
    rows.push({ icon: <Sun className="h-3.5 w-3.5" />, label: 'Sun', value: detail.sun_requirements });
  }
  if (detail.sowing_method) {
    rows.push({ icon: <Sprout className="h-3.5 w-3.5" />, label: 'Sowing', value: detail.sowing_method });
  }
  if (detail.sowing_depth) {
    rows.push({ icon: <Droplets className="h-3.5 w-3.5" />, label: 'Depth', value: detail.sowing_depth });
  }
  if (detail.days_to_maturity) {
    rows.push({ icon: <Calendar className="h-3.5 w-3.5" />, label: 'Maturity', value: detail.days_to_maturity });
  }
  if (detail.spacing) {
    rows.push({ icon: <Ruler className="h-3.5 w-3.5" />, label: 'Spacing', value: detail.spacing });
  }
  if (detail.row_spacing) {
    rows.push({ icon: <Ruler className="h-3.5 w-3.5" />, label: 'Row spacing', value: detail.row_spacing });
  }
  if (detail.height) {
    rows.push({ icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Height', value: detail.height });
  }
  if (detail.min_temp_c !== undefined || detail.max_temp_c !== undefined) {
    const parts: string[] = [];
    if (detail.min_temp_c !== undefined) parts.push(`Min ${detail.min_temp_c}°C`);
    if (detail.max_temp_c !== undefined) parts.push(`Max ${detail.max_temp_c}°C`);
    rows.push({ icon: <Thermometer className="h-3.5 w-3.5" />, label: 'Temp', value: parts.join(' · ') });
  }
  if (detail.ph_minimum !== undefined || detail.ph_maximum !== undefined) {
    const ph = `${detail.ph_minimum ?? '?'} – ${detail.ph_maximum ?? '?'}`;
    rows.push({ icon: <Droplets className="h-3.5 w-3.5" />, label: 'pH', value: ph });
  }
  if (detail.growth_rate) {
    rows.push({ icon: <Leaf className="h-3.5 w-3.5" />, label: 'Growth', value: detail.growth_rate });
  }

  const hasImage = !!detail.image_url;
  const hasData = rows.length > 0 || !!detail.description;

  if (!hasData && !hasImage) return null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className={hasImage ? 'flex gap-0' : ''}>
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={detail.image_url!}
            alt={detail.common_name ?? ''}
            className="w-28 h-auto min-h-28 object-cover shrink-0 hidden sm:block"
          />
        )}
        <div className="flex-1 min-w-0 p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate capitalize">
                {detail.common_name ?? detail.scientific_name}
              </h3>
              {detail.scientific_name && (
                <p className="text-xs text-muted-foreground italic truncate">
                  {detail.scientific_name}
                </p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {detail.family && (
                <Badge variant="outline" className="text-[10px]">
                  {detail.family}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px]">
                {detail.source === 'openfarm' ? 'OpenFarm' : 'Trefle'}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {detail.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {detail.description}
            </p>
          )}

          {/* Data grid */}
          {rows.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center gap-1.5 min-w-0">
                  <span className="text-muted-foreground shrink-0">{row.icon}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {row.label}:
                  </span>
                  <span className="text-[11px] font-medium truncate">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

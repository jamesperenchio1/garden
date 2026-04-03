'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Mountain,
  ArrowLeft,
  Trash2,
  FlaskConical,
  Leaf,
  Settings2,
} from 'lucide-react';
import { useSoilBeds } from '@/hooks/use-soil-beds';
import { BedDesigner } from '@/components/soil/bed-designer';
import { BedForm } from '@/components/soil/bed-form';
import { getAllCompanionPlants } from '@/data/companion-planting';
import type { SoilBed, BedPlant, SoilAmendment } from '@/types/companion';

// ─── Default spacing radii (cm) ──────────────────────────────────────────────
const SPACING_DEFAULTS: Record<string, number> = {
  Tomato: 45,
  'Thai Basil': 20,
  'Chili Pepper': 30,
  Lettuce: 20,
  Kale: 35,
  Cucumber: 40,
  Lemongrass: 50,
  'Water Spinach': 15,
  Papaya: 120,
  Cilantro: 15,
  Mint: 20,
  Eggplant: 40,
  'Dragon Fruit': 100,
  Galangal: 30,
  Turmeric: 30,
  Bean: 25,
  Marigold: 20,
  Sunflower: 40,
  Carrot: 10,
  Radish: 8,
  Onion: 12,
  Garlic: 10,
  Corn: 30,
  Squash: 60,
  Pepper: 30,
  Fennel: 30,
  Cabbage: 35,
  Beet: 15,
  Celery: 20,
  Strawberry: 25,
  Sage: 25,
  Parsley: 15,
  Dill: 15,
  Melon: 70,
  Potato: 30,
  Banana: 150,
  'Sweet Potato': 30,
};

const ALL_PLANTS = getAllCompanionPlants();

function getSpacing(name: string): number {
  return SPACING_DEFAULTS[name] ?? 25;
}

// ─── Amendment form ────────────────────────────────────────────────────────

interface AmendmentFormProps {
  onAdd: (a: SoilAmendment) => void;
}

const COMMON_AMENDMENTS = [
  'Rice Husk Charcoal (แกลบดำ)',
  'Coconut Coir (ขุยมะพร้าว)',
  'Vermicompost (มูลไส้เดือน)',
  'Dolomite Lime',
  'Fish Meal (กระดูกปลา)',
  'Bat Guano (มูลค้างคาว)',
  'Neem Cake (กากสะเดา)',
  'EM (Effective Microorganisms)',
  'Other',
];

function AmendmentForm({ onAdd }: AmendmentFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount.trim()) return;
    onAdd({ name: name.trim(), amount: amount.trim(), notes: notes.trim() || undefined, appliedAt: new Date() });
    setName('');
    setAmount('');
    setNotes('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Amendment</Label>
          <Select value={name} onValueChange={(v) => v && setName(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_AMENDMENTS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {name === 'Other' && (
            <Input
              placeholder="Custom name"
              value={name === 'Other' ? '' : name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          )}
        </div>
        <div className="space-y-1">
          <Label>Amount</Label>
          <Input placeholder="e.g. 500g, 2 cups" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Notes (optional)</Label>
        <Input placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Amendment
      </Button>
    </form>
  );
}

// ─── Edit bed dialog ───────────────────────────────────────────────────────

interface EditBedDialogProps {
  bed: SoilBed;
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<SoilBed, 'id' | 'createdAt' | 'updatedAt' | 'plants' | 'amendments'>) => void;
  saving: boolean;
}

function EditBedDialog({ bed, open, onClose, onSave, saving }: EditBedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bed</DialogTitle>
        </DialogHeader>
        <BedForm initial={bed} onSave={onSave} onCancel={onClose} saving={saving} />
      </DialogContent>
    </Dialog>
  );
}

// ─── Bed Designer View ─────────────────────────────────────────────────────

interface BedViewProps {
  bed: SoilBed;
  onBack: () => void;
  onPlantsChange: (plants: BedPlant[]) => void;
  onAmendmentAdd: (a: SoilAmendment) => void;
  onAmendmentRemove: (index: number) => void;
  onEditBed: () => void;
  onDeleteBed: () => void;
  saving: boolean;
}

function BedView({
  bed,
  onBack,
  onPlantsChange,
  onAmendmentAdd,
  onAmendmentRemove,
  onEditBed,
  onDeleteBed,
  saving,
}: BedViewProps) {
  const [addPlant, setAddPlant] = useState('');
  const [tab, setTab] = useState('designer');

  function handleAddPlant() {
    if (!addPlant) return;
    const newPlant: BedPlant = {
      plantName: addPlant,
      position: { x: bed.width * 0.1 + Math.random() * bed.width * 0.5, y: bed.length * 0.1 + Math.random() * bed.length * 0.5 },
      spacingRadius: getSpacing(addPlant),
    };
    onPlantsChange([...bed.plants, newPlant]);
    setAddPlant('');
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Beds
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg truncate">{bed.name}</h2>
          <p className="text-xs text-muted-foreground">
            {bed.width} × {bed.length} cm
            {bed.soilType && ` · ${bed.soilType}`}
            {bed.ph && ` · pH ${bed.ph}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEditBed}>
            <Settings2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDeleteBed} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => v && setTab(v)} className="flex-1 min-h-0 flex flex-col">
        <TabsList>
          <TabsTrigger value="designer">
            <Leaf className="h-3.5 w-3.5 mr-1" />
            Designer
          </TabsTrigger>
          <TabsTrigger value="amendments">
            <FlaskConical className="h-3.5 w-3.5 mr-1" />
            Amendments {bed.amendments.length > 0 && `(${bed.amendments.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Designer tab */}
        <TabsContent value="designer" className="flex-1 min-h-0 flex flex-col gap-3 mt-3">
          {/* Add plant row */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Add Plant to Bed</Label>
              <Select value={addPlant} onValueChange={(v) => v && setAddPlant(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose plant…" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PLANTS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddPlant}
              disabled={!addPlant || saving}
              className="bg-green-600 hover:bg-green-700 shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Canvas */}
          <div className="flex-1 min-h-0">
            <BedDesigner bed={bed} onPlantsChange={onPlantsChange} />
          </div>
        </TabsContent>

        {/* Amendments tab */}
        <TabsContent value="amendments" className="mt-3">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Amendment</CardTitle>
              </CardHeader>
              <CardContent>
                <AmendmentForm onAdd={onAmendmentAdd} />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Applied Amendments ({bed.amendments.length})</h4>
              {bed.amendments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No amendments recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {bed.amendments.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg border text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.amount}</p>
                        {a.notes && <p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(a.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onAmendmentRemove(i)}
                        className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove amendment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function SoilPage() {
  const {
    beds,
    loading,
    createBed,
    updateBed,
    deleteBed,
    savePlants,
    addAmendment,
    removeAmendment,
  } = useSoilBeds();

  const [activeBedId, setActiveBedId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeBed = activeBedId !== null ? beds.find((b) => b.id === activeBedId) ?? null : null;

  // ── Create bed ────────────────────────────────────────────────────────────
  async function handleCreate(
    data: Omit<SoilBed, 'id' | 'createdAt' | 'updatedAt' | 'plants' | 'amendments'>
  ) {
    setSaving(true);
    try {
      const id = await createBed(data);
      setShowCreateDialog(false);
      setActiveBedId(id as number);
    } finally {
      setSaving(false);
    }
  }

  // ── Update bed meta ───────────────────────────────────────────────────────
  async function handleEditSave(
    data: Omit<SoilBed, 'id' | 'createdAt' | 'updatedAt' | 'plants' | 'amendments'>
  ) {
    if (!activeBedId) return;
    setSaving(true);
    try {
      await updateBed(activeBedId, data);
      setShowEditDialog(false);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete bed ────────────────────────────────────────────────────────────
  async function handleDeleteBed() {
    if (!activeBedId) return;
    if (!confirm('Delete this bed and all its plants? This cannot be undone.')) return;
    await deleteBed(activeBedId);
    setActiveBedId(null);
  }

  // ── Plants change ─────────────────────────────────────────────────────────
  const handlePlantsChange = useCallback(
    async (plants: BedPlant[]) => {
      if (!activeBedId) return;
      await savePlants(activeBedId, plants);
    },
    [activeBedId, savePlants]
  );

  // ── Amendments ────────────────────────────────────────────────────────────
  async function handleAmendmentAdd(a: SoilAmendment) {
    if (!activeBedId) return;
    await addAmendment(activeBedId, a);
  }
  async function handleAmendmentRemove(index: number) {
    if (!activeBedId) return;
    await removeAmendment(activeBedId, index);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (activeBed) {
    return (
      <>
        <BedView
          bed={activeBed}
          onBack={() => setActiveBedId(null)}
          onPlantsChange={handlePlantsChange}
          onAmendmentAdd={handleAmendmentAdd}
          onAmendmentRemove={handleAmendmentRemove}
          onEditBed={() => setShowEditDialog(true)}
          onDeleteBed={handleDeleteBed}
          saving={saving}
        />
        <EditBedDialog
          bed={activeBed}
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={handleEditSave}
          saving={saving}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Tabs defaultValue="beds">
          <TabsList>
            <TabsTrigger value="beds">Garden Beds</TabsTrigger>
            <TabsTrigger value="amendments">Soil Management</TabsTrigger>
          </TabsList>

          {/* ── Beds list ─────────────────────────────────────────────────── */}
          <TabsContent value="beds" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">My Garden Beds</h3>
                <p className="text-sm text-muted-foreground">Design bed layouts and manage plant spacing</p>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Bed
              </Button>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6 h-28" />
                  </Card>
                ))}
              </div>
            ) : beds.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No garden beds yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first garden bed to plan plant placement and spacing.
                  </p>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Bed
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beds.map((bed) => (
                  <Card
                    key={bed.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => setActiveBedId(bed.id!)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold group-hover:text-green-700 transition-colors">
                          {bed.name}
                        </h3>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {bed.width}×{bed.length}cm
                        </Badge>
                      </div>
                      {bed.soilType && (
                        <p className="text-xs text-muted-foreground mt-1">{bed.soilType}</p>
                      )}
                      {bed.ph !== undefined && (
                        <Badge variant="outline" className="text-xs mt-2 mr-1">pH {bed.ph}</Badge>
                      )}
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          {bed.plants.length} plant{bed.plants.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <FlaskConical className="h-3 w-3" />
                          {bed.amendments.length} amendment{bed.amendments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated {new Date(bed.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Soil management guide ───────────────────────────────────── */}
          <TabsContent value="amendments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Soil Management Guide</CardTitle>
                <CardDescription>Track amendments, pH, and fertilizer schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Common Thai Soil Amendments</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Rice Husk Charcoal (แกลบดำ)', use: 'Improves drainage, adds silica' },
                        { name: 'Coconut Coir (ขุยมะพร้าว)', use: 'Water retention, root aeration' },
                        { name: 'Vermicompost (มูลไส้เดือน)', use: 'Rich in nutrients, improves soil structure' },
                        { name: 'Dolomite Lime', use: 'Raises pH, adds calcium and magnesium' },
                        { name: 'Fish Meal (กระดูกปลา)', use: 'Slow-release nitrogen and phosphorus' },
                        { name: 'Bat Guano (มูลค้างคาว)', use: 'High phosphorus for flowering' },
                        { name: 'Neem Cake (กากสะเดา)', use: 'Natural pest deterrent + nitrogen' },
                        { name: 'EM (Effective Microorganisms)', use: 'Soil biology, decomposition' },
                      ].map((item) => (
                        <div key={item.name} className="p-3 rounded-lg border">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.use}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">pH Guide for Thai Soil</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="font-medium text-sm">pH 4.5–5.5 (Very Acidic)</p>
                        <p className="text-xs text-muted-foreground">Common in tropical soils. Add lime to raise pH. Good for: blueberries, tea.</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="font-medium text-sm">pH 5.5–6.0 (Acidic)</p>
                        <p className="text-xs text-muted-foreground">Typical Thai garden soil. Good for: sweet potato, tomato, chili.</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="font-medium text-sm">pH 6.0–7.0 (Slightly Acidic to Neutral)</p>
                        <p className="text-xs text-muted-foreground">Ideal for most vegetables. Add organic matter to maintain.</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="font-medium text-sm">pH 7.0–8.0 (Alkaline)</p>
                        <p className="text-xs text-muted-foreground">Less common in Thailand. Add sulfur or peat to lower. Good for: asparagus, cabbage.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create bed dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(o) => !o && setShowCreateDialog(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Garden Bed</DialogTitle>
          </DialogHeader>
          <BedForm
            onSave={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            saving={saving}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Droplets,
  ExternalLink,
  Trash2,
  GitCompare,
  Pencil,
  Loader2,
} from 'lucide-react';
import { useSystems } from '@/hooks/use-systems';
import { growingSystems } from '@/data/growing-systems';
import { ComparePanel } from '@/components/designer/compare-panel';
import type { SystemType } from '@/types/system';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Difficulty colour helpers
// ---------------------------------------------------------------------------
const difficultyColour: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
};

const waterColour: Record<string, string> = {
  low: 'text-blue-600',
  medium: 'text-blue-500',
  high: 'text-blue-400',
};

// ---------------------------------------------------------------------------
// New-system dialog
// ---------------------------------------------------------------------------

interface NewSystemDialogProps {
  onCreated: (id: number) => void;
  onClose: () => void;
}

function NewSystemDialog({ onCreated, onClose }: NewSystemDialogProps) {
  const { addSystem } = useSystems();
  const [selectedType, setSelectedType] = useState<SystemType | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    const systemType: SystemType = selectedType ?? 'dwc';
    const systemName = name.trim() || `New ${growingSystems.find((s) => s.type === systemType)?.name ?? systemType}`;

    setCreating(true);
    const id = await addSystem({
      name: systemName,
      type: systemType,
      components: [],
      notes: '',
    });
    setCreating(false);
    toast.success(`Created "${systemName}"`);
    onCreated(Number(id));
  }, [addSystem, name, onCreated, selectedType]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm mb-2 block">System Name</Label>
        <Input
          placeholder="e.g. Rooftop NFT Setup"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8"
        />
      </div>

      <div>
        <Label className="text-sm mb-2 block">System Type</Label>
        <ScrollArea className="h-72">
          <div className="grid sm:grid-cols-2 gap-2 pr-2">
            {growingSystems.map((sys) => (
              <button
                key={sys.type}
                onClick={() => setSelectedType(sys.type)}
                className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  selectedType === sys.type
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold leading-tight">{sys.name}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] flex-shrink-0 ${difficultyColour[sys.difficulty]}`}
                  >
                    {sys.difficulty}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                  {sys.description}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 gap-1"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Create &amp; Open
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Designer listing page
// ---------------------------------------------------------------------------

export default function DesignerPage() {
  const router = useRouter();
  const { systems, loading, deleteSystem } = useSystems();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const handleCreated = useCallback(
    (id: number) => {
      setShowNewDialog(false);
      router.push(`/designer/${id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    async (id: number, name: string) => {
      if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
      await deleteSystem(id);
      toast.success(`Deleted "${name}"`);
    },
    [deleteSystem]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Hydroponic System Designer</h2>
          <p className="text-sm text-muted-foreground">
            Design, simulate, and compare 3D hydroponic systems
          </p>
        </div>
        <div className="flex gap-2">
          {systems.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowCompare((v) => !v)}
            >
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          )}
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger render={<Button className="bg-green-600 hover:bg-green-700 gap-1" />}>
              <Plus className="h-4 w-4" />
              New System
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogTitle>New Hydroponic System</DialogTitle>
              <DialogDescription>
                Choose a system type to start from, or pick blank and build from scratch.
              </DialogDescription>
              <NewSystemDialog
                onCreated={handleCreated}
                onClose={() => setShowNewDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Compare panel */}
      {showCompare && systems.length >= 2 && (
        <Card>
          <CardContent className="p-0">
            <ComparePanel systems={systems} onClose={() => setShowCompare(false)} />
          </CardContent>
        </Card>
      )}

      {/* System templates quick-start */}
      <div>
        <h3 className="text-base font-semibold mb-3">System Templates</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {growingSystems.map((sys) => (
            <Card
              key={sys.type}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => {
                setShowNewDialog(true);
              }}
            >
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">{sys.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-[10px] flex-shrink-0 capitalize ${difficultyColour[sys.difficulty]}`}
                  >
                    {sys.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-[11px] line-clamp-2">
                  {sys.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {sys.bestFor.slice(0, 3).map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className={waterColour[sys.waterUsage]}>
                    <Droplets className="inline h-3 w-3 mr-0.5" />
                    {sys.waterUsage} water
                  </span>
                  <span>{sys.pros.length} pros</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* My systems */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">My Systems</h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {!loading && systems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No systems yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Create your first hydroponic system design above.
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700 gap-1"
                onClick={() => setShowNewDialog(true)}
              >
                <Plus className="h-4 w-4" />
                New System
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {systems.map((system) => {
              const info = growingSystems.find((s) => s.type === system.type);
              return (
                <Card
                  key={system.id}
                  className="hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => router.push(`/designer/${system.id}`)}
                >
                  <CardContent className="pt-4 pb-3 px-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{system.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">
                          {info?.name ?? system.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/designer/${system.id}`);
                          }}
                          title="Open in editor"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (system.id) handleDelete(system.id, system.name);
                          }}
                          title="Delete system"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{system.components.length} component{system.components.length !== 1 ? 's' : ''}</p>
                      <p>
                        {system.components.reduce((sum, c) => sum + c.connections.length, 0)} connection{system.components.reduce((sum, c) => sum + c.connections.length, 0) !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[10px]">
                        Updated {new Date(system.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/designer/${system.id}`);
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open 3D Editor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

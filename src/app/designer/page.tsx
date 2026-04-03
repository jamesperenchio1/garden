'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Droplets } from 'lucide-react';
import { useSystems } from '@/hooks/use-systems';
import { growingSystems } from '@/data/growing-systems';
import Link from 'next/link';
import type { SystemType } from '@/types/system';

export default function DesignerPage() {
  const { systems, loading } = useSystems();
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Hydroponic System Designer</h2>
          <p className="text-sm text-muted-foreground">Design, simulate, and compare growing systems</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowTemplates(!showTemplates)}>
          <Plus className="h-4 w-4 mr-2" />
          New System
        </Button>
      </div>

      {/* System Templates */}
      {showTemplates && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {growingSystems.map((system) => (
            <Card key={system.type} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{system.name}</CardTitle>
                  <Badge variant="outline" className="text-xs capitalize">{system.difficulty}</Badge>
                </div>
                <CardDescription>{system.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Best For</p>
                    <div className="flex flex-wrap gap-1">
                      {system.bestFor.slice(0, 4).map((plant) => (
                        <Badge key={plant} variant="secondary" className="text-xs">{plant}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Water Usage</p>
                      <p className="font-medium capitalize">{system.waterUsage}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Difficulty</p>
                      <p className="font-medium capitalize">{system.difficulty}</p>
                    </div>
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-green-700 mb-1">Pros:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {system.pros.slice(0, 3).map((pro) => (
                        <li key={pro}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Existing Systems */}
      <div>
        <h3 className="text-lg font-semibold mb-3">My Systems</h3>
        {systems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No systems yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first hydroponic system design using a template above.
              </p>
              <p className="text-sm text-muted-foreground">
                3D designer with physics-based water flow simulation coming in the next update.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systems.map((system) => {
              const info = growingSystems.find((s) => s.type === system.type);
              return (
                <Card key={system.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{system.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">{info?.name || system.type}</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      {system.components.length} components
                    </p>
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

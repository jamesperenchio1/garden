"use client";

import * as React from "react";
import { useDesignerStore } from "@/store/designer-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  RotateCcw,
  RotateCw,
  CheckCircle,
  Trash2,
  Sun,
  Moon,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

const COMPONENT_TYPES = [
  "Reservoir",
  "Pump",
  "Pipe",
  "Grow Bed",
  "Net Pot",
  "Air Stone",
  "Fish Tank",
  "Timer",
] as const;

export default function DesignerPage() {
  const {
    components,
    selectedId,
    theme,
    addComponent,
    removeComponent,
    updateComponent,
    selectComponent,
    validateDesign,
    undo,
    redo,
    setTheme,
  } = useDesignerStore();

  const [issues, setIssues] = React.useState<ReturnType<typeof validateDesign>>(
    []
  );
  const [showValidation, setShowValidation] = React.useState(false);

  const selectedComponent = components.find((c) => c.id === selectedId);

  const handleAdd = (type: string) => {
    const count = components.filter((c) => c.type === type).length;
    addComponent({
      type,
      x: (count % 6) * 2,
      y: Math.floor(count / 6) * 2,
      z: 0,
      width: 1,
      height: 1,
      depth: 1,
    });
  };

  const handleValidate = () => {
    const result = validateDesign();
    setIssues(result);
    setShowValidation(true);
  };

  const handleClear = () => {
    components.forEach((c) => removeComponent(c.id));
    setIssues([]);
    setShowValidation(false);
  };

  const getConnectedNames = (c: (typeof components)[number]) => {
    return c.connections
      .map((id) => components.find((x) => x.id === id)?.type)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen flex-col">
        {/* Top Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b bg-card p-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                Add Component <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {COMPONENT_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleAdd(type)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={undo}>
            <RotateCcw className="mr-1 size-3.5" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo}>
            <RotateCw className="mr-1 size-3.5" /> Redo
          </Button>

          <Button variant="outline" size="sm" onClick={handleValidate}>
            <CheckCircle className="mr-1 size-3.5" /> Validate
          </Button>

          <Button variant="destructive" size="sm" onClick={handleClear}>
            <Trash2 className="mr-1 size-3.5" /> Clear
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Canvas Area */}
          <div
            className={cn(
              "relative flex-1 overflow-auto p-4",
              theme === "dark" ? "bg-neutral-900" : "bg-neutral-50"
            )}
          >
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {components.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectComponent(c.id)}
                    className={cn(
                      "relative rounded-xl border p-4 text-left shadow-sm transition-all hover:shadow-md",
                      theme === "dark"
                        ? "border-neutral-700 bg-neutral-800 text-neutral-100"
                        : "border-neutral-200 bg-white text-neutral-900",
                      selectedId === c.id &&
                        "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <div className="text-sm font-semibold">{c.type}</div>
                    <div
                      className={cn(
                        "mt-1 text-xs",
                        theme === "dark"
                          ? "text-neutral-400"
                          : "text-neutral-500"
                      )}
                    >
                      pos: {c.x.toFixed(1)}, {c.y.toFixed(1)}, {c.z.toFixed(1)}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-xs",
                        theme === "dark"
                          ? "text-neutral-500"
                          : "text-neutral-400"
                      )}
                    >
                      size: {c.width.toFixed(1)} × {c.height.toFixed(1)} ×{" "}
                      {c.depth.toFixed(1)}
                    </div>
                    {c.connections.length > 0 && (
                      <div
                        className={cn(
                          "mt-1 text-xs italic",
                          theme === "dark"
                            ? "text-neutral-400"
                            : "text-neutral-500"
                        )}
                      >
                        → {getConnectedNames(c)}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {components.length === 0 && (
                <div
                  className={cn(
                    "flex h-64 items-center justify-center rounded-xl border-2 border-dashed text-sm",
                    theme === "dark"
                      ? "border-neutral-700 text-neutral-500"
                      : "border-neutral-300 text-neutral-400"
                  )}
                >
                  No components yet. Use "Add Component" to start designing.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full shrink-0 overflow-y-auto border-t bg-card p-4 md:w-72 md:border-l md:border-t-0">
            <div className="space-y-4">
              {/* Properties */}
              <Card size="sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedComponent ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Type
                        </span>
                        <Badge variant="secondary">
                          {selectedComponent.type}
                        </Badge>
                      </div>
                      <Separator />
                      {(
                        [
                          "x",
                          "y",
                          "z",
                          "width",
                          "height",
                          "depth",
                        ] as const
                      ).map((field) => (
                        <div key={field} className="space-y-1">
                          <Label className="text-xs capitalize">
                            {field}
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={selectedComponent[field]}
                            onChange={(e) =>
                              updateComponent(selectedComponent.id, {
                                [field]: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-7 text-xs"
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="xs"
                        className="w-full"
                        onClick={() => {
                          if (selectedComponent.connections.length > 0) {
                            const last =
                              selectedComponent.connections[
                                selectedComponent.connections.length - 1
                              ];
                            useDesignerStore
                              .getState()
                              .removeConnection(selectedComponent.id, last);
                          }
                        }}
                      >
                        Remove last connection
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Select a component to edit its properties.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Validation Panel */}
              <Card size="sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Validation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!showValidation ? (
                    <p className="text-xs text-muted-foreground">
                      Click Validate to check your design.
                    </p>
                  ) : issues.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="size-4" />
                      No issues found
                    </div>
                  ) : (
                    issues.map((issue) => (
                      <div
                        key={issue.id}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border p-2 text-xs",
                          issue.severity === "error"
                            ? "border-destructive/20 bg-destructive/10 text-destructive"
                            : "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200"
                        )}
                      >
                        {issue.severity === "error" ? (
                          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                        )}
                        <span>{issue.message}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { extractSeedPacketViaGemini, type SeedPacketData } from '@/lib/ocr';

interface SeedPacketScannerProps {
  onExtracted: (data: SeedPacketData) => void;
  onFileChange: (file: File | null) => void;
}

type OcrStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

export function SeedPacketScanner({ onExtracted, onFileChange }: SeedPacketScannerProps) {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SeedPacketData | null>(null);
  const [filledFields, setFilledFields] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setError(null);
    setResult(null);
    setFilledFields([]);
    setFile(f);
    onFileChange(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));

    setStatus('uploading');
    await new Promise((r) => setTimeout(r, 50));
    setStatus('analyzing');

    try {
      const data = await extractSeedPacketViaGemini(f);
      setResult(data);

      const filled: string[] = [];
      if (data.plantName) filled.push('Name');
      if (data.variety) filled.push('Variety');
      if (data.brand) filled.push('Brand');
      if (data.daysToGermination) filled.push('Germination');
      if (data.daysToMaturity) filled.push('Maturity');
      if (data.plantingDepth) filled.push('Depth');
      if (data.spacing) filled.push('Spacing');
      if (data.sunRequirement) filled.push('Sun');
      if (data.sowingMethod) filled.push('Sowing');
      setFilledFields(filled);
      setStatus('done');
      onExtracted(data);
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    onFileChange(null);
    setStatus('idle');
    setError(null);
    setResult(null);
    setFilledFields([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const retry = () => {
    if (!file) return;
    const fakeEvent = {
      target: { files: [file] as unknown as FileList },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleUpload(fakeEvent);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
        className="hidden"
      />

      {!preview ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full border-dashed h-28 flex flex-col items-center justify-center gap-1.5"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Upload seed packet photo</span>
          <span className="text-[11px] text-muted-foreground">
            JPG / PNG — Gemini will extract all the details
          </span>
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Seed packet"
              className="h-28 w-28 object-cover rounded-lg border shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-2">
              {status === 'uploading' && (
                <StatusLine icon={<Loader2 className="h-4 w-4 animate-spin" />} color="blue">
                  Preparing image…
                </StatusLine>
              )}
              {status === 'analyzing' && (
                <StatusLine icon={<Loader2 className="h-4 w-4 animate-spin" />} color="blue">
                  Analyzing with Gemini…
                </StatusLine>
              )}
              {status === 'done' && (
                <StatusLine icon={<Check className="h-4 w-4" />} color="green">
                  Extraction complete
                </StatusLine>
              )}
              {status === 'error' && (
                <StatusLine icon={<AlertCircle className="h-4 w-4" />} color="red">
                  {error}
                </StatusLine>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  Replace
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={clear}>
                  Remove
                </Button>
                {status === 'error' && (
                  <Button type="button" variant="outline" size="sm" onClick={retry}>
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Extracted data summary */}
          {status === 'done' && result && (
            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              {filledFields.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground">Extracted:</span>
                  {filledFields.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px]">
                      {f}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nothing confidently extracted. Try a clearer photo or fill in fields manually.
                </p>
              )}

              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  View all extracted data
                </summary>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  {(
                    [
                      ['Plant', result.plantName],
                      ['Variety', result.variety],
                      ['Brand', result.brand],
                      ['Germination', result.daysToGermination],
                      ['Maturity', result.daysToMaturity],
                      ['Depth', result.plantingDepth],
                      ['Spacing', result.spacing],
                      ['Row spacing', result.rowSpacing],
                      ['Sun', result.sunRequirement],
                      ['Sowing', result.sowingMethod],
                      ['When', result.whenToPlant],
                    ] as const
                  )
                    .filter(([, v]) => v !== undefined && v !== '')
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="font-medium text-muted-foreground">{k}:</dt>
                        <dd className="break-words">{String(v)}</dd>
                      </div>
                    ))}
                </dl>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusLine({
  icon,
  color,
  children,
}: {
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red';
  children: React.ReactNode;
}) {
  const colors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
  };
  return (
    <div className={`flex items-start gap-2 text-sm ${colors[color]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="break-words">{children}</span>
    </div>
  );
}

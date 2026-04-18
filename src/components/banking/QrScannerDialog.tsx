import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (text: string) => void;
}

export function QrScannerDialog({ open, onOpenChange, onScan }: Props) {
  const [tab, setTab] = useState<"camera" | "paste">("camera");
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!open || tab !== "camera") return;
    setError(null);

    const id = "lunar-qr-reader";
    const start = async () => {
      try {
        const el = containerRef.current;
        if (!el) return;
        // The library wants an element with a real id.
        if (!document.getElementById(id)) {
          const inner = document.createElement("div");
          inner.id = id;
          inner.style.width = "100%";
          el.innerHTML = "";
          el.appendChild(inner);
        }
        const scanner = new Html5Qrcode(id, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            onScan(decoded);
            stop();
            onOpenChange(false);
          },
          () => { /* per-frame errors are normal, ignore */ },
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Couldn't start the camera";
        setError(msg);
      }
    };

    const stop = async () => {
      const s = scannerRef.current;
      if (!s) return;
      try {
        if (s.isScanning) await s.stop();
        await s.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    };

    start();
    return () => { void stop(); };
  }, [open, tab, onScan, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import a layout</DialogTitle>
          <DialogDescription>
            Scan another Lunar Bank user's QR code with your camera, or paste their code.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "camera" | "paste")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="gap-1.5"><Camera className="h-4 w-4" /> Camera</TabsTrigger>
            <TabsTrigger value="paste">Paste code</TabsTrigger>
          </TabsList>
          <TabsContent value="camera" className="mt-4 space-y-3">
            <div
              ref={containerRef}
              className="aspect-square w-full overflow-hidden rounded-xl border border-border/60 bg-black"
            />
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <X className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  Camera blocked or unavailable: {error}
                  <div className="mt-1 text-muted-foreground">
                    Tip: allow camera permission, then reopen this dialog. Or paste the code instead.
                  </div>
                </div>
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Point your camera at the QR code shown by the other user.
            </p>
          </TabsContent>
          <TabsContent value="paste" className="mt-4 space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Layout code</Label>
            <Input
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Paste here…"
              className="font-mono text-xs"
            />
            <Button
              className="w-full"
              disabled={!pasted.trim()}
              onClick={() => { onScan(pasted.trim()); onOpenChange(false); setPasted(""); }}
            >
              Import
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

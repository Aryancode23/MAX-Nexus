"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/Button";

export function QrGeneratorTool() {
  const [text, setText] = useState("https://");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      if (!text.trim() || !canvasRef.current) {
        setDataUrl(null);
        return;
      }
      try {
        const QRCode = (await import("qrcode")).default;
        await QRCode.toCanvas(canvasRef.current, text, { width: 260, margin: 1 });
        if (!cancelled) setDataUrl(canvasRef.current.toDataURL("image/png"));
      } catch {
        if (!cancelled) setDataUrl(null);
      }
    }
    const t = setTimeout(generate, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [text]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label className="text-sm">
          Text, link, or Wi-Fi/contact details
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
            placeholder="https://example.com"
          />
        </label>
        <p className="mt-2 text-xs text-muted">
          Updates automatically as you type. QR codes are generated entirely in your browser.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-border bg-surface p-6">
        <canvas ref={canvasRef} className={text.trim() ? "" : "opacity-30"} />
        {dataUrl && (
          <a href={dataUrl} download="qr-code.png">
            <Button variant="secondary">
              <Download size={16} /> Download PNG
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

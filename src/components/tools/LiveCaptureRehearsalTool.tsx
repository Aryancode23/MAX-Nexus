"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, XCircle, AlertTriangle, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";

type CheckState = "checking" | "pass" | "warn" | "fail" | "unsupported";

interface Checks {
  lighting: CheckState;
  background: CheckState;
  sharpness: CheckState;
  facePosition: CheckState;
}

const MANUAL_CHECKLIST = [
  "No glasses — or if you can't remove them, make sure there's no glare on the lenses",
  "No cap, mask, headphones, or anything covering your face",
  "Neutral expression, mouth closed, eyes open, looking straight at the camera",
  "Follow your exam's own notification for the exact background and lighting rules — this is a general rehearsal, not the official portal",
];

export function LiveCaptureRehearsalTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  const [cameraState, setCameraState] = useState<"idle" | "starting" | "live" | "denied" | "unavailable">("idle");
  const [checks, setChecks] = useState<Checks>({ lighting: "checking", background: "checking", sharpness: "checking", facePosition: "unsupported" });
  const [frozenUrl, setFrozenUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "FaceDetector" in window) {
      try {
        faceDetectorRef.current = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch {
        faceDetectorRef.current = null;
      }
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 640 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("live");
      loop();
    } catch (err: any) {
      setCameraState(err?.name === "NotAllowedError" ? "denied" : "unavailable");
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function loop() {
    analyzeFrame();
    rafRef.current = requestAnimationFrame(() => setTimeout(loop, 500)) as any;
  }

  async function analyzeFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const w = 160, h = 120;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const frame = ctx.getImageData(0, 0, w, h);
    const data = frame.data;

    // Overall brightness (average luma)
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const avgLuma = sum / (data.length / 4);
    const lighting: CheckState = avgLuma < 55 ? "fail" : avgLuma < 80 ? "warn" : avgLuma > 235 ? "warn" : "pass";

    // Background uniformity: sample the four corner patches, away from
    // where a centered face would be, and look at how spread out they are.
    const patchSize = 18;
    const corners = [
      [2, 2], [w - patchSize - 2, 2], [2, h - patchSize - 2], [w - patchSize - 2, h - patchSize - 2],
    ];
    let cornerSum = 0, cornerCount = 0, values: number[] = [];
    for (const [cx, cy] of corners) {
      const patch = ctx.getImageData(cx, cy, patchSize, patchSize).data;
      for (let i = 0; i < patch.length; i += 4) {
        const luma = 0.299 * patch[i] + 0.587 * patch[i + 1] + 0.114 * patch[i + 2];
        cornerSum += luma; cornerCount++; values.push(luma);
      }
    }
    const cornerMean = cornerSum / cornerCount;
    const variance = values.reduce((a, v) => a + (v - cornerMean) ** 2, 0) / cornerCount;
    const stdDev = Math.sqrt(variance);
    const background: CheckState = stdDev > 45 ? "fail" : stdDev > 25 ? "warn" : "pass";

    // Sharpness: crude edge-strength estimate (horizontal gradient energy)
    // on a grayscale copy — not a true Laplacian, but enough to catch a
    // badly out-of-focus or motion-blurred frame.
    let edgeEnergy = 0;
    for (let y = 0; y < h; y += 2) {
      for (let x = 1; x < w; x += 2) {
        const i1 = (y * w + x) * 4, i0 = (y * w + x - 1) * 4;
        const l1 = 0.299 * data[i1] + 0.587 * data[i1 + 1] + 0.114 * data[i1 + 2];
        const l0 = 0.299 * data[i0] + 0.587 * data[i0 + 1] + 0.114 * data[i0 + 2];
        edgeEnergy += Math.abs(l1 - l0);
      }
    }
    const sharpness: CheckState = edgeEnergy < 400 ? "fail" : edgeEnergy < 900 ? "warn" : "pass";

    // Face position, only where the browser supports it (Chrome-family).
    let facePosition: CheckState = "unsupported";
    if (faceDetectorRef.current) {
      try {
        const faces = await faceDetectorRef.current.detect(video);
        if (faces.length === 0) {
          facePosition = "fail";
        } else {
          const box = faces[0].boundingBox;
          const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
          const vw = video.videoWidth, vh = video.videoHeight;
          const centered = Math.abs(cx / vw - 0.5) < 0.18 && Math.abs(cy / vh - 0.45) < 0.2;
          const sizeOk = box.height / vh > 0.28 && box.height / vh < 0.85;
          facePosition = centered && sizeOk ? "pass" : "warn";
        }
      } catch {
        facePosition = "unsupported";
      }
    }

    setChecks({ lighting, background, sharpness, facePosition });
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    setFrozenUrl(canvas.toDataURL("image/jpeg", 0.92));
  }

  const allMeasurableGood = checks.lighting === "pass" && checks.background === "pass" && checks.sharpness === "pass";

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        A private practice run for live-capture photo steps like SSC's — this checks lighting, background
        and sharpness against a webcam feed that never leaves your device: nothing is recorded, uploaded, or
        sent anywhere, and this does <strong>not</strong> submit anything to any exam portal. The portal's own
        live system runs its own checks, which this can't fully replicate — always follow your exam's official
        notification.
      </p>

      {cameraState === "idle" && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface-2 p-10 text-center">
          <Camera size={28} className="text-muted" />
          <p className="text-sm text-text">Start your camera to begin the rehearsal.</p>
          <Button onClick={startCamera}><Camera size={16} /> Start camera</Button>
        </div>
      )}

      {cameraState === "starting" && <p className="text-sm text-muted">Requesting camera access…</p>}

      {cameraState === "denied" && (
        <p className="text-sm text-danger">
          Camera access was denied. Allow camera permission for this site in your browser settings, then try again.
        </p>
      )}

      {cameraState === "unavailable" && (
        <p className="text-sm text-danger">Couldn't access a camera on this device. Try a different browser or device.</p>
      )}

      {cameraState === "live" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative mx-auto overflow-hidden rounded-card border border-border bg-black" style={{ width: 320, height: 400 }}>
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
            <svg viewBox="0 0 320 400" className="pointer-events-none absolute inset-0 h-full w-full">
              <ellipse cx={160} cy={175} rx={95} ry={125} fill="none" stroke="white" strokeOpacity={0.85} strokeWidth={2} strokeDasharray="6 6" />
            </svg>
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="space-y-4">
            <CheckRow label="Lighting" state={checks.lighting} passText="Good lighting" warnText="A bit dim/bright" failText="Too dark or too bright" />
            <CheckRow label="Background" state={checks.background} passText="Looks plain" warnText="Somewhat busy" failText="Too busy / uneven" />
            <CheckRow label="Sharpness" state={checks.sharpness} passText="Sharp" warnText="Slightly soft" failText="Blurry — hold still" />
            <CheckRow
              label="Face position"
              state={checks.facePosition}
              passText="Centered in the oval"
              warnText="Adjust position/distance"
              failText="No face detected"
              unsupportedText="Your browser can't auto-check this — line up with the oval yourself"
            />

            <div className="rounded-card border border-border bg-surface-2 p-3">
              <p className="text-xs font-semibold text-text">Check yourself (not automatic):</p>
              <ul className="mt-1.5 space-y-1 text-xs text-muted">
                {MANUAL_CHECKLIST.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={capture} disabled={!allMeasurableGood} title={!allMeasurableGood ? "Fix the checks above first" : undefined}>
                Capture reference frame
              </Button>
              <Button variant="secondary" onClick={() => { stopCamera(); setCameraState("idle"); }}>
                <RotateCcw size={14} /> Stop camera
              </Button>
            </div>
          </div>
        </div>
      )}

      {frozenUrl && (
        <div className="rounded-card border border-border bg-surface-2 p-4">
          <p className="mb-2 text-sm font-medium text-text">Reference frame — for your own comparison only</p>
          <img src={frozenUrl} alt="" className="mx-auto max-h-80 rounded-control" />
          <a href={frozenUrl} download="rehearsal-reference.jpg" className="mt-3 inline-block">
            <Button variant="secondary"><Download size={14} /> Download this frame</Button>
          </a>
        </div>
      )}
    </div>
  );
}

function CheckRow({
  label, state, passText, warnText, failText, unsupportedText,
}: { label: string; state: CheckState; passText: string; warnText: string; failText: string; unsupportedText?: string }) {
  const config: Record<CheckState, { icon: JSX.Element; text: string; className: string }> = {
    pass: { icon: <CheckCircle2 size={16} />, text: passText, className: "text-success" },
    warn: { icon: <AlertTriangle size={16} />, text: warnText, className: "text-warning" },
    fail: { icon: <XCircle size={16} />, text: failText, className: "text-danger" },
    checking: { icon: <AlertTriangle size={16} />, text: "Checking…", className: "text-muted" },
    unsupported: { icon: <AlertTriangle size={16} />, text: unsupportedText || "Not checked automatically", className: "text-muted" },
  };
  const c = config[state];
  return (
    <div className="flex items-center justify-between rounded-control border border-border p-2.5">
      <span className="text-sm text-text">{label}</span>
      <span className={`flex items-center gap-1.5 text-xs font-medium ${c.className}`}>{c.icon} {c.text}</span>
    </div>
  );
}

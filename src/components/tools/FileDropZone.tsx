"use client";

import { useRef, useState, DragEvent } from "react";
import { UploadCloud, Camera } from "lucide-react";

export function FileDropZone({
  accept,
  multiple = false,
  onFiles,
  label = "Click to upload or drag and drop",
  hint,
  allowCamera,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
  /** Adds a separate, clearly labeled "Take Photo" button alongside the normal file picker — it never replaces the ability to choose an existing file. Ignored on desktop. */
  allowCamera?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onFiles(Array.from(fileList));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`focus-ring flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-surface-2 hover:bg-surface"
        }`}
      >
        <UploadCloud size={28} className="text-primary" />
        <p className="text-sm font-medium text-text">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {allowCamera && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
            className="focus-ring mx-auto flex items-center gap-1.5 rounded-control border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:bg-surface-2"
          >
            <Camera size={13} /> Or take a photo instead
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept={accept}
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </>
      )}
    </div>
  );
}

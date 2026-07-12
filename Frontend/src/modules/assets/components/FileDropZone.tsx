import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

// ─── Image Drop Zone ───────────────────────────────────────────────────────────

interface ImageDropZoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  preview?: string | null;
  className?: string;
}

export const ImageDropZone: React.FC<ImageDropZoneProps> = ({ value, onChange, preview, className }) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      onChange(file);
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const displayPreview = localPreview || preview;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
        isDragActive
          ? "border-brand-blue bg-brand-blue/5 scale-[1.01]"
          : "border-slate-200 bg-slate-50 hover:border-brand-blue/50 hover:bg-brand-blue/3",
        displayPreview ? "p-0 overflow-hidden h-48" : "p-8 h-48",
        className
      )}
    >
      <input {...getInputProps()} />
      {displayPreview ? (
        <>
          <img src={displayPreview} alt="Asset preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="text-white text-sm font-medium">Replace Photo</span>
          </div>
          {(value || localPreview) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); setLocalPreview(null); }}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <X className="h-3.5 w-3.5 text-slate-600" />
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center select-none">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragActive ? "Drop to upload" : "Upload asset photo"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, WebP · max 10 MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Document Drop Zone ────────────────────────────────────────────────────────

interface DocDropZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  uploading?: boolean;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DocumentDropZone: React.FC<DocDropZoneProps> = ({ files, onChange, uploading, className }) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onChange([...files, ...accepted]);
    },
    [files, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6",
          isDragActive
            ? "border-brand-blue bg-brand-blue/5"
            : "border-slate-200 bg-slate-50 hover:border-brand-blue/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center mb-2">
          {uploading ? <Loader2 className="h-4 w-4 text-slate-500 animate-spin" /> : <Upload className="h-4 w-4 text-slate-500" />}
        </div>
        <p className="text-sm font-semibold text-slate-700 text-center">
          {isDragActive ? "Drop files here" : "Upload supporting documents"}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">PDF, DOC, DOCX, Images · max 20 MB each</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

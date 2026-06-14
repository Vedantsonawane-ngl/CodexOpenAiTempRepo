import { useRef, useState } from "react";
import Icon from "./Icon.jsx";

export default function UploadDropzone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function validate(file) {
    if (!file) return;
    const allowed = [".json", ".jsonl", ".csv", ".txt"];
    const valid = allowed.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!valid) {
      setError("Unsupported file type. Upload JSON, JSONL, CSV, or TXT.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File is larger than 50MB.");
      return;
    }
    setError("");
    setFileName(file.name);
    onFile?.(file);
  }

  return (
    <div
      className={`relative flex h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-surface-container-lowest p-xl transition-all ${
        dragging ? "border-primary bg-surface-container-low" : "border-outline-variant/50 hover:border-primary/50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        validate(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".json,.jsonl,.csv,.txt"
        onChange={(event) => validate(event.target.files?.[0])}
      />
      <Icon name="upload_file" className="mb-md text-[48px] text-primary transition-transform group-hover:scale-110" />
      <div className="relative z-10 text-center">
        <p className="mb-xs text-lg font-bold text-on-surface">{fileName || "Drag and drop log files here"}</p>
        <p className="text-sm text-on-surface-variant">Supports JSONL, CSV, and TXT (Max 50MB per file)</p>
        {error ? <p className="mt-sm text-sm text-error">{error}</p> : null}
        <button className="mt-lg rounded bg-secondary-container px-lg py-sm font-geist text-[11px] font-bold uppercase text-on-secondary-container transition-all hover:opacity-90 active:scale-95" type="button">
          Browse Files
        </button>
      </div>
    </div>
  );
}

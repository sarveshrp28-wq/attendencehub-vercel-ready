import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

const StudentPhotoDropzone = ({
  currentPhotoUrl = "",
  selectedFile = null,
  disabled = false,
  error = "",
  onSelectFile,
  onClear
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const activeImage = previewUrl || currentPhotoUrl || "";
  const label = useMemo(() => {
    if (selectedFile) return selectedFile.name;
    if (currentPhotoUrl) return "Current student photo";
    return "No photo selected";
  }, [currentPhotoUrl, selectedFile]);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (!file || disabled) return;
    onSelectFile?.(file);
  };

  const openPicker = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-slate-300">Student Photo</label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onClick={openPicker}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleFiles(event.dataTransfer?.files);
        }}
        className={clsx(
          "rounded-xl border border-dashed p-4 transition cursor-pointer focus:outline-none",
          dragActive
            ? "border-aqua-400 bg-aqua-400/10"
            : "border-white/20 bg-white/5 hover:border-aqua-400/60",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-2xl text-slate-300">
            {activeImage ? (
              <img
                src={activeImage}
                alt="Student preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>+</span>
            )}
          </div>

          <div className="text-sm text-slate-300">
            <p className="text-white font-semibold">{label}</p>
            <p className="text-xs text-slate-400 mt-1">
              Drag & drop photo here, or click to browse.
            </p>
            <p className="text-xs text-slate-400">JPG, PNG, WEBP up to 5 MB</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-outline text-xs"
          onClick={openPicker}
          disabled={disabled}
        >
          Choose Photo
        </button>
        {(selectedFile || currentPhotoUrl) && onClear ? (
          <button
            type="button"
            className="btn-outline text-xs"
            onClick={onClear}
            disabled={disabled}
          >
            Remove Photo
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
};

export default StudentPhotoDropzone;

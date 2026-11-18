"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Plus, Trash2, Star, Camera, AlertCircle, Zap } from "lucide-react";

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File is not an image"));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(event.target?.result as string);
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Could not parse image"));
    };
    reader.onerror = () => reject(new Error("Could not read file"));
  });
}

const MAX_PHOTOS = 10;

/** Up to 10 property photos; the first one is the cover shown on listing cards. */
export function PhotoUploader({
  images,
  setImages,
}: {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFiles = async (files: FileList | File[]) => {
    setPhotoError(null);
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      setPhotoError("Please select valid image files (JPG, PNG, WEBP).");
      return;
    }

    const remainingSlots = MAX_PHOTOS - images.length;
    if (remainingSlots <= 0) {
      setPhotoError("You can upload a maximum of 10 photos.");
      return;
    }

    try {
      const compressedList = await Promise.all(validFiles.slice(0, remainingSlots).map(compressImage));
      setImages((prev) => [...prev, ...compressedList].slice(0, MAX_PHOTOS));
    } catch {
      setPhotoError("Failed to process one or more images. Please try again.");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="block text-xs font-semibold text-[#262626] uppercase tracking-wide">
            Property Photos ({images.length} / {MAX_PHOTOS})
          </label>
          <p className="text-[11px] text-[#757577]">
            Upload clear photos of living room, bedrooms, kitchen, and exterior. The first photo is the cover.
          </p>
        </div>
        {images.length > 0 && images.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#008ae8] bg-[#e0f2fe] hover:bg-[#bae6fd] border border-[#008ae8]/30 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photos</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handlePhotoFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      {photoError && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{photoError}</span>
        </div>
      )}

      {images.length === 0 ? (
        <div
          data-ui="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#008ae8] bg-[#e0f2fe]/60 scale-[1.01]"
              : "border-[#aeaeaf]/50 hover:border-[#008ae8] bg-[#fafafa] hover:bg-[#e0f2fe]/20"
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#e0f2fe] border border-[#008ae8]/30 flex items-center justify-center text-[#008ae8]">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-semibold text-[#262626]">
            {isDragging ? "Drop your photos here" : "Click to upload or drag & drop photos"}
          </h4>
          <p className="text-xs text-[#757577] mt-1 max-w-sm mx-auto">
            Supports JPG, JPEG, PNG, WEBP (max {MAX_PHOTOS} photos).
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] shadow-xs transition-colors">
            <Camera className="w-3.5 h-3.5" />
            <span>Select Photos from Device</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                className="group relative aspect-4/3 rounded-xl overflow-hidden border border-[#aeaeaf]/40 bg-[#1c1c1e] shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc}
                  alt={`Property upload ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {idx === 0 ? (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#008ae8] text-white shadow-xs">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/70 hover:bg-[#008ae8] text-white backdrop-blur-md cursor-pointer"
                    title="Set this photo as the main cover"
                  >
                    Make Cover
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  aria-label="Remove photo"
                  title="Delete photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-1.5 text-white text-[10px]">
                  <span>Photo {idx + 1}</span>
                </div>
              </div>
            ))}

            {images.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-4/3 rounded-xl border-2 border-dashed border-[#aeaeaf]/50 hover:border-[#008ae8] bg-[#fafafa] hover:bg-[#e0f2fe]/40 flex flex-col items-center justify-center text-[#757577] hover:text-[#008ae8] transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white group-hover:bg-[#e0f2fe] border border-[#aeaeaf]/40 group-hover:border-[#008ae8]/40 flex items-center justify-center mb-1 transition-colors">
                  <Plus className="w-4 h-4 text-[#008ae8]" />
                </div>
                <span className="text-xs font-medium">Add Photo</span>
                <span className="text-[10px] text-[#757577]">({MAX_PHOTOS - images.length} left)</span>
              </button>
            )}
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl border border-dashed text-center text-xs text-[#757577] cursor-pointer transition-colors ${
              isDragging ? "border-[#008ae8] bg-[#e0f2fe]/60" : "border-[#aeaeaf]/40 hover:bg-[#fafafa]"
            }`}
          >
            <span>{isDragging ? "Drop more photos here" : "Drag and drop additional photos here, or click to browse"}</span>
          </div>
        </div>
      )}

      <div className="mt-3 p-3 rounded-xl bg-[#e0f2fe]/40 border border-[#008ae8]/20 flex items-start gap-2.5 text-xs text-[#262626]">
        <Zap className="w-4 h-4 text-[#008ae8] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-[#757577]">
          <strong className="text-[#262626]">Pro tip:</strong> Listings with 4+ clear photos get up to{" "}
          <strong className="text-[#008ae8]">8x more direct buyer calls</strong> and close significantly faster.
        </p>
      </div>
    </div>
  );
}

/** A single optional image, used for the floor plan. */
export function SingleImageUpload({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      onChange(await compressImage(file));
    } catch {
      setError("Could not read that image. Please try a JPG or PNG.");
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-[#262626] uppercase mb-1">{label}</label>
      <p className="text-[11px] text-[#757577] mb-2">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-28 w-auto rounded-xl border border-[#aeaeaf]/40 bg-[#fafafa]" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer"
            aria-label={`Remove ${label}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] text-xs font-medium text-[#008ae8] bg-[#e0f2fe] hover:bg-[#bae6fd] border border-[#008ae8]/30 transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload image</span>
        </button>
      )}
      {error && <p className="mt-1.5 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

import React, { useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { VEHICLE_PHOTO_SLOTS } from '../data/presets';

interface VehiclePhotoUploaderProps {
  photos: Record<string, string>; // slotId -> base64 dataUrl
  onChangePhotos: (photos: Record<string, string>) => void;
}

export const VehiclePhotoUploader: React.FC<VehiclePhotoUploaderProps> = ({ photos, onChangePhotos }) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const uploadedCount = VEHICLE_PHOTO_SLOTS.filter(slot => !!photos[slot.id]).length;
  const isComplete = uploadedCount === 12;

  const handleFileChange = (slotId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChangePhotos({
          ...photos,
          [slotId]: result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (slotId: string) => {
    const updated = { ...photos };
    delete updated[slotId];
    onChangePhotos(updated);
  };

  // Helper to load realistic SVG-based high-resolution sample placeholders for demonstration
  const handleLoadDemoPhotos = () => {
    const demoPhotos: Record<string, string> = {};
    
    VEHICLE_PHOTO_SLOTS.forEach((slot, index) => {
      const colors = [
        '#0f172a', '#1e293b', '#334155', '#475569', '#0284c7', '#0369a1',
        '#059669', '#047857', '#d97706', '#b45309', '#4f46e5', '#3730a3'
      ];
      const bg = colors[index % colors.length];
      
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="${bg}"/>
        <rect x="20" y="20" width="560" height="360" fill="none" stroke="#f8fafc" stroke-width="3" stroke-dasharray="10 6" opacity="0.4"/>
        <circle cx="300" cy="180" r="60" fill="#ffffff" opacity="0.15"/>
        <path d="M 260 220 L 300 160 L 340 220 Z" fill="#ffffff" opacity="0.3"/>
        <text x="300" y="270" font-family="monospace, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">
          ${slot.title.toUpperCase()}
        </text>
        <text x="300" y="300" font-family="sans-serif" font-size="14" fill="#cbd5e1" text-anchor="middle">
          [ INSPECTED VERIFIED PHOTO #${index + 1} ]
        </text>
      </svg>`;

      demoPhotos[slot.id] = `data:image/svg+xml;base64,${btoa(svg)}`;
    });

    onChangePhotos(demoPhotos);
  };

  const handleClearAll = () => {
    if (confirm('Clear all uploaded vehicle photos?')) {
      onChangePhotos({});
    }
  };

  return (
    <div className="space-y-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100 font-mono">
              12-POINT MANDATORY VEHICLE INSPECTION PHOTOS
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Upload high-resolution inspection photos for each specified angle. Required for official PDF Valuation Export.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleLoadDemoPhotos}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center transition"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Load 12 Sample Photos
          </button>
          {uploadedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Progress Counter Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center">
            Photo Capture Progress:
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] ${isComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-amber-400'}`}>
              {uploadedCount} / 12 Uploaded
            </span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {isComplete ? 'All 12 photos captured & verified' : `${12 - uploadedCount} remaining`}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${(uploadedCount / 12) * 100}%` }}
          />
        </div>
      </div>

      {/* 12 Photo Upload Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {VEHICLE_PHOTO_SLOTS.map((slot) => {
          const photoData = photos[slot.id];

          return (
            <div
              key={slot.id}
              className={`relative rounded-xl border transition-all p-2.5 flex flex-col justify-between ${
                photoData
                  ? 'bg-slate-950 border-emerald-500/40 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Slot Header */}
              <div className="space-y-0.5 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono text-slate-200 truncate pr-1">
                    {slot.title}
                  </span>
                  {photoData ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                  {slot.description}
                </p>
              </div>

              {/* Photo Upload Area / Preview */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center group">
                {photoData ? (
                  <>
                    <img
                      src={photoData}
                      alt={slot.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[slot.id]?.click()}
                        className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-mono font-bold transition flex items-center"
                        title="Replace Photo"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(slot.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-xs font-mono font-bold transition"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[slot.id]?.click()}
                    className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-500 hover:text-amber-400 transition"
                  >
                    <ImageIcon className="w-6 h-6 mb-1 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    <span className="text-[10px] font-mono font-semibold text-slate-400 group-hover:text-amber-300">
                      Upload Photo
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">
                      JPG, PNG, WebP
                    </span>
                  </button>
                )}

                <input
                  ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(slot.id, e)}
                  className="hidden"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

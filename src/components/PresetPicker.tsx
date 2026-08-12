import React from 'react';
import { PRESET_VEHICLES } from '../data/presets';
import { InspectionInput } from '../types';
import { Sparkles, X, Check, Car } from 'lucide-react';
import { formatPkrShort } from '../utils/formatters';

interface PresetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (input: InspectionInput) => void;
}

export const PresetPicker: React.FC<PresetPickerProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-white">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg font-mono">Sample Vehicle Inspection Presets</h2>
              <p className="text-xs text-slate-400">Select a pre-configured Pakistani vehicle inspection scenario to run AI Valuation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {PRESET_VEHICLES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset.input);
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 cursor-pointer transition flex items-start justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition">
                    {preset.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                    {preset.input.year}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-6">{preset.description}</p>
                <div className="pl-6 flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                    📍 {preset.input.registrationCity}
                  </span>
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                    🛣️ {preset.input.mileageKm.toLocaleString()} KM
                  </span>
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                    💰 Baseline: {formatPkrShort(preset.input.baselineAskingPkr || 0)}
                  </span>
                </div>
              </div>

              <div className="self-center pl-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  Load <Check className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

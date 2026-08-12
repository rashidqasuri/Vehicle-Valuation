import React from 'react';
import { InspectionInput } from '../types';
import { Sliders, Wrench, Shield, Gauge, Armchair } from 'lucide-react';

interface ConditionRatingsProps {
  input: InspectionInput;
  onChange: (updated: Partial<InspectionInput>) => void;
}

export const ConditionRatings: React.FC<ConditionRatingsProps> = ({ input, onChange }) => {
  const getScoreColor = (val: number) => {
    if (val >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 6) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getScoreDescription = (val: number) => {
    if (val === 10) return 'Showroom Mint / Unused Condition';
    if (val >= 8) return 'Excellent / Very Well Maintained';
    if (val >= 6) return 'Fair / Standard Wear & Tear';
    if (val >= 4) return 'Below Average / Repair Required';
    return 'Severe Wear / Major Overhaul Needed';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-base text-slate-100 font-mono">
            Technical Condition Ratings (Scale 1 - 10)
          </h2>
          <p className="text-xs text-slate-400">
            Inspector objective rating across four main mechanical & cosmetic subsystems
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Exterior Rating */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <Shield className="w-4 h-4 mr-1.5 text-blue-400" />
              Exterior Body Rating
            </label>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getScoreColor(
                input.ratingExterior
              )}`}
            >
              {input.ratingExterior} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={input.ratingExterior}
            onChange={(e) => onChange({ ratingExterior: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[11px] text-slate-400">{getScoreDescription(input.ratingExterior)}</p>
        </div>

        {/* Interior Rating */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <Armchair className="w-4 h-4 mr-1.5 text-purple-400" />
              Interior Condition Rating
            </label>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getScoreColor(
                input.ratingInterior
              )}`}
            >
              {input.ratingInterior} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={input.ratingInterior}
            onChange={(e) => onChange({ ratingInterior: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[11px] text-slate-400">{getScoreDescription(input.ratingInterior)}</p>
        </div>

        {/* Engine / Transmission Rating */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <Gauge className="w-4 h-4 mr-1.5 text-emerald-400" />
              Engine & Transmission Rating
            </label>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getScoreColor(
                input.ratingEngine
              )}`}
            >
              {input.ratingEngine} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={input.ratingEngine}
            onChange={(e) => onChange({ ratingEngine: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[11px] text-slate-400">{getScoreDescription(input.ratingEngine)}</p>
        </div>

        {/* Suspension Rating */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <Wrench className="w-4 h-4 mr-1.5 text-amber-400" />
              Suspension, Steering & Tires Rating
            </label>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${getScoreColor(
                input.ratingSuspension
              )}`}
            >
              {input.ratingSuspension} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={input.ratingSuspension}
            onChange={(e) => onChange({ ratingSuspension: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <p className="text-[11px] text-slate-400">{getScoreDescription(input.ratingSuspension)}</p>
        </div>
      </div>
    </div>
  );
};

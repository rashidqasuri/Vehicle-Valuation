import React from 'react';
import { ShieldCheck, Car, Sparkles, History, FileText, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onNewInspection: () => void;
  onOpenPresets: () => void;
  onOpenHistory: () => void;
  onOpenSheets?: () => void;
  savedCount: number;
  isEvaluating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewInspection,
  onOpenPresets,
  onOpenHistory,
  onOpenSheets,
  savedCount,
  isEvaluating,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo and Regional Badge */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewInspection}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Car className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white font-mono">
                AutoValue <span className="text-amber-400">AI</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3 mr-1" /> Punjab Market Spec
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Senior Vehicle Technical Inspector & Regional Valuation Engine
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onOpenSheets && (
            <button
              onClick={onOpenSheets}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Sheets Backup
            </button>
          )}

          <button
            onClick={onOpenPresets}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Presets
          </button>

          <button
            onClick={onOpenHistory}
            className="relative inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            History
            {savedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewInspection}
            disabled={isEvaluating}
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            New
          </button>
        </div>

      </div>
    </header>
  );
};

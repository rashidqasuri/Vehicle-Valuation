import React, { useState } from 'react';
import { CarPanelState } from '../types';
import { PANEL_LABELS } from '../data/presets';
import { ShieldAlert, RefreshCw, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { getPanelStateBadge } from '../utils/formatters';

interface BodyInspectorProps {
  panels: Record<string, CarPanelState>;
  onChangePanel: (panelKey: string, state: CarPanelState) => void;
  onResetPanels: () => void;
}

export const BodyInspector: React.FC<BodyInspectorProps> = ({
  panels,
  onChangePanel,
  onResetPanels,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'exterior' | 'structure' | 'non_clean'>('all');

  const panelKeys = Object.keys(PANEL_LABELS);

  const filteredKeys = panelKeys.filter((key) => {
    const info = PANEL_LABELS[key];
    const currentState = panels[key] || 'clean';

    if (categoryFilter === 'exterior') return info.category === 'exterior';
    if (categoryFilter === 'structure') return info.category === 'structure';
    if (categoryFilter === 'non_clean') return currentState !== 'clean';
    return true;
  });

  const countNonClean = panelKeys.filter((k) => (panels[k] || 'clean') !== 'clean').length;
  const countStructural = panelKeys.filter(
    (k) => PANEL_LABELS[k].category === 'structure' && (panels[k] || 'clean') !== 'clean'
  ).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-slate-100 font-mono">
                Body & Panel Touchup Inspector
              </h2>
              {countNonClean > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {countNonClean} Panels Affected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Tag exterior touchings, repainted panels, replaced parts, or structural frame impacts
            </p>
          </div>
        </div>

        <button
          onClick={onResetPanels}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Reset to All Original
        </button>
      </div>

      {/* Structural Warning Notice */}
      {countStructural > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-bold">STRUCTURAL FRAME IMPACT DETECTED ({countStructural} Area):</span>{' '}
            A-Pillars, Aprons, Core Member, or Boot Floor damage will incur severe valuation deductions in Pakistani market (-15% to -35%).
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 text-xs">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            categoryFilter === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Panels ({panelKeys.length})
        </button>
        <button
          onClick={() => setCategoryFilter('exterior')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            categoryFilter === 'exterior'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Exterior Body
        </button>
        <button
          onClick={() => setCategoryFilter('structure')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            categoryFilter === 'structure'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Structural Frame ({countStructural})
        </button>
        <button
          onClick={() => setCategoryFilter('non_clean')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            categoryFilter === 'non_clean'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Only Affected ({countNonClean})
        </button>
      </div>

      {/* Interactive Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {filteredKeys.map((key) => {
          const info = PANEL_LABELS[key];
          const state = panels[key] || 'clean';
          const isStructural = info.category === 'structure';
          const badge = getPanelStateBadge(state);

          return (
            <div
              key={key}
              className={`p-3 rounded-xl border transition ${
                isStructural
                  ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-xs text-slate-200">
                    {info.label}
                  </span>
                  {isStructural && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      FRAME
                    </span>
                  )}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${badge.colorClass}`}>
                  {badge.label}
                </span>
              </div>

              {/* State Selector Buttons */}
              <div className="grid grid-cols-5 gap-1 text-[10px] font-medium font-mono">
                <button
                  onClick={() => onChangePanel(key, 'clean')}
                  className={`py-1 rounded border transition ${
                    state === 'clean'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => onChangePanel(key, 'touchup')}
                  className={`py-1 rounded border transition ${
                    state === 'touchup'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Touchup
                </button>
                <button
                  onClick={() => onChangePanel(key, 'repaint')}
                  className={`py-1 rounded border transition ${
                    state === 'repaint'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Repaint
                </button>
                <button
                  onClick={() => onChangePanel(key, 'replaced')}
                  className={`py-1 rounded border transition ${
                    state === 'replaced'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Replaced
                </button>
                <button
                  onClick={() => onChangePanel(key, 'damaged')}
                  className={`py-1 rounded border transition ${
                    state === 'damaged'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Damaged
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

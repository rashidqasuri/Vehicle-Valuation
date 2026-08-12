import React, { useState } from 'react';
import { InspectionReport } from '../types';
import { History, X, Trash2, ExternalLink, Calendar, Car, ShieldCheck, Search } from 'lucide-react';
import { formatPkrShort } from '../utils/formatters';

interface ValuationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: InspectionReport[];
  onSelectReport: (report: InspectionReport) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
}

export const ValuationHistory: React.FC<ValuationHistoryProps> = ({
  isOpen,
  onClose,
  savedReports,
  onSelectReport,
  onDeleteReport,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedReports.filter((r) => {
    const text = `${r.input.make} ${r.input.model} ${r.input.variant} ${r.input.registrationCity}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg font-mono">Saved Valuation Reports History</h2>
              <p className="text-xs text-slate-400">
                Access previously conducted Pakistani technical inspection reports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by make, model, registration..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {savedReports.length > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear All History
            </button>
          )}
        </div>

        {/* List of Reports */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <Car className="w-10 h-10 mx-auto text-slate-700 opacity-60" />
              <p>No saved valuation reports found.</p>
            </div>
          ) : (
            filtered.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition flex flex-wrap items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition font-mono">
                      {report.input.make} {report.input.model} {report.input.variant}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {report.input.year}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                    <span>📍 {report.input.registrationCity}</span>
                    <span>🛣️ {report.input.mileageKm.toLocaleString()} KM</span>
                    <span>📅 {new Date(report.timestamp).toLocaleDateString('en-PK')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right font-mono">
                    <span className="block text-[10px] text-slate-400 uppercase">Fair Market</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {formatPkrShort(report.matrix.fairMarketValuePkr)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectReport(report);
                      onClose();
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                  >
                    Open <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </button>

                  <button
                    onClick={() => onDeleteReport(report.id)}
                    className="p-2 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

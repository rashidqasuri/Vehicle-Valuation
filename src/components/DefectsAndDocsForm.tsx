import React from 'react';
import { InspectionInput } from '../types';
import { FileCheck, AlertTriangle, FileText, Fingerprint, DollarSign, Tag } from 'lucide-react';

interface DefectsAndDocsFormProps {
  input: InspectionInput;
  onChange: (updated: Partial<InspectionInput>) => void;
}

const COMMON_DEFECTS = [
  'Engine smoke / mild blow-by',
  'Gear slippage / shift delay',
  'AC compressor / cooling fault',
  'Suspension noise / shock leakage',
  'Tires worn (<40% tread left)',
  'Airbags deployed / missing resistor',
  'Brake pads / rotors worn',
  'Catalytic converter missing/cleaned',
  'Steering rack / assembly play',
  'Windshield chip / crack',
  'Battery weak / replacement needed',
  'Cluster fault / OBD DTC code',
];

export const DefectsAndDocsForm: React.FC<DefectsAndDocsFormProps> = ({ input, onChange }) => {
  const toggleDefect = (defect: string) => {
    const exists = input.defects.includes(defect);
    if (exists) {
      onChange({ defects: input.defects.filter((d) => d !== defect) });
    } else {
      onChange({ defects: [...input.defects, defect] });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Mechanical Faults & Defects */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-100 font-mono">
              Mechanical & Electrical Defect Tags
            </h2>
            <p className="text-xs text-slate-400">
              Select any verified faults found during physical drive test or OBD scan
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_DEFECTS.map((defect) => {
            const isSelected = input.defects.includes(defect);
            return (
              <button
                key={defect}
                type="button"
                onClick={() => toggleDefect(defect)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Tag className="w-3 h-3 text-amber-400" />
                <span>{defect}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Additional Custom Defect Notes
          </label>
          <input
            type="text"
            value={input.customDefectsText || ''}
            onChange={(e) => onChange({ customDefectsText: e.target.value })}
            placeholder="e.g. Right headlight cracked, Sunroof motor slow"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Document & Legal Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-100 font-mono">
              Document & Verification Status
            </h2>
            <p className="text-xs text-slate-400">
              Pakistani registration book, invoice file, biometric & excise token status
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Book / Smartcard Status */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Registration Book / Card
            </label>
            <select
              value={input.bookStatus}
              onChange={(e) => onChange({ bookStatus: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="original_smartcard">Original Smartcard (Clean)</option>
              <option value="original_book">Original Paper Registration Book</option>
              <option value="duplicate_book">Duplicate Registration Book (-8% Penalty)</option>
              <option value="duplicate_card">Duplicate Smartcard (-5% Penalty)</option>
            </select>
          </div>

          {/* Excise/Custom File */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <FileCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Invoice / Excise File
            </label>
            <select
              value={input.fileStatus}
              onChange={(e) => onChange({ fileStatus: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="original_complete">Original Complete Excise File</option>
              <option value="duplicate_file">Duplicate File (-6% Penalty)</option>
              <option value="missing_file">Missing Excise File (-15% High Risk)</option>
            </select>
          </div>

          {/* Biometric Verification */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <Fingerprint className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Biometric Transfer Status
            </label>
            <select
              value={input.biometricStatus}
              onChange={(e) => onChange({ biometricStatus: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="instant_available">Biometric Ready Immediately</option>
              <option value="delayed_available">Biometric Delayed (Search Buffer)</option>
              <option value="deceased_owner">Deceased Owner (Court Decree Req)</option>
              <option value="uncontactable">Seller Uncontactable (Biometric Blocked)</option>
            </select>
          </div>

          {/* Number Plate Type */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Registration Number Plates
            </label>
            <select
              value={input.numberPlateType}
              onChange={(e) => onChange({ numberPlateType: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="original_oem">Original OEM Excise Plates</option>
              <option value="duplicate">Duplicate Excise Plates</option>
              <option value="custom_fancy">Custom / Non-Excise Plates</option>
            </select>
          </div>

          {/* Token Tax */}
          <div className="sm:col-span-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Token Tax Status
              </label>
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tokentax"
                    checked={input.tokenTaxStatus === 'up_to_date'}
                    onChange={() => onChange({ tokenTaxStatus: 'up_to_date', unpaidTokenAmountPkr: 0 })}
                    className="accent-amber-400"
                  />
                  <span>Paid Up to Date</span>
                </label>
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tokentax"
                    checked={input.tokenTaxStatus === 'unpaid'}
                    onChange={() => onChange({ tokenTaxStatus: 'unpaid' })}
                    className="accent-amber-400"
                  />
                  <span className="text-rose-400">Arrears / Outstanding</span>
                </label>
              </div>
            </div>

            {input.tokenTaxStatus === 'unpaid' && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Unpaid Token Amount (PKR):</span>
                <input
                  type="number"
                  value={input.unpaidTokenAmountPkr || ''}
                  onChange={(e) =>
                    onChange({
                      unpaidTokenAmountPkr: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  placeholder="e.g. 18000"
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

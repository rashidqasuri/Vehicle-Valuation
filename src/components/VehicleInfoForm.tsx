import React, { useState } from 'react';
import { InspectionInput } from '../types';
import { COMMON_PAKISTANI_MAKES, VEHICLE_CATEGORIES, MAKES_MODELS_MAP } from '../data/presets';
import { Car, MapPin, Gauge, DollarSign, Calendar, Fuel, Palette, Camera, Layers } from 'lucide-react';
import { formatPkrShort } from '../utils/formatters';
import { VehiclePhotoUploader } from './VehiclePhotoUploader';
import { ExternalPriceCrossCheck } from './ExternalPriceCrossCheck';

interface VehicleInfoFormProps {
  input: InspectionInput;
  onChange: (updated: Partial<InspectionInput>) => void;
}

export const VehicleInfoForm: React.FC<VehicleInfoFormProps> = ({ input, onChange }) => {
  const [showPhotoUploader, setShowPhotoUploader] = useState(true);

  const availableModels = MAKES_MODELS_MAP[input.make] || [];

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-100 font-mono">
              SECTION 1: Vehicle Specifications & Regional Baseline
            </h2>
            <p className="text-xs text-slate-400">
              Select or type any vehicle (Cars, SUVs, Commercials, Bikes, Custom Imports) and regional baseline
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Vehicle Category */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Vehicle Type / Category
            </label>
            <select
              value={input.vehicleCategory || 'Sedan'}
              onChange={(e) => onChange({ vehicleCategory: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              {VEHICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Make / Manufacturer */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Make / Manufacturer <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="pakistani-makes"
                value={input.make}
                onChange={(e) => onChange({ make: e.target.value })}
                placeholder="e.g. Suzuki, Toyota, Honda, Kia, MG"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
              />
              <datalist id="pakistani-makes">
                {COMMON_PAKISTANI_MAKES.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Model Name <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="make-models-list"
                value={input.model}
                onChange={(e) => onChange({ model: e.target.value })}
                placeholder="e.g. Alto, Civic, Corolla, Sportage"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
              />
              {availableModels.length > 0 && (
                <datalist id="make-models-list">
                  {availableModels.map((mdl) => (
                    <option key={mdl} value={mdl} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          {/* Variant */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Variant / Trim <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={input.variant}
              onChange={(e) => onChange({ variant: e.target.value })}
              placeholder="e.g. VXL AGS, Oriel 1.8, Altis 1.6, FWD"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Model Year
            </label>
            <select
              value={input.year}
              onChange={(e) => onChange({ year: parseInt(e.target.value, 10) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition font-mono"
            >
              {Array.from({ length: 47 }, (_, i) => 2026 - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Meter Mileage (KM) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span className="flex items-center">
                <Gauge className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Meter Mileage (KM)
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                ~{((2026 - input.year) * 15000).toLocaleString()} KM std
              </span>
            </label>
            <input
              type="number"
              step="1000"
              value={input.mileageKm || ''}
              onChange={(e) => onChange({ mileageKm: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              placeholder="e.g. 45000"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition font-mono"
            />
          </div>

          {/* Registration City */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Registration City
            </label>
            <select
              value={input.registrationCity}
              onChange={(e) => onChange({ registrationCity: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="Lahore">Lahore (Punjab)</option>
              <option value="Islamabad">Islamabad (ICT)</option>
              <option value="Karachi">Karachi (Sindh)</option>
              <option value="Faisalabad">Faisalabad (Punjab)</option>
              <option value="Rawalpindi">Rawalpindi (Punjab)</option>
              <option value="Gujranwala">Gujranwala (Punjab)</option>
              <option value="Multan">Multan (Punjab)</option>
              <option value="Peshawar">Peshawar (KPK)</option>
              <option value="Quetta">Quetta (Balochistan)</option>
              <option value="Sialkot">Sialkot (Punjab)</option>
              <option value="Unregistered">Unregistered / Invoice</option>
            </select>
          </div>

          {/* Fuel & Color */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <Fuel className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Fuel Type
            </label>
            <select
              value={input.fuelType}
              onChange={(e) => onChange({ fuelType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid (HEV)">Hybrid (HEV)</option>
              <option value="Electric (EV)">Electric (EV)</option>
              <option value="CNG + Petrol">CNG + Petrol</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center">
              <Palette className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Exterior Color
            </label>
            <input
              type="text"
              value={input.color}
              onChange={(e) => onChange({ color: e.target.value })}
              placeholder="e.g. Solid White, Metallic Silver"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Regional Market Context */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Regional Inspection Market
            </label>
            <select
              value={input.region}
              onChange={(e) => onChange({ region: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition"
            >
              <option value="Lahore / Punjab">Lahore & Punjab Hub (Standard Pricing)</option>
              <option value="Islamabad / Rawalpindi">Islamabad / Twin Cities (+2% Premium)</option>
              <option value="Karachi / Sindh">Karachi Market (-3% Freight / Rust Adj)</option>
              <option value="Other Regional Punjab">Other Punjab Cities (Faisalabad/Multan)</option>
            </select>
          </div>

          {/* Market Baseline Asking Price (PKR) */}
          <div className="sm:col-span-2 lg:col-span-3 pt-2">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs text-amber-400 font-medium mb-1 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Market Baseline Asking Price (PKR)
                  <span className="ml-2 text-[10px] text-slate-400">
                    (Portal asking price benchmark)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="50000"
                    value={input.baselineAskingPkr || ''}
                    onChange={(e) =>
                      onChange({
                        baselineAskingPkr: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    placeholder="e.g. 3500000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400 text-[11px]">Formatted:</span>
                <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                  {formatPkrShort(input.baselineAskingPkr || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Price Cross-Check Links */}
      <ExternalPriceCrossCheck
        make={input.make}
        model={input.model}
        variant={input.variant}
        year={input.year}
        region={input.region}
      />

      {/* 12 Vehicle Photos Uploader Section */}
      <VehiclePhotoUploader
        photos={input.vehiclePhotos || {}}
        onChangePhotos={(photos) => onChange({ vehiclePhotos: photos })}
      />
    </div>
  );
};


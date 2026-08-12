import React from 'react';
import { ExternalLink, Search, Globe, ShieldCheck, Tag } from 'lucide-react';

interface ExternalPriceCrossCheckProps {
  make: string;
  model: string;
  variant?: string;
  year: number;
  region?: string;
  compact?: boolean;
}

export const ExternalPriceCrossCheck: React.FC<ExternalPriceCrossCheckProps> = ({
  make,
  model,
  variant = '',
  year,
  region = 'Lahore / Punjab',
  compact = false,
}) => {
  const cleanMake = make || 'Toyota';
  const cleanModel = model || 'Corolla';
  const query = `${cleanMake} ${cleanModel} ${variant} ${year}`.trim();

  // Generated direct search links
  const pakwheelsUrl = `https://www.pakwheels.com/used-cars/search/-/?q=${encodeURIComponent(query)}`;
  const olxUrl = `https://www.olx.com.pk/vehicles_c5/q-${encodeURIComponent(`${cleanMake}-${cleanModel}-${year}`)}`;
  const carswitchUrl = `https://carswitch.com/pakistan/used-cars/search?q=${encodeURIComponent(query)}`;
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${query} price in Pakistan PakWheels OLX`)}`;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center">
          <Globe className="w-3.5 h-3.5 mr-1 text-amber-400" />
          Live Price Cross-Check:
        </span>
        <a
          href={pakwheelsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center transition"
        >
          PakWheels <ExternalLink className="w-3 h-3 ml-1" />
        </a>
        <a
          href={olxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-mono font-bold flex items-center transition"
        >
          OLX Punjab <ExternalLink className="w-3 h-3 ml-1" />
        </a>
        <a
          href={googleSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-mono font-bold flex items-center transition"
        >
          Google Market <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-xs text-slate-200 font-mono tracking-wider uppercase">
            EXTERNAL REAL-TIME PRICE CROSS-CHECK LINKS
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono flex items-center">
          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
          Active Punjab Portal Index
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed font-sans">
        Cross-verify live asking prices for <strong className="text-slate-200">{query}</strong> across Pakistan's major online automotive portals:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <a
          href={pakwheelsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold font-mono text-emerald-400 group-hover:text-emerald-300 flex items-center">
              PakWheels Used
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Live Search Index</div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
        </a>

        <a
          href={olxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 transition group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold font-mono text-teal-400 group-hover:text-teal-300 flex items-center">
              OLX Punjab
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Direct Seller Ads</div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
        </a>

        <a
          href={carswitchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold font-mono text-amber-400 group-hover:text-amber-300 flex items-center">
              CarSwitch Dealer
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Verified Listings</div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
        </a>

        <a
          href={googleSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition group flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold font-mono text-blue-400 group-hover:text-blue-300 flex items-center">
              Google Market
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Web Search & News</div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
        </a>
      </div>
    </div>
  );
};

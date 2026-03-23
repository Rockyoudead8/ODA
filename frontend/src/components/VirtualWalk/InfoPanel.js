import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const InfoPanel = ({ info, isLoading }) => (
  <div className="w-full bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden max-h-[25%]">

    {/* Header — mirrors Specific.js section headers */}
    <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-800">
      <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
        <MapPin size={16} className="text-amber-400" />
      </div>
      <h3 className="text-[15px] font-bold text-stone-50 tracking-tight m-0">
        Location Information
      </h3>
    </div>

    {/* Body */}
    <div className="px-6 py-4 overflow-y-auto max-h-[calc(25vh-64px)]">
      {isLoading ? (
        <div className="flex items-center gap-2.5 text-stone-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Fetching new location data…</span>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-stone-400 m-0">{info}</p>
      )}
    </div>
  </div>
);

export default InfoPanel;
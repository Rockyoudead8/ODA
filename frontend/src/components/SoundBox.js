import React, { useState, useEffect } from 'react';
import { Play, Pause, MapPin, Music2 } from 'lucide-react';

const citySoundData = {
  Paris: {
    name: 'Paris',
    vendors: [
      { name: 'Male Vendor (French)',   file: '/voices/voice_preview_paris male.mp3'   },
      { name: 'Female Vendor (French)', file: '/voices/voice_preview_paris female.mp3' },
    ],
    ambience: [{ name: 'Tuileries Park', file: '/voices/paris.wav' }],
  },
  Tokyo: {
    name: 'Tokyo',
    vendors: [
      { name: 'Male Vendor (Japanese)',   file: '/voices/voice_preview_tokyo male.mp3'   },
      { name: 'Female Vendor (Japanese)', file: '/voices/voice_preview_tokyo female.mp3' },
    ],
    ambience: [{ name: 'Meiji Jingu Shrine', file: '/voices/tokyo.wav' }],
  },
  Sydney: {
    name: 'Sydney',
    vendors: [
      { name: 'Male Vendor (Aussie)',   file: '/voices/voice_preview_sydney male.mp3'   },
      { name: 'Female Vendor (Aussie)', file: '/voices/voice_preview_sydney female.mp3' },
    ],
    ambience: [{ name: 'SCG Stadium', file: '/voices/sydney.wav' }],
  },
  Dubai: {
    name: 'Dubai',
    vendors: [
      { name: 'Male Vendor (Souk)',   file: '/voices/voice_preview_dubai male.mp3'   },
      { name: 'Female Vendor (Souk)', file: '/voices/voice_preview_dubai female.mp3' },
    ],
    ambience: [{ name: 'Wildlife Sanctuary', file: '/voices/dubai.wav' }],
  },
  London: {
    name: 'London',
    vendors: [
      { name: 'Male Vendor (British)',   file: '/voices/voice_preview_london male.mp3'   },
      { name: 'Female Vendor (British)', file: '/voices/voice_preview_london female.mp3' },
    ],
    ambience: [{ name: "Speakers' Corner", file: '/voices/london.wav' }],
  },
  NewYork: {
    name: 'New York',
    vendors: [
      { name: 'Male Vendor (NY)',   file: '/voices/voice_preview_ny male.mp3'   },
      { name: 'Female Vendor (NY)', file: '/voices/voice_preview_ny female.mp3' },
    ],
    ambience: [{ name: 'Times Square', file: '/voices/audio.mp3' }],
  },
};

/* Per-category accent config — Tailwind class strings */
const CATEGORY_CONFIG = {
  'Local Vendors & Voices': {
    iconColor:    'text-rose-400',
    labelColor:   'text-rose-400',
    activeText:   'text-rose-400',
    activeBorder: 'border-rose-400',
    activeBg:     'bg-rose-400/10',
    iconBg:       'bg-rose-400',
    barColor:     'bg-rose-400',
  },
  'Nearby Ambience': {
    iconColor:    'text-amber-400',
    labelColor:   'text-amber-400',
    activeText:   'text-amber-400',
    activeBorder: 'border-amber-400',
    activeBg:     'bg-amber-400/10',
    iconBg:       'bg-amber-400',
    barColor:     'bg-amber-400',
  },
};

function SoundBox({ cityKey }) {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying]       = useState(null);

  const normalizedCityKey = cityKey ? cityKey.replace(/ /g, '') : null;
  const city = citySoundData[normalizedCityKey] || { name: "City Not Found", vendors: [], ambience: [] };

  useEffect(() => {
    return () => {
      if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setIsPlaying(null); }
    };
  }, [normalizedCityKey]);

  const playAudio = (file) => {
    if (isPlaying === file) {
      currentAudio?.pause();
      setCurrentAudio(null);
      setIsPlaying(null);
      return;
    }
    currentAudio?.pause();
    const audio = new Audio(file);
    audio.play();
    audio.onended = () => { setIsPlaying(null); setCurrentAudio(null); };
    setCurrentAudio(audio);
    setIsPlaying(file);
  };

  const soundCategories = [
    { title: 'Local Vendors & Voices', sounds: city.vendors  },
    { title: 'Nearby Ambience',        sounds: city.ambience },
  ];

  if (!citySoundData[normalizedCityKey]) {
    return (
      <div className="flex items-center justify-center h-full text-stone-500 text-sm
                       bg-stone-900 rounded-2xl p-6 text-center">
        Soundscape data not available for this city.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-1">

      {/* City tag */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-rose-400/10 border border-rose-400/20
                          rounded-full px-3 py-1">
          <MapPin size={13} className="text-rose-400" />
          <span className="text-[13px] font-semibold text-rose-400">{city.name}</span>
        </span>
      </div>

      {/* Sound categories */}
      <div className="flex flex-col gap-3.5 overflow-y-auto flex-1">
        {soundCategories.map((category, i) => {
          const cfg = CATEGORY_CONFIG[category.title];
          return (
            <div key={i} className="bg-[#262220] border border-stone-800 rounded-2xl overflow-hidden">

              {/* Category header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-800">
                <Music2 size={13} className={cfg.iconColor} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${cfg.labelColor}`}>
                  {category.title}
                </span>
              </div>

              {/* Sound buttons */}
              <div className="p-3 flex flex-col gap-2">
                {category.sounds.map((sound, j) => {
                  const active = isPlaying === sound.file;
                  return (
                    <button
                      key={j}
                      onClick={() => playAudio(sound.file)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                                  border text-[13px] font-medium w-full text-left
                                  transition-all duration-200
                                  ${active
                                    ? `${cfg.activeBorder} ${cfg.activeBg} ${cfg.activeText}`
                                    : 'border-stone-700 text-stone-400 hover:bg-white/[0.04] hover:text-stone-50 hover:border-stone-600'
                                  }`}
                    >
                      {/* Play / Pause circle */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                                       transition-colors duration-200
                                       ${active ? cfg.iconBg : 'bg-stone-700'}`}>
                        {active
                          ? <Pause size={12} className="text-stone-900" />
                          : <Play  size={12} className="text-stone-400" />
                        }
                      </div>

                      <span className="flex-1">{active ? 'Playing…' : sound.name}</span>

                      {/* Animated equaliser bars */}
                      {active && (
                        <div className="flex items-end gap-0.5 h-4">
                          <div className={`w-[3px] rounded-sm ${cfg.barColor} soundbar-1`} />
                          <div className={`w-[3px] rounded-sm ${cfg.barColor} soundbar-2`} />
                          <div className={`w-[3px] rounded-sm ${cfg.barColor} soundbar-3`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Keyframes for animated bars — kept minimal since Tailwind can't define custom keyframes without config */}
      <style>{`
        .soundbar-1 { height: 4px; animation: sb1 0.6s ease-in-out infinite alternate; }
        .soundbar-2 { height: 8px; animation: sb2 0.6s ease-in-out infinite alternate; }
        .soundbar-3 { height: 5px; animation: sb3 0.6s ease-in-out infinite alternate; }
        @keyframes sb1 { to { height: 14px; } }
        @keyframes sb2 { to { height: 10px; } }
        @keyframes sb3 { to { height: 16px; } }
      `}</style>
    </div>
  );
}

export default SoundBox;
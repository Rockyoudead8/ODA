import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, MapPin } from 'lucide-react';

const citySoundData = {
  Paris: {
    name: 'Paris',
    vendors: [
      { name: 'Male Vendor (French)', file: '/voices/voice_preview_paris male.mp3' },
      { name: 'Female Vendor (French)', file: '/voices/voice_preview_paris female.mp3' },
    ],
    ambience: [
      { name: 'Tuileries Park', file: '/voices/paris.wav' },
    ],
  },
  Tokyo: {
    name: 'Tokyo',
    vendors: [
      { name: 'Male Vendor (Japanese)', file: '/voices/voice_preview_tokyo male.mp3' },
      { name: 'Female Vendor (Japanese)', file: '/voices/voice_preview_tokyo female.mp3' },
    ],
    ambience: [
      { name: 'Meiji Jingu Shrine', file: '/voices/tokyo.wav' },
    ],
  },
  Sydney: {
    name: 'Sydney',
    vendors: [
      { name: 'Male Vendor (Aussie)', file: '/voices/voice_preview_sydney male.mp3' },
      { name: 'Female Vendor (Aussie)', file: '/voices/voice_preview_sydeny female.mp3' },
    ],
    ambience: [
      { name: 'SCG Stadium', file: '/voices/sydney.wav' },
    ],
  },
  Dubai: {
    name: 'Dubai',
    vendors: [
      { name: 'Male Vendor (Souk)', file: '/voices/voice_preview_dubai male.mp3' },
      { name: 'Female Vendor (Souk)', file: '/voices/voice_preview_dubai female.mp3' },
    ],
    ambience: [
      { name: 'Wildlife Sanctuary', file: '/voices/dubai.wav' },
    ],
  },
  London: {
    name: 'London',
    vendors: [
      { name: 'Male Vendor (British)', file: '/voices/voice_preview_london male.mp3' },
      { name: 'Female Vendor (British)', file: '/voices/voice_preview_london female.mp3' },
    ],
    ambience: [
      { name: 'Speakers\' Corner', file: '/voices/london.wav' },
    ],
  },
  NewYork: {
    name: 'New York',
    vendors: [
      { name: 'Male Vendor (British)', file: '/voices/voice_preview_ny male.mp3' },
      { name: 'Female Vendor (British)', file: '/voices/voice_preview_ny female.mp3' },
    ],
    ambience: [
      { name: 'Speakers\' Corner', file: '/voices/audio.mp3' },
    ],
  },
};


function SoundBox({ cityKey }) {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(null); 

  // Normalize the incoming cityKey by removing spaces
  const normalizedCityKey = cityKey ? cityKey.replace(/ /g, '') : null;

  const city = citySoundData[normalizedCityKey] || { name: "City Not Found", vendors: [], ambience: [] };

  
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlaying(null);
      }
    };
  }, [normalizedCityKey]);

  const playAudio = (file) => {

    if (isPlaying === file) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlaying(null);
      }
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(file);
    audio.play();

    audio.onended = () => {
      setIsPlaying(null);
      setCurrentAudio(null);
    };
    
    setCurrentAudio(audio);
    setIsPlaying(file);
  };
  
  const soundCategories = [
    { title: 'Local Vendors & Voices', sounds: city.vendors },
    { title: 'Nearby Ambience', sounds: city.ambience },
  ];

  if (!citySoundData[normalizedCityKey]) {
      return (
          <div className="flex items-center justify-center h-full text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
              <p>Soundscape data not available for this city.</p>
          </div>
      );
  }

  return (
    <div className="p-4 w-full h-full space-y-4 flex flex-col">
      <h2 className="text-xl sm:text-2xl font-bold flex items-center text-indigo-700">
        <Volume2 className="w-6 h-6 mr-2"/> Virtual Soundscape
      </h2>

      <div className="flex items-center space-x-2">
        <MapPin className="w-5 h-5 text-pink-500" />
        <span className="p-2 text-indigo-700 font-semibold">{city.name}</span>
      </div>

      <div className="flex flex-col space-y-4 overflow-y-auto">
        {soundCategories.map((category, i) => (
          <div key={i} className="border border-indigo-100 rounded-xl p-4 shadow-sm bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600 border-b border-indigo-200 pb-2">
              {category.title}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.sounds.map((sound, j) => {
                const isCurrent = isPlaying === sound.file;
                return (
                  <button
                    key={j}
                    className={`flex items-center justify-center p-3 text-sm font-medium rounded-lg transition duration-200 shadow-md ${
                      isCurrent
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-white text-gray-700 hover:bg-indigo-50 border border-indigo-200'
                    }`}
                    onClick={() => playAudio(sound.file)}
                  >
                    {isCurrent ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isCurrent ? 'Playing...' : sound.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SoundBox;
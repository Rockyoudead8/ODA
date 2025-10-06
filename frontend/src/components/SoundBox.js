import React, { useState } from 'react';

function SoundBox() {
  const [currentAudio, setCurrentAudio] = useState(null);


  const soundCategories = [
    {
      title: 'Vendors',
      sounds: [
        { name: 'Male Voice', file: '/voices/voice_preview_my male.mp3' },
        { name: 'Female Voice', file: '/voices/voice_preview_ny female.mp3' },
      ],
    },
    {
      title: 'Marketplace',
      sounds: [
        { name: 'Ambient Sound', file: '/voices/audio.mp3' },
      ],
    },
  ];

  const playAudio = (file) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(file);
    audio.play();
    setCurrentAudio(audio);
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Sound Box</h2>

      {soundCategories.map((category, i) => (
        <div key={i} className="border rounded p-4 shadow-sm">
          <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
          <div className="flex flex-wrap gap-2">
            {category.sounds.map((sound, j) => (
              <div
                key={j}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full cursor-pointer hover:bg-blue-200"
                onClick={() => playAudio(sound.file)}
              >
                {sound.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SoundBox;

// // src/AudioPlayer.js
// import React, { useState } from "react";

// const AudioPlayer = () => {
//   const [audioUrl, setAudioUrl] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchAudio = async (scene) => {
//     setLoading(true);
//     setAudioUrl(null);

//     try {
//       const response = await fetch("https://api.soundraw.io/v1/music/generate", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer YOUR_API_KEY`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           mood: scene.mood,
//           genre: scene.genre,
//           tempo: scene.tempo,
//           length: scene.length,
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || "Failed to fetch audio");
//       }

//       const data = await response.json();
//       setAudioUrl(data.audio_url);
//     } catch (error) {
//       console.error("Error fetching audio:", error);
//       alert("Error fetching audio: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={() =>
//           fetchAudio({ mood: "calm", genre: "ambient", tempo: "slow", length: "long" })
//         }
//       >
//         Play Forest Walk
//       </button>

//       <button
//         onClick={() =>
//           fetchAudio({ mood: "energetic", genre: "electronic", tempo: "fast", length: "short" })
//         }
//         style={{ marginLeft: 10 }}
//       >
//         Play City Rush
//       </button>

//       {loading && <p>Loading...</p>}

//       {audioUrl && !loading && (
//         <audio controls autoPlay>
//           <source src={audioUrl} type="audio/mpeg" />
//           Your browser does not support the audio element.
//         </audio>
//       )}
//     </div>
//   );
// };

// export default AudioPlayer;

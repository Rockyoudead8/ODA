import React, { useEffect, useState } from "react";
import { Clock, MapPin, Loader2, AlertTriangle } from 'lucide-react';

function Timeline({ city }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!city) return;

    const fetchTimeline = async () => {
      setLoading(true);
      setFetchError(null);
      setTimeline([]);

      try {
        
        const res = await fetch("http://localhost:8000/api/generate_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch city info.");

    
        if (!data.timeline || data.timeline.length === 0) {
          throw new Error("No timeline data available for this city.");
        }

        setTimeline(data.timeline);
      } catch (err) {
        console.error("Fetch Error:", err.message);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [city]);

  if (loading) {
      return (
          <div className="text-center py-6">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="mt-2 text-indigo-600 font-medium">Loading historical roadmap for {city}...</p>
          </div>
      );
  }

  if (fetchError) {
      return (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p className="font-medium">{fetchError}</p>
          </div>
      );
  }

  if (!timeline || timeline.length === 0) {
      return (
          <p className="text-gray-500 text-center py-6">
              <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              No historical events are currently available for {city}.
          </p>
      );
  }

  return (
    <div className="relative pt-8 px-4 sm:px-0 ">
        
      
        <div className="absolute top-0 left-1/2 w-1 h-full bg-indigo-200 transform -translate-x-1/2 rounded-full shadow-inner overflow-hidden">
            <div className="absolute w-full h-full bg-gradient-to-b from-pink-400 via-indigo-400 to-teal-400 opacity-50"></div>
        </div>

        {timeline.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const markerColor = isLeft ? "bg-pink-600" : "bg-teal-600";
            const cardDirection = isLeft ? "md:mr-16 text-right" : "md:ml-16 text-left";
            const cardAlignment = isLeft ? "md:justify-end" : "md:justify-start";
            const cardBorder = isLeft ? "border-l-4 border-pink-500" : "border-r-4 border-teal-500";

            return (
                <div key={idx} className="flex md:flex-row flex-col-reverse justify-center items-center w-full my-8">
                    
                 
                    <div className={`w-full md:w-1/2 flex ${cardAlignment} px-2 md:px-0`}>
                        <div className={`p-5 rounded-xl shadow-xl bg-white ${cardBorder} transform hover:scale-[1.02] transition duration-300 w-full md:max-w-md ${cardDirection}`}>
                            <p className="text-sm font-extrabold uppercase text-indigo-500 tracking-wider mb-1">{item.date}</p>
                            <h4 className="text-xl font-bold text-gray-800">{item.event}</h4>
                            
                        </div>
                    </div>
                    
           
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                        <div className={`w-8 h-8 rounded-full ${markerColor} ring-4 ring-white shadow-2xl flex items-center justify-center`}>
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    
                    <div className="hidden md:block w-1/2"></div>
                </div>
            );
        })}
    </div>
  );
}

export default Timeline;

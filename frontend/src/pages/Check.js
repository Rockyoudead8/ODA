import React from 'react';
import { useNavigate } from 'react-router-dom';

import { MapPin, ArrowRight } from 'lucide-react';

function Check() {

  const navigate = useNavigate();

  const handleSelectCity = () => {

    navigate('/Hero');
    console.log("Navigating to City Selection page.");
  };

  const handleSkip = () => {

    navigate('/Hero');
    console.log("Navigating to main listings page (Skipped).");
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-8 border-indigo-600">


        <div className="flex flex-col items-center mb-6">
          <MapPin className="w-12 h-12 text-indigo-600 mb-3 animate-bounce" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome Aboard!
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Let's customize your experience.
          </p>
        </div>


        <p className="text-xl text-gray-700 mb-8 font-medium">
          Would you like to select a particular city now to begin your virtual walk, or skip this step for later?
        </p>


        <div className="space-y-4">


          <button
            onClick={handleSelectCity}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Select City Now
          </button>


          <button
            onClick={handleSkip}
            className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Skip for Later
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

        </div>

        <p className="text-sm text-gray-400 mt-6">
          You can always select a city from the main page later.
        </p>
      </div>
    </div>
  )
}

export default Check;

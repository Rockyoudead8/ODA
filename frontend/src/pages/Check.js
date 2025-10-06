import React from 'react';
import { useNavigate } from 'react-router-dom';

import { MapPin, ArrowRight } from 'lucide-react';

function Check() {

  const navigate = useNavigate();

  const handleSelectCity = () => {
    navigate('/Hero');
  };

  const handleSkip = () => {
    navigate('/Hero');
  };

  return (
  
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-8 border-indigo-600 transition-all duration-300">


        <div className="flex flex-col items-center mb-6 sm:mb-8">
         
          <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 mb-3 animate-bounce transition-colors duration-300" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome Aboard!
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mt-2">
            Let's customize your experience.
          </p>
        </div>


        <p className="text-base sm:text-xl text-gray-700 mb-6 sm:mb-8 font-medium">
          Would you like to select a particular city now to begin your virtual walk, or skip this step for later?
        </p>


        <div className="space-y-4 sm:space-y-5">


          <button
            onClick={handleSelectCity}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base sm:text-lg font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Select City Now
          </button>


          <button
            onClick={handleSkip}
            className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base sm:text-lg font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Skip for Later
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

        </div>

        <p className="text-xs sm:text-sm text-gray-400 mt-6">
          You can always select a city from the main page later.
        </p>
      </div>
    </div>
  )
}

export default Check;
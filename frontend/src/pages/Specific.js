import React from 'react';

function Specific() {
  return (
    <div className="bg-gray-300 min-h-screen p-4 space-y-4">
      {/* Photos Section */}
      <div className="bg-white h-[80vh] flex items-center justify-center border-4 border-red-500">
        <p className="text-red-600 text-lg">photos</p>
      </div>

      {/* History & Facts Section */}
      <div className="bg-white h-[60vh] flex items-center justify-center border-4 border-red-500">
        <p className="text-red-600 text-lg text-center">
          history and facts and quizzes
        </p>
      </div>

      {/* Ghost Walk and Sound Box Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[65vh]">
        <div className="bg-white flex items-center justify-center border-2 border-black">
          <p className="text-red-600 text-lg">Ghost Walk</p>
        </div>
        <div className="bg-white flex items-center justify-center border-2 border-black">
          <p className="text-red-600 text-lg">sound box</p>
        </div>
      </div>
    </div>
  );
}

export default Specific;

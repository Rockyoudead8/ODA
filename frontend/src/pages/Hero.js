import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  const cards = Array.from({ length: 6 });

  return (
    <div className="bg-gray-500 min-h-screen pt-20 pb-20 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((_, index) => (
          <div
            key={index}
            className="max-w-sm mx-auto rounded overflow-hidden shadow-lg bg-white"
          >
            <img
              className="w-full bg-red-500 h-[20vh] object-cover"
              src="https://via.placeholder.com/400x200"
              alt="Card banner"
            />
            <div className="p-4">
              <h5 className="text-xl font-semibold mb-2">Card title</h5>
              <p className="text-gray-700 text-base mb-4">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              <Link
                to="/Specific"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Go somewhere
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hero;

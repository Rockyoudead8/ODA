import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Hero() {
  const [listings, setListings] = useState([]); // store listings
  const [loading, setLoading] = useState(true); // for loading state
  const [error, setError] = useState(null); // for errors

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/listing"); 
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listings");
        }

        setListings(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <p className="text-center text-white mt-20">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>;

  return (
    <div className="bg-gray-500 min-h-screen pt-20 pb-20 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((listing) => (
          <div
            key={listing._id}
            className="max-w-sm mx-auto rounded overflow-hidden shadow-lg bg-white"
          >
            <img
              className="w-full h-[20vh] object-cover"
              src={listing.thumbnail || "https://images.unsplash.com/photo-1758944967041-29389a4eed5f?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
              alt={listing.title}
            />
            <div className="p-4">
              <h5 className="text-xl font-semibold mb-2">{listing.title}</h5>
              <p className="text-gray-700 text-base mb-4">
                {listing.description?.slice(0, 80)}...
              </p>
              <Link
                to={`/specific/${listing._id}`} // dynamic route
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                View Listing
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hero;

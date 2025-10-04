import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Map from "../components/Map"
function Hero() {
  const [listings, setListings] = useState([]); // all listings from backend
  const [filteredListings, setFilteredListings] = useState([]); // filtered by search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // search input

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/listing"); 
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listings");
        }

        setListings(data);
        setFilteredListings(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);


  useEffect(() => {
    if (!searchQuery) {
      setFilteredListings(listings);
    } else {
      const filtered = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredListings(filtered);
    }
  }, [searchQuery, listings]);

  if (loading) return <p className="text-center text-white mt-20">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>;

  return (
    <>
    {/* map component */}
    
    {/* map component */}
    <div className="bg-gray-500 min-h-screen pt-20 pb-20 px-4">
    <div>
      <h1 className="text-3xl text-center mb-4">Most Visited Cities</h1>
      <Map />
    </div>
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="max-w-sm mx-auto rounded overflow-hidden shadow-lg bg-white"
            >
              <img
                className="w-full h-[20vh] object-cover"
                src={listing.images[0] || "https://images.unsplash.com/photo-1758944967041-29389a4eed5f?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                alt={listing.title}
              />
              <div className="p-4">
                <h5 className="text-xl font-semibold mb-2">{listing.title}</h5>
                <p className="text-gray-700 text-base mb-4">
                  {listing.description?.slice(0, 80)}...
                </p>
                <Link
                  to={`/specific/${listing._id}`}
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  View Listing
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-white col-span-full">No listings found.</p>
        )}
      </div>
    </div>
    </>
  );
}

export default Hero;

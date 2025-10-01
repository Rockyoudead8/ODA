import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Specific() {
  const { id } = useParams(); // get the id from URL
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/listing/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch listing");
        }

        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>;
  if (!listing) return <p className="text-center mt-20">Listing not found!</p>;

  return (
    <div className="bg-gray-300 min-h-screen p-4 space-y-4">
      {/* Photos Section */}
      <div className="bg-white h-[80vh] flex items-center justify-center border-4 border-red-500">
        <img
          src={listing.thumbnail || "https://via.placeholder.com/800x400"}
          alt={listing.title}
          className="object-cover h-full w-full"
        />
      </div>

      {/* History & Facts Section */}
      <div className="bg-white h-[60vh] flex items-center justify-center border-4 border-red-500">
        <p className="text-red-600 text-lg text-center">
          {listing.description}
        </p>
      </div>

      {/* Ghost Walk and Sound Box Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[65vh]">
        <div className="bg-white flex items-center justify-center border-2 border-black">
          <p className="text-red-600 text-lg">Ghost Walk</p>
        </div>
        <div className="bg-white flex items-center justify-center border-2 border-black">
          <p className="text-red-600 text-lg">Sound Box</p>
        </div>
      </div>
    </div>
  );
}

export default Specific;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Quiz_info from "../components/CityInfo";
function Specific() {
  const { id } = useParams(); 
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]); 

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing: id,
          text: commentText,
  
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      
      setComments([...comments, data]);
      setCommentText(""); 
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment: " + err.message);
    }
  };

  return (
    <div className="bg-gray-300 min-h-screen p-4 space-y-4">
    
      <div className="bg-white h-[80vh] flex items-center justify-center border-4 border-red-500">
        {listing.images && listing.images.length > 0 ? (
          <Slider {...sliderSettings} className="w-full h-full">
            {listing.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${listing.title}-${idx}`}
                className="object-cover h-[80vh] w-full"
              />
            ))}
          </Slider>
        ) : (
          <img
            src={listing.images?.[0] || "https://via.placeholder.com/800x400"}
            alt={listing.title}
            className="object-cover h-full w-full"
          />
        )}
      </div>
    {/* city history , facts and quizzes */}
      <div className="bg-white h-[60vh] flex items-center justify-center border-4 border-red-500">
        <Quiz_info city={listing.title}/>
      </div>
    {/* city history , facts and quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[65vh]">
        <div className="bg-white flex items-center justify-center border-2 border-black">
          <p className="text-red-600 text-lg">Ghost Walk</p>
        </div>
        <div className="bg-white flex items-center justify-center border-2 border-black">
          <p className="text-red-600 text-lg">Sound Box</p>
        </div>
      </div>

      <div className="bg-white flex flex-col-2 items-start border-4 border-red-500 p-4 space-y-4 gap-10">
        
        <Map />

      <div className="w-[100vh] mx-auto h-[50vh]">
        <div className="w-full mt-4">
          <h2 className="text-xl font-semibold mb-2">Add Your Comment</h2>
          <textarea
            className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Share your thoughts about this city..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleCommentSubmit}
          >
            Submit
          </button>
        </div>

        
        <div className="w-full mt-4">
          <h2 className="text-xl font-semibold mb-2">Comments</h2>
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((c, idx) => (
              <div key={idx} className="border-b py-2">
                <p>{c.text}</p>
              </div>
            ))
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default Specific;

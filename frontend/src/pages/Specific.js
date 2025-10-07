import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import Quiz_info from "../components/CityInfo";
import SoundBox from "../components/SoundBox";
import VMap from "../components/VirtualWalk/VirtualWalkMap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Leaderboard from "../components/Leaderboard";
import Timeline from "../components/Timeline";
import { Heart, MapPin, MessageCircle, Volume2, Globe, Clock, CheckCircle } from "lucide-react";


function Specific() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [visited, setVisited] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [message, setMessage] = useState("");

  const displayMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleCityVisit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      displayMessage("Please log in to track your visited cities.", true);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/toggle-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, listingId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update visit");

      setVisited(data.visited);
      setVisitCount(data.count);
      displayMessage(data.visited ? "City marked as visited!" : "Visit status removed.", false);
    } catch (err) {
      console.error(err);
      displayMessage("Error updating visit status.", true);
    }
  };

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    className: "w-full h-full",
    appendDots: dots => (
      <div style={{ bottom: "20px" }}>
        <ul className="flex justify-center space-x-2"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-2 h-2 rounded-full bg-white opacity-60 hover:opacity-100 transition duration-300"></div>
    )
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() && !commentImage) {
      displayMessage("Comment cannot be empty.", true);
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      displayMessage("You must be logged in to comment.", true);
      return;
    }

    let imageUrl = "";

    if (commentImage) {
      const formData = new FormData();
      formData.append("image", commentImage);

      try {
        const res = await fetch("http://localhost:8000/api/upload/image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image upload failed");
        imageUrl = data.url;
      } catch (err) {
        console.error(err);
        displayMessage("Failed to upload image.", true);
        return;
      }
    }

    try {
      const res = await fetch(`http://localhost:8000/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing: id,
          text: commentText,
          image: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      setComments([...comments, data]);
      setCommentText("");
      setCommentImage(null);
      displayMessage("Comment submitted successfully!", false);
    } catch (err) {
      console.error(err);
      displayMessage("Failed to submit comment.", true);
    }
  };

  if (loading) return <p className="text-center mt-20 text-lg font-semibold text-gray-700">Loading City Details...</p>;
  if (error) return <p className="text-center text-red-600 mt-20 font-semibold">Error: {error}</p>;
  if (!listing) return <p className="text-center mt-20 text-lg font-semibold text-gray-700">Listing not found!</p>;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen p-4 sm:p-6 lg:p-8 space-y-10 sm:space-y-12">
      {message && message.text && (
        <div className={`fixed top-20 right-5 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-medium transition-opacity duration-300 ${message.isError ? "bg-red-500" : "bg-green-500"}`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-200">
        <div className="p-4 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">{listing.title}</h1>
            <p className="text-base sm:text-lg text-pink-600 font-semibold flex items-center mt-1">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {listing.location || "Unknown Location"}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{visitCount}</p>
              <p className="text-xs font-medium text-gray-500">Total Visits</p>
            </div>
            <button
              onClick={toggleCityVisit}
              className={`px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold rounded-full transition duration-300 transform hover:scale-[1.05] active:scale-[0.98] shadow-lg ${visited ? "bg-pink-500 text-white shadow-pink-300/60" : "bg-indigo-600 text-white shadow-indigo-300/60 hover:bg-indigo-700"
                }`}
            >
              {visited ? (
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Visited!</span>
              ) : (
                <span className="flex items-center"><Heart className="w-4 h-4 mr-2" /> Mark as Visited</span>
              )}
            </button>
          </div>
        </div>

        <div className="w-full h-[40vh] sm:h-[50vh] lg:h-[60vh]">
          {listing.images && listing.images.length > 0 ? (
            <Slider {...sliderSettings}>
              {listing.images.map((img, idx) => (
                <div key={idx} className="h-[40vh] sm:h-[50vh] lg:h-[60vh]">
                  <img
                    src={img}
                    alt={`${listing.title}-${idx}`}
                    className="object-cover h-full w-full"
                    onError={(e) => e.target.src = "https://placehold.co/1200x700/DDE2FF/6366F1?text=City+Image+Unavailable"}
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <img
              src={"https://placehold.co/1200x700/DDE2FF/6366F1?text=City+Image+Unavailable"}
              alt={listing.title}
              className="object-cover h-full w-full"
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-indigo-100">
          <div className="flex items-center mb-4 text-indigo-600">
            <Clock className="w-6 h-6 mr-2" />
            <h2 className="text-2xl font-bold">History & Lore</h2>
          </div>
          <p className="text-gray-600 mb-4">{listing.description}</p>
          <div className="h-[50vh] sm:h-[60vh] border border-dashed border-pink-300 flex items-center justify-center text-gray-500 bg-pink-50 rounded-lg">
            <Quiz_info city={listing.title} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100">
          <div className="flex items-center mb-4 text-pink-600">
            <Volume2 className="w-6 h-6 mr-2" />
            <h2 className="text-2xl font-bold">Immersive Sound</h2>
          </div>
          <p className="text-gray-500 mb-4">Listen to the sounds of {listing.title}.</p>
          <div className="h-[50vh] sm:h-[60vh] flex items-center justify-center bg-indigo-50 rounded-lg border border-dashed border-indigo-300">
            <SoundBox cityKey={listing.title} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 h-[60vh] lg:h-[75vh]">
          <div className="flex items-center mb-4 text-indigo-600">
            <Globe className="w-6 h-6 mr-2" />
            <h2 className="text-2xl font-bold">Virtual Exploration</h2>
          </div>
          <div className="h-[calc(100%-40px)] rounded-lg overflow-hidden border border-gray-200">
            <VMap listingId={id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 h-[70vh] ">
            <Leaderboard listingId={listing._id}/>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <MessageCircle className="w-5 h-5 mr-2 text-pink-500" />
              Community Chatter
            </h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Share Your Thoughts</h4>
              <textarea
                className="w-full p-3 border border-indigo-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                rows={3}
                placeholder="What did you love about this city?"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCommentImage(e.target.files[0])}
                className="mt-2"
              />
              <button
                className="mt-3 px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition shadow-md shadow-indigo-300"
                onClick={handleCommentSubmit}
              >
                Submit Comment
              </button>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3 border-t pt-3">Recent Comments ({comments.length})</h4>
              {comments.length === 0 ? (
                <p className="text-gray-500 italic">Be the first to leave a comment!</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {comments.map((c, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-800">{c.text}</p>
                      {c.image && (
                        <img
                          src={c.image}
                          alt="comment"
                          className="mt-2 max-h-48 w-full object-cover rounded-md"
                        />
                      )}
                      <p className="text-xs text-gray-400 mt-1">— {c.user?.name || "Anonymous"}</p>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      

      
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 ">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">City Timeline</h2>
        <Timeline city={listing.title} />
      </div>


    </div>
  );
}

export default Specific;

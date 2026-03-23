import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Quiz_info from "../components/CityInfo";
import SoundBox from "../components/SoundBox";
import VMap from "../components/VirtualWalk/VirtualWalkMap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Leaderboard from "../components/Leaderboard";
import { Heart, MapPin, MessageCircle, Volume2, Globe, Clock, CheckCircle, Send, Camera, Users, Star, ChevronRight } from "lucide-react";

function Specific() {
  const navigate = useNavigate();
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
  const [visiting, setVisiting] = useState(false);

  const displayMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleCityVisit = async () => {
    if (visiting) return;
    setVisiting(true);
    try {
      const res = await fetch("http://localhost:8000/api/toggle-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.status === 401) {
        displayMessage("Please login first", true);
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to update visit");
      setVisited(data.visited);
      const visitRes = await fetch(
        `http://localhost:8000/api/get_visits?cityName=${encodeURIComponent(listing.title)}`,
        { credentials: "include" }
      );
      if (visitRes.ok) {
        const visitData = await visitRes.json();
        setVisitCount(visitData.userCount || 0);
      }
      displayMessage(data.visited ? "City marked as visited!" : "Visit status removed.", false);
    } catch (err) {
      console.error(err);
      displayMessage("Error updating visit status.", true);
    } finally {
      setVisiting(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [listingRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/listing/${id}`, { credentials: "include" }),
          fetch(`http://localhost:8000/api/comments/${id}`, { credentials: "include" })
        ]);
        if (!listingRes.ok) throw new Error("Failed to fetch listing");
        if (!commentsRes.ok) throw new Error("Failed to fetch comments");
        const listingData = await listingRes.json();
        const commentsData = await commentsRes.json();
        setListing(listingData);
        const checkRes = await fetch(
          `http://localhost:8000/api/check-visit?cityName=${encodeURIComponent(listingData.title)}`,
          { credentials: "include" }
        );
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          setVisited(checkData.visited);
        }
        setComments(commentsData);
        if (listingData.title) {
          const visitRes = await fetch(
            `http://localhost:8000/api/get_visits?cityName=${encodeURIComponent(listingData.title)}`,
            { credentials: "include" }
          );
          if (visitRes.ok) {
            const visitData = await visitRes.json();
            setVisitCount(visitData.userCount || 0);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAllData();
  }, [id]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
    className: "w-full h-full",
    appendDots: dots => (
      <div style={{ bottom: "28px" }}>
        <ul className="flex justify-center space-x-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-2 h-2 rounded-full bg-white/60 hover:bg-white transition-all duration-300" />
    )
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() && !commentImage) {
      displayMessage("Comment cannot be empty.", true);
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
          credentials: "include",
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing: id, text: commentText, image: imageUrl }),
      });
      const data = await res.json();
      if (res.status === 401) {
        displayMessage("Please login to comment.", true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setComments(prev => [data, ...prev]);
      setCommentText("");
      setCommentImage(null);
      displayMessage("Comment submitted successfully!", false);
    } catch (err) {
      console.error(err);
      displayMessage("Failed to submit comment.", true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-400 text-sm tracking-widest uppercase">Loading destination</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <p className="text-red-400 font-medium">{error}</p>
    </div>
  );
  if (!listing) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <p className="text-stone-400">Listing not found.</p>
    </div>
  );

  return (
    <div className="bg-stone-950 min-h-screen text-stone-100">

      {/* Toast notification */}
      {message && message.text && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 backdrop-blur-sm border ${
          message.isError
            ? "bg-red-950/90 border-red-800 text-red-200"
            : "bg-emerald-950/90 border-emerald-800 text-emerald-200"
        }`}>
          {message.text}
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative w-full h-[85vh] overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <Slider {...sliderSettings}>
            {listing.images.map((img, idx) => (
              <div key={idx} className="h-[85vh]">
                <img
                  src={img}
                  alt={`${listing.title}-${idx}`}
                  className="object-cover h-full w-full"
                  onError={(e) => e.target.src = "https://placehold.co/1600x900/1c1917/78716c?text=Image+Unavailable"}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <img
            src="https://placehold.co/1600x900/1c1917/78716c?text=No+Image"
            alt={listing.title}
            className="object-cover h-full w-full"
          />
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-transparent pointer-events-none" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">
                  {listing.location || "Destination"}
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none tracking-tight">
                {listing.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Visit count badge */}
              <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-2xl font-bold text-white">{visitCount}</span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 tracking-wide">Explorers</p>
              </div>

              {/* Visited button */}
              <button
                onClick={toggleCityVisit}
                disabled={visiting}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 border ${
                  visited
                    ? "bg-amber-400 text-stone-900 border-amber-400 shadow-lg shadow-amber-500/30"
                    : "bg-white/10 backdrop-blur-md text-white border-white/25 hover:bg-white/20 hover:border-white/40"
                }`}
              >
                {visited
                  ? <><CheckCircle className="w-4 h-4" /> Visited</>
                  : <><Heart className="w-4 h-4" /> Mark Visited</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* HISTORY + SOUND — Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* History & Quiz */}
          <div className="lg:col-span-2 bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden">
            <div className="flex items-center gap-3 px-7 py-5 border-b border-stone-800">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">History & Quiz</h2>
            </div>

            {listing.description && (
              <div className="px-7 py-5 border-b border-stone-800">
                <p className="text-stone-400 text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}

            <div className="h-[55vh] overflow-hidden">
              <Quiz_info city={listing.title} />
            </div>
          </div>

          {/* Sound */}
          <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-7 py-5 border-b border-stone-800">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-rose-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Ambient Sound</h2>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-stone-900 to-stone-950">
              <div className="w-full">
                <p className="text-stone-500 text-xs text-center mb-6 tracking-wide uppercase">
                  Immerse yourself in {listing.title}
                </p>
                <SoundBox cityKey={listing.title} />
              </div>
            </div>
          </div>
        </div>

        {/* VIRTUAL MAP — Full width */}
        <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden">
          <div className="flex items-center gap-3 px-7 py-5 border-b border-stone-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Virtual Exploration</h2>
            <span className="ml-auto text-xs text-stone-500 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              Famous landmarks only
            </span>
          </div>
          <div className="h-[72vh]">
            <VMap city={listing.title} />
          </div>
        </div>

        {/* LEADERBOARD + COMMUNITY — Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Leaderboard */}
          <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden h-[68vh]">
            <Leaderboard listingId={listing._id} />
          </div>

          {/* Community */}
          <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden flex flex-col h-[68vh]">
            <div className="flex items-center gap-3 px-7 py-5 border-b border-stone-800 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Community</h2>
              <span className="ml-auto text-xs text-stone-500 bg-stone-800 px-2.5 py-1 rounded-full">
                {comments.length} {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            {/* Comment input */}
            <div className="px-6 py-5 border-b border-stone-800 flex-shrink-0">
              <textarea
                className="w-full bg-stone-800 border border-stone-700 text-stone-200 placeholder-stone-500 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-600 transition-all"
                rows={3}
                placeholder={`Share your experience in ${listing.title}...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-stone-500 hover:text-stone-300 cursor-pointer text-xs transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>{commentImage ? commentImage.name : "Attach photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCommentImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleCommentSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </div>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MessageCircle className="w-10 h-10 text-stone-700 mb-3" />
                  <p className="text-stone-500 text-sm">No comments yet.</p>
                  <p className="text-stone-600 text-xs mt-1">Be the first to share!</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c._id}
                    className="bg-stone-800/60 border border-stone-700/50 rounded-xl p-4 hover:border-stone-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                        {(c.user?.name || "A")[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-stone-300">{c.user?.name || "Anonymous"}</span>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">{c.text}</p>
                    {c.image && (
                      <img
                        src={c.image}
                        alt="comment"
                        className="mt-3 max-h-40 w-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Specific;
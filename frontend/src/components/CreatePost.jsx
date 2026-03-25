import { useState, useRef, useEffect } from "react";
import { ImagePlus, X, ChevronDown } from "lucide-react";
import { BACKEND_URL } from '../utils/config';

function CreatePost({ refreshFeed, setShowModal }) {
  const [city,           setCity]           = useState("");
  const [content,        setContent]        = useState("");
  const [imageFile,      setImageFile]      = useState(null);
  const [submitting,     setSubmitting]     = useState(false);

  // City-search dropdown
  const [dbCities,       setDbCities]       = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [cityLoading,    setCityLoading]    = useState(true);

  // Post-result popup  ("points" | "suggest" | null)
  const [postResult,    setPostResult]    = useState(null);
  const [submittedCity, setSubmittedCity] = useState("");

  const fileInputRef    = useRef(null);
  const cityInputRef    = useRef(null);
  const dropdownRef     = useRef(null);

  /* ── Fetch all DB cities once on mount ─────────────────────────────────── */
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/listing`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const names = [...new Set(data.map(l => l.title).filter(Boolean))].sort();
          setDbCities(names);
        }
      })
      .catch(console.error)
      .finally(() => setCityLoading(false));
  }, []);

  /* ── Close dropdown when clicking outside ──────────────────────────────── */
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current   && !dropdownRef.current.contains(e.target) &&
        cityInputRef.current  && !cityInputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── City input handler ─────────────────────────────────────────────────── */
  const handleCityChange = (val) => {
    setCity(val);
    if (val.trim().length > 0) {
      setFilteredCities(
        dbCities.filter(c => c.toLowerCase().includes(val.trim().toLowerCase()))
      );
      setShowDropdown(true);
    } else {
      setFilteredCities([]);
      setShowDropdown(false);
    }
  };

  const selectCity = (name) => {
    setCity(name);
    setShowDropdown(false);
    cityInputRef.current?.blur();
  };

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  const submitPost = async () => {
    if (!city.trim() || !content.trim()) return;
    setSubmitting(true);

    const trimmedCity = city.trim();
    const isInDb      = dbCities.some(
      c => c.toLowerCase() === trimmedCity.toLowerCase()
    );

    const formData = new FormData();
    formData.append("city",    trimmedCity);
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      await fetch(`${BACKEND_URL}/api/community/create`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      setCity("");
      setContent("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setSubmittedCity(trimmedCity);
      setPostResult(isInDb ? "points" : "suggest");
      refreshFeed();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeAll = () => {
    setPostResult(null);
    setShowModal(false);
  };

  /* ════════════════════════════════════════════════════════════════════════
     POST-RESULT POPUP — replaces the form after a successful submission
  ════════════════════════════════════════════════════════════════════════ */
  if (postResult === "points") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
        {/* animated star burst */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-yellow-100 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-4xl shadow-lg">
            ⭐
          </div>
        </div>

        <div>
          <p className="text-xl font-bold text-gray-900">Points Earned!</p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">
            Great story about{" "}
            <span className="font-semibold text-blue-600">{submittedCity}</span>!
            You've earned travel points for posting about a city in our network.
            Keep exploring to earn more! 🌍
          </p>
        </div>

        <button
          onClick={closeAll}
          className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white text-sm font-bold shadow-md transition active:scale-95"
        >
          Awesome! 🎉
        </button>
      </div>
    );
  }

  if (postResult === "suggest") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-dashed border-blue-300 flex items-center justify-center text-4xl">
          🏙️
        </div>

        <div>
          <p className="text-xl font-bold text-gray-900">Post is live!</p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">
            <span className="font-semibold text-gray-700">{submittedCity}</span> isn't
            in our city network yet — so no points this time. But you can{" "}
            <span className="font-semibold text-blue-600">suggest it from the Admin Page</span>{" "}
            and earn points once it's added! 🗺️
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={() => {
              /* Navigate to admin / suggest page — adjust route as needed */
              window.location.href = "/Admin";
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition active:scale-95"
          >
            Suggest City →
          </button>
          <button
            onClick={closeAll}
            className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     MAIN FORM
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Create a Post</h2>
        <button
          onClick={() => setShowModal(false)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── City search dropdown ─────────────────────────────────────────── */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">
          City
        </label>

        <div className="relative">
          {/* Input */}
          <div className="relative">
            <input
              ref={cityInputRef}
              placeholder={cityLoading ? "Loading cities…" : "Search a city…"}
              value={city}
              onChange={e => handleCityChange(e.target.value)}
              onFocus={() => {
                if (city.trim()) setShowDropdown(true);
              }}
              disabled={cityLoading}
              className="w-full px-3 py-2.5 pr-9 rounded-xl border border-gray-200 bg-gray-50 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                         disabled:opacity-60 transition"
            />
            <ChevronDown
              size={14}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${showDropdown ? "rotate-180" : ""}`}
            />
          </div>

          {/* Dropdown list */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {filteredCities.length > 0 ? (
                filteredCities.map(name => (
                  <button
                    key={name}
                    onMouseDown={() => selectCity(name)}   // mousedown fires before blur
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50
                               hover:text-blue-700 transition first:rounded-t-xl last:rounded-b-xl"
                  >
                    {name}
                  </button>
                ))
              ) : (
                /* City not in DB — shown as a hint, user can still proceed */
                <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <span>🏙️</span>
                  <span>
                    <span className="font-medium text-gray-600">"{city}"</span> isn't in
                    our network yet — you can still post!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subtle in-DB badge below input */}
        {city.trim() && !showDropdown && (
          dbCities.some(c => c.toLowerCase() === city.trim().toLowerCase()) ? (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <span>✓</span> City found — you'll earn points for this post!
            </p>
          ) : (
            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
              <span>ℹ</span> City not in our network — no points, but your post still goes live.
            </p>
          )
        )}
      </div>

      {/* Story */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">
          Story
        </label>
        <textarea
          placeholder="Share your travel experience…"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                     transition resize-none"
        />
      </div>

      {/* Image upload */}
      <div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={e => setImageFile(e.target.files[0])}
          className="hidden"
          id="post-image-input"
        />
        {!imageFile ? (
          <label
            htmlFor="post-image-input"
            className="flex items-center gap-2 text-sm text-gray-500 border border-dashed border-gray-300
                       rounded-xl px-4 py-3 cursor-pointer hover:border-blue-300 hover:text-blue-500
                       hover:bg-blue-50/50 transition"
          >
            <ImagePlus size={16} />
            Attach an image (optional)
          </label>
        ) : (
          <div className="relative">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              className="w-full max-h-48 object-cover rounded-xl border border-gray-200"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full
                         flex items-center justify-center transition"
            >
              <X size={13} color="white" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600
                     hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={submitPost}
          disabled={!city.trim() || !content.trim() || submitting}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Posting…
            </>
          ) : "Post"}
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
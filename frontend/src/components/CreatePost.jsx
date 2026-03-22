import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

function CreatePost({ refreshFeed, setShowModal }) {
  const [city, setCity]           = useState("");
  const [content, setContent]     = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false); // FIX 8: loading state
  const fileInputRef = useRef(null);

  const submitPost = async () => {
    if (!city.trim() || !content.trim()) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append("city", city);
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      await fetch("http://localhost:8000/api/community/create", {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      setCity("");
      setContent("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setShowModal(false);
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Create a Post</h2>
        {/* FIX 6: working cancel/close button inside the form */}
        <button
          onClick={() => setShowModal(false)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* City */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">
          City
        </label>
        <input
          placeholder="e.g. Mumbai, Jaipur..."
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">
          Story
        </label>
        <textarea
          placeholder="Share your travel experience..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition resize-none"
        />
      </div>

      {/* Image upload — custom button */}
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
            className="flex items-center gap-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition"
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
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition"
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
          className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={submitPost}
          disabled={!city.trim() || !content.trim() || submitting}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Posting...
            </>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
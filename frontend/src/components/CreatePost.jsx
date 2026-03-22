import { useState, useRef } from "react";

function CreatePost({ refreshFeed, setShowModal }) {
  const [city, setCity] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const submitPost = async () => {
    const formData = new FormData();

    formData.append("city", city);
    formData.append("content", content);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await fetch("http://localhost:8000/api/community/create", {
      credentials: "include",
      method: "POST",
      body: formData
    });

    setCity("");
    setContent("");
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowModal(false);
    refreshFeed();
  };

  return (
    <div className="backdrop-blur-lg bg-white/80 border border-white/40 shadow-xl rounded-2xl p-6 space-y-5">

      {/* TITLE */}
      <h2 className="text-xl font-semibold text-gray-800">
        Create a Post
      </h2>

      {/* CITY INPUT */}
      <div>
        <label className="text-sm text-gray-600 mb-1 block">City</label>
        <input
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      {/* CONTENT */}
      <div>
        <label className="text-sm text-gray-600 mb-1 block">Story</label>
        <textarea
          placeholder="Share your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
        />
      </div>

      {/* FILE INPUT */}
      <div>
        <label className="text-sm text-gray-600 mb-1 block">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => setImageFile(e.target.files[0])}
          className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white/70 cursor-pointer"
        />
      </div>

      {/* IMAGE PREVIEW */}
      {imageFile && (
        <div className="mt-2">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-full max-h-52 object-cover rounded-xl border border-gray-200"
          />
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 pt-2">

        {/* <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button> */}

        <button
          onClick={submitPost}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition"
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
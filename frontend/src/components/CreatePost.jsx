import { useState } from "react";

function CreatePost() {

  const [city, setCity] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);

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
  };

  return (
    <div className="border p-4 rounded mb-6">

      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <textarea
        placeholder="Share your story..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="border p-2 w-full mb-3"
      />

      <button
        onClick={submitPost}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Post
      </button>

    </div>
  );
}

export default CreatePost;
import React, { useState } from "react";

function CityInfo({ city }) {
  const [info, setInfo] = useState({
    history: "",
    facts: [],
    famousStory: "",
    quizQuestions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/generate_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch city info");
      }

      // Ensure defaults if API returns incomplete data
      setInfo({
        history: data.history || "",
        facts: Array.isArray(data.facts) ? data.facts : [],
        famousStory: data.famousStory || "",
        quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={fetchInfo}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Info"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {info && (
        <div className="mt-4 space-y-6">
          <div>
            <h2 className="text-xl font-bold">History</h2>
            <p>{info.history}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold">Facts</h2>
            <ul className="list-disc ml-5">
              {info.facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold">Famous Story</h2>
            <p>{info.famousStory}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold">Quiz Questions</h2>
            {info.quizQuestions.map((q, i) => (
              <div key={i} className="mb-3">
                <p className="font-semibold">{q.question}</p>
                <ul className="list-disc ml-5">
                  {q.options?.map((opt, j) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
                <p className="text-sm text-green-600">Answer: {q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CityInfo;

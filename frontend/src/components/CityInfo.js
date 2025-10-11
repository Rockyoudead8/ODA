import React, { useEffect, useState } from "react";

function CityInfo({ city }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanations, setShowExplanations] = useState({});

  const generateNewInfo = async () => {
    setLoading(true);
    setFetchError(null);
    setData(null);
    setResult(null);
    setUserAnswers({});

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setFetchError("User not logged in");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/generate_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, force_new: true }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Server failed.");

      setData(result); // correctAnswerIndex already included
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!city) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setFetchError("User not logged in");
      return;
    }

    const cacheKey = `cityInfo_${userId}_${city}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) setData(JSON.parse(cached));
  }, [city]);

  const handleAnswerSelect = (qIndex, optionIndex) => {
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const toggleExplanation = (index) => {
    setShowExplanations(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmitQuiz = async () => {
    if (!data?.quizQuestions || submitting) return;
    const totalQuestions = data.quizQuestions.length;

    if (Object.keys(userAnswers).length < totalQuestions) {
      setFetchError(`Please answer all ${totalQuestions} questions.`);
      setTimeout(() => setFetchError(null), 3000);
      return;
    }

    setSubmitting(true);
    setResult(null);
    setFetchError(null);

    const userAnswersArray = data.quizQuestions.map((_, i) => userAnswers[i]);
    const correctAnswers = data.quizQuestions.map(q => q.correctAnswerIndex);

    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch("http://localhost:8000/api/submit_quiz", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, city, userAnswers: userAnswersArray, correctAnswers }),
      });

      const resultData = await res.json();
      if (!res.ok) throw new Error(resultData.error || "Submission failed");
      setResult(resultData);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-indigo-800">City Insights</h2>
          <p className="text-sm text-gray-500 mt-1"><strong>City:</strong> {city || "Loading..."}</p>
        </div>
        {data && (
          <button
            onClick={generateNewInfo}
            disabled={loading}
            className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate New Info'}
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        {loading && <p className="text-indigo-600 font-medium text-center py-4">Loading...</p>}
        {fetchError && <p className="text-red-600 font-medium text-center py-4">{fetchError}</p>}

        {!loading && !data && !fetchError && (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold text-gray-700">No info available</h3>
            <button
              onClick={generateNewInfo}
              className="mt-4 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              ✨ Generate Info
            </button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b pb-1 mb-2">History & Lore</h3>
              <p className="text-gray-700 text-sm">{data.history}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b pb-1 mb-2">Facts</h3>
              <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
                {data.facts?.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b pb-1 mb-2">Famous Story</h3>
              <p className="text-gray-700 text-sm">{data.famousStory}</p>
            </div>

            {/* Quiz */}
            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b pb-1 mb-3">Quiz</h3>
              <div className="space-y-4">
                {data.quizQuestions.map((q, i) => {
                  const userAnswer = userAnswers[i];
                  const correct = result && q.correctAnswerIndex === userAnswer;

                  return (
                    <div
                      key={i}
                      className={`border p-3 rounded-lg shadow-sm ${
                        result ? (correct ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50") 
                               : userAnswer != null ? "border-pink-300 bg-pink-50" : "border-indigo-200 bg-indigo-50"
                      }`}
                    >
                      <p className="font-semibold text-gray-800 text-sm mb-2">{i + 1}. {q.question}</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {q.options.map((opt, j) => (
                          <div key={j} className="flex items-center">
                            <input
                              type="radio"
                              id={`q${i}o${j}`}
                              name={`q-${i}`}
                              value={j}
                              checked={userAnswer === j}
                              onChange={() => handleAnswerSelect(i, j)}
                              disabled={!!result}
                              className="mr-2 h-3 w-3 text-pink-600 border-gray-300 cursor-pointer focus:ring-pink-500"
                            />
                            <label
                              htmlFor={`q${i}o${j}`}
                              className={`cursor-pointer ${
                                result && j === q.correctAnswerIndex ? "text-green-700 font-medium"
                                : result && userAnswer === j && j !== q.correctAnswerIndex ? "text-red-700 font-medium" : ""
                              }`}
                            >
                              {opt}
                            </label>
                          </div>
                        ))}
                      </div>

                      {result && (
                        <button
                          onClick={() => toggleExplanation(i)}
                          className="text-xs text-blue-600 underline mt-2"
                        >
                          {showExplanations[i] ? "Hide Explanation" : "Show Explanation"}
                        </button>
                      )}
                      {showExplanations[i] && result && (
                        <div className="mt-2 p-2 bg-gray-100 text-gray-700 rounded text-xs">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(userAnswers).length !== data.quizQuestions?.length}
                className={`mt-4 px-4 py-2 text-white rounded-md text-sm transition w-full font-semibold ${
                  submitting || Object.keys(userAnswers).length !== data.quizQuestions?.length
                  ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                }`}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>

              <div className="mt-3 text-center text-sm">
                {result?.error ? (
                  <p className="text-red-600 font-medium">Error: {result.error}</p>
                ) : result?.score !== undefined ? (
                  <p className="text-green-600 font-semibold">
                    ✅ Your Score: {result.score} / {data.quizQuestions.length}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CityInfo;

import React, { useEffect, useState } from "react";

function CityInfo({ city }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanations, setShowExplanations] = useState({});

  useEffect(() => {
    if (!city) return;

    const fetchCityData = async () => {
      setLoading(true);
      setFetchError(null);
      setData(null);
      setResult(null);
      setUserAnswers({});
      setShowExplanations({});

      try {
        const res = await fetch("http://localhost:8000/api/generate_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Server failed to generate info.");
        
        if (!result.quizQuestions || result.quizQuestions.length === 0) {
            throw new Error("Quiz data is incomplete. Please try reloading.");
        }
        
        setData(result);
      } catch (err) {
        console.error("Fetch/Parsing Error:", err.message);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [city]);

  const handleAnswerSelect = (qIndex, option) => {
    setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const toggleExplanation = (index) => {
    setShowExplanations(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmitQuiz = async () => {
    if (!data?.quizQuestions || submitting) return;
    
    const totalQuestions = data.quizQuestions.length;
    if (Object.keys(userAnswers).length < totalQuestions) {
        setFetchError(`Please answer all ${totalQuestions} questions before submitting.`);
        return;
    }
    
    setSubmitting(true);
    setResult(null);
    setFetchError(null);

    const userAnswersArray = data.quizQuestions.map((_, i) => userAnswers[i] || "");
    const correctAnswers = data.quizQuestions.map(q => q.correctAnswer);

    try {
      const userId = localStorage.getItem("userId"); 
      if (!userId) throw new Error("User ID not found in localStorage");

      const res = await fetch("http://localhost:8000/api/submit_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          city,
          userAnswers: userAnswersArray,
          correctAnswers,
        }),
      });

      const resultData = await res.json();
      if (!res.ok) throw new Error(resultData.error || "Submission failed.");

      setResult(resultData);
    } catch (err) {
      console.error("Submission Error:", err.message);
      setResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-indigo-800">City Insights</h2>
        <p className="text-sm text-gray-500 mt-1">
          <strong>City:</strong> {city || "Loading..."}
        </p>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        {loading && <p className="text-indigo-600 font-medium text-center py-4">Loading city info...</p>}
        {fetchError && <p className="text-red-600 font-medium text-center py-4">Error: {fetchError}</p>}

        {data && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-2">History & Lore</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{data.history}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-2">Facts</h3>
              <ul className="list-disc ml-5 space-y-1 text-gray-700 text-sm">
                {data.facts?.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-2">Famous Story</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{data.famousStory}</p>
            </div>

            {/* QUIZ SECTION */}
            <div>
              <h3 className="text-lg font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-3">Quiz</h3>
              <div className="space-y-4">
                {data.quizQuestions?.map((q, i) => {
                  const userAnswer = userAnswers[i];
                  const correct = result && q.correctAnswer === userAnswer;

                  return (
                    <div
                      key={i}
                      className={`border p-3 rounded-lg shadow-sm ${
                        result
                          ? correct
                            ? "border-green-400 bg-green-50"
                            : "border-red-400 bg-red-50"
                          : userAnswer
                          ? "border-pink-300 bg-pink-50"
                          : "border-indigo-200 bg-indigo-50"
                      }`}
                    >
                      <p className="font-semibold text-gray-800 text-sm mb-2">
                        <strong>{i + 1}. {q.question}</strong>
                      </p>

                      <div className="space-y-1 text-xs text-gray-600">
                        {q.options?.map((opt, j) => (
                          <div key={j} className="flex items-center">
                            <input
                              type="radio"
                              id={`q${i}o${j}`}
                              name={`q-${i}`}
                              value={opt}
                              checked={userAnswer === opt}
                              onChange={() => handleAnswerSelect(i, opt)}
                              disabled={!!result} // disable after submit
                              className="mr-2 h-3 w-3 text-pink-600 border-gray-300 cursor-pointer focus:ring-pink-500"
                            />
                            <label
                              htmlFor={`q${i}o${j}`}
                              className={`cursor-pointer ${
                                result && opt === q.correctAnswer
                                  ? "text-green-700 font-medium"
                                  : result && userAnswer === opt && opt !== q.correctAnswer
                                  ? "text-red-700 font-medium"
                                  : ""
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
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
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

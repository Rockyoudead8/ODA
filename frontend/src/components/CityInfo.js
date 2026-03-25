import React, { useEffect, useState } from "react";
import { BACKEND_URL } from '../utils/config';
import {
  Sparkles, BookOpen, Zap, HelpCircle,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";

const SectionLabel = ({ icon: Icon, label, colorClass }) => (
  <div className="flex items-center gap-2.5 mb-3.5">
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass.bg}`}>
      <Icon size={14} className={colorClass.icon} />
    </div>
    <span className={`text-[12px] font-bold uppercase tracking-widest ${colorClass.icon}`}>
      {label}
    </span>
  </div>
);

function CityInfo({ city }) {
  const [data, setData]                         = useState(null);
  const [loading, setLoading]                   = useState(false);
  const [fetchError, setFetchError]             = useState(null);
  const [userAnswers, setUserAnswers]           = useState({});
  const [result, setResult]                     = useState(null);
  const [submitting, setSubmitting]             = useState(false);
  const [showExplanations, setShowExplanations] = useState({});

  const generateNewInfo = async (forceNew = false) => {
    setLoading(true);
    setFetchError(null);
    if (forceNew) {
      setResult(null);
      setUserAnswers({});
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, force_new: forceNew }),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Server failed.");

      const safeData = {
        ...result,
        quiz: result.quiz || [],
        mustDo: result.mustDo || [],
      };

      setData(safeData);
      localStorage.setItem(`cityInfo_${city}`, JSON.stringify(safeData));
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // On mount: load from cache instantly, then auto-refresh from server
  useEffect(() => {
    if (!city) return;
    const cached = localStorage.getItem(`cityInfo_${city}`);
    if (cached) {
      try { setData(JSON.parse(cached)); } catch (e) {}
    }
    // Always fetch fresh on every page load
    generateNewInfo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const handleAnswerSelect = (qIndex, optionIndex) =>
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));

  const toggleExplanation = (index) =>
    setShowExplanations(prev => ({ ...prev, [index]: !prev[index] }));

  const handleSubmitQuiz = async () => {
    if (!data || submitting) return;
    const total = data.quiz.length;
    const allAnsweredCheck = data.quiz.every((_, i) => userAnswers[i] !== undefined);

    if (!allAnsweredCheck) {
      setFetchError(`Please answer all ${total} questions.`);
      setTimeout(() => setFetchError(null), 3000);
      return;
    }

    setSubmitting(true);
    setResult(null);
    setFetchError(null);

    try {
      const payload = {
        city,
        userAnswers: data.quiz.map((_, i) =>
          userAnswers[i] !== undefined ? Number(userAnswers[i]) : null
        ),
        correctAnswers: data.quiz.map(q => Number(q.correctAnswerIndex)),
      };

      const res = await fetch(`${BACKEND_URL}/api/submit_quiz`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const allAnswered = data?.quiz?.every((_, i) => userAnswers[i] !== undefined);
  const submitDisabled = submitting || !allAnswered;

  return (
    <div className="w-full h-full flex flex-col bg-stone-900">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-stone-50 tracking-tight m-0">City Insights</h2>
          <p className="text-xs text-stone-500 mt-0.5 m-0">{city || "Loading…"}</p>
        </div>

        <button
          onClick={() => generateNewInfo(true)}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            loading
              ? "bg-stone-700 border-stone-700 text-stone-500 cursor-not-allowed"
              : "bg-amber-400/10 border-amber-400/40 text-amber-400 hover:bg-amber-400/20"
          }`}
        >
          {loading
            ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
            : <><Sparkles size={13} /> Generate New</>
          }
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        {/* Loading overlay (when no data yet) */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-500">
            <Loader2 size={28} className="animate-spin text-amber-400" />
            <span className="text-sm">Generating city insights…</span>
          </div>
        )}

        {/* Inline loading bar (when refreshing with existing data) */}
        {loading && data && (
          <div className="w-full h-0.5 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400/60 rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        )}

        {/* Error */}
        {fetchError && (
          <div className="px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
            {fetchError}
          </div>
        )}

        {/* Main content */}
        {data && !loading && (
          <>
            {/* History */}
            <section className="bg-[#262220] border border-stone-800 rounded-2xl p-5">
              <SectionLabel
                icon={BookOpen} label="Explore the City"
                colorClass={{ bg: "bg-amber-400/10", icon: "text-amber-400" }}
              />
              <p className="text-sm leading-relaxed text-stone-400 m-0">{data.description}</p>
            </section>

            {/* Must Do */}
            <section className="bg-[#262220] border border-stone-800 rounded-2xl p-5">
              <SectionLabel
                icon={Zap} label="Must To Dos"
                colorClass={{ bg: "bg-sky-400/10", icon: "text-sky-400" }}
              />
              <div className="flex flex-col gap-2">
                {data.mustDo?.map((f, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="mt-[7px] w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <p className="text-sm leading-relaxed text-stone-400 m-0">{f}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quiz */}
            {data.quiz?.length > 0 && (
              <section className="bg-[#262220] border border-stone-800 rounded-2xl p-5">
                <SectionLabel
                  icon={HelpCircle} label="Quiz"
                  colorClass={{ bg: "bg-violet-400/10", icon: "text-violet-400" }}
                />

                <div className="flex flex-col gap-3.5">
                  {data.quiz.map((q, i) => {
                    const userAnswer = userAnswers[i];
                    const isCorrect  = result && q.correctAnswerIndex === userAnswer;
                    const cardClass  = result
                      ? isCorrect ? "border-green-400 bg-green-400/[0.06]" : "border-red-400 bg-red-400/[0.06]"
                      : userAnswer != null ? "border-violet-400 bg-violet-400/[0.06]" : "border-stone-700 bg-[#1a1715]";

                    return (
                      <div key={i} className={`border rounded-xl p-4 transition-all duration-200 ${cardClass}`}>
                        <p className="text-sm font-semibold text-stone-50 mb-2.5 m-0">
                          {i + 1}. {q.question}
                        </p>

                        <div className="flex flex-col gap-1.5">
                          {q.options?.map((opt, j) => {
                            const isSelected      = userAnswer === j;
                            const isRightAnswer   = result && j === q.correctAnswerIndex;
                            const isWrongSelected = result && isSelected && j !== q.correctAnswerIndex;

                            return (
                              <label
                                key={j}
                                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150
                                  ${result ? "cursor-default" : "cursor-pointer"}
                                  ${isRightAnswer   ? "bg-green-400/10" : ""}
                                  ${isWrongSelected ? "bg-red-400/10"   : ""}`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${i}`}
                                  value={j}
                                  checked={isSelected}
                                  onChange={() => handleAnswerSelect(i, j)}
                                  disabled={!!result}
                                  className="accent-violet-400 cursor-pointer"
                                />
                                <span className={`text-sm flex-1
                                  ${isRightAnswer   ? "text-green-400 font-semibold" :
                                    isWrongSelected ? "text-red-400 font-semibold"   :
                                    isSelected      ? "text-stone-50"                : "text-stone-400"}`}>
                                  {opt}
                                </span>
                                {isRightAnswer   && <CheckCircle2 size={13} className="text-green-400 ml-auto" />}
                                {isWrongSelected && <XCircle      size={13} className="text-red-400 ml-auto"   />}
                              </label>
                            );
                          })}
                        </div>

                        {result && (
                          <button
                            onClick={() => toggleExplanation(i)}
                            className="flex items-center gap-1.5 mt-2.5 text-blue-400 text-xs font-semibold bg-transparent border-none cursor-pointer p-0 hover:text-blue-300 transition-colors"
                          >
                            {showExplanations[i] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            {showExplanations[i] ? "Hide" : "Show"} Explanation
                          </button>
                        )}

                        {showExplanations[i] && result && (
                          <div className="mt-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-stone-800 text-xs leading-relaxed text-stone-400">
                            <strong className="text-stone-50">Explanation: </strong>{q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitDisabled}
                  className={`mt-4 w-full py-2.5 rounded-xl border-none text-sm font-bold transition-all duration-200 ${
                    submitDisabled
                      ? "bg-stone-700 text-stone-500 cursor-not-allowed"
                      : "bg-violet-500 text-white cursor-pointer hover:bg-violet-400 shadow-[0_4px_16px_rgba(167,139,250,0.25)]"
                  }`}
                >
                  {submitting ? "Submitting…" : "Submit Quiz"}
                </button>

                {result?.error ? (
                  <p className="mt-3 text-center text-sm text-red-400 font-medium">Error: {result.error}</p>
                ) : result?.score !== undefined ? (
                  <div className="mt-3 px-4 py-3 rounded-xl text-center bg-green-400/10 border border-green-400/20 text-sm font-bold text-green-400">
                    ✅ {result.score} / {data.quiz.length} correct
                  </div>
                ) : null}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CityInfo;
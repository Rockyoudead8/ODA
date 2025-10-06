import React, { useEffect, useState } from "react";

function CityInfo({ city }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return; // Wait until city is provided

    const fetchCityData = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/generate_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        alert("Failed to load city data");
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [city]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Explore City</h2>
      <p className="mb-3"><strong>City:</strong> {city || "Loading..."}</p>

      {loading && <p>Loading city info...</p>}

      {data && (
        <div className="mt-4 space-y-3">
          <h3 className="text-xl font-bold">History:</h3>
          <p>{data.history}</p>

          <h3 className="text-xl font-bold">Facts:</h3>
          <ul className="list-disc ml-5">
            {data.facts.map((f, i) => <li key={i}>{f}</li>)}
          </ul>

          <h3 className="text-xl font-bold">Famous Story:</h3>
          <p>{data.famousStory}</p>

          <h3 className="text-xl font-bold">Quiz:</h3>
          {data.quizQuestions.map((q, i) => (
            <div key={i} className="border p-2 rounded">
              <p><strong>{i + 1}. {q.question}</strong></p>
              {q.options.map((opt, j) => (
                <div key={j}>
                  <input type="radio" id={`${i}-${j}`} name={`q-${i}`} value={opt} />
                  <label htmlFor={`${i}-${j}`}> {opt}</label>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CityInfo;

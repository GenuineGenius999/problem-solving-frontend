import { useState } from "react";
import "./App.css";

function App() {
  const [subject, setSubject] = useState("math");
  const [prompt, setPrompt] = useState("");
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      // const res = await fetch("http://localhost:8080/api/solve", {
      const res = await fetch("https://ce981578767e.ngrok-free.app/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          prompt: prompt.trim() || null,
          image: imageData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError("Error");
      } else {
        setResult(data.result || "");
      }
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <div className="row">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="subject-select"
          >
            <option value="math">Math</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
          </select>
        </div>

        <textarea
          className="prompt-input"
          placeholder="Enter problems here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="row">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {/* Camera capture can be enabled on mobile browsers via capture attr */}
          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
        </div>

        <button className="solve-button" onClick={handleSolve} disabled={loading}>
          {loading ? "..." : "Solve"}
        </button>

        <div className="result-box">
          {error ? error : result}
        </div>
      </div>
    </div>
  );
}

export default App;

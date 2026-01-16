import { useState } from "react";
import "./App.css";

function App() {
  const [subject, setSubject] = useState("math");
  const [prompt, setPrompt] = useState("");
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const parseResult = (raw) => {
    if (!raw) return { formulas: [], steps: [], finals: [] };
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const formulas = [];
    const steps = [];
    const finals = [];

    lines.forEach((line, idx) => {
      if (/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(line)) {
        finals.push(line);
        return;
      }

      if (line.includes("=")) {
        if (formulas.length === 0 && idx < 2) formulas.push(line);
        else steps.push(line);
        return;
      }

      if (idx === lines.length - 1 && /[0-9+\-*/^()√π]/.test(line)) {
        finals.push(line);
        return;
      }

      steps.push(line);
    });

    if (formulas.length === 0 && steps.length > 0) {
      const maybeFormulaIdx = steps.findIndex((s) => /[A-Za-zα-ω]\s*=/.test(s));
      if (maybeFormulaIdx >= 0) {
        formulas.push(steps[maybeFormulaIdx]);
        steps.splice(maybeFormulaIdx, 1);
      }
    }

    return { formulas, steps, finals };
  };

  const handleCopyAnswer = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result).catch(() => {});
  };

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
      const res = await fetch("https://b7e791896cae.ngrok-free.app/api/solve", {
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
          {error ? (
            <div className="result-error">{error}</div>
          ) : result ? (
            (() => {
              const parsed = parseResult(result);
              return (
                <div className="result-content">
                  {parsed.formulas.length > 0 && (
                    <div className="result-section">
                      <div className="result-title">Formulas</div>
                      <pre className="result-pre">{parsed.formulas.join("\n")}</pre>
                    </div>
                  )}

                  {parsed.steps.length > 0 && (
                    <div className="result-section">
                      <div className="result-title">Calculations</div>
                      <pre className="result-pre">{parsed.steps.join("\n")}</pre>
                    </div>
                  )}

                  {parsed.finals.length > 0 && (
                    <div className="result-section result-final">
                      <div className="result-title">Answer</div>
                      <pre className="result-pre">{parsed.finals.join("\n")}</pre>
                    </div>
                  )}

                  <div className="result-actions">
                    <button className="copy-button" onClick={handleCopyAnswer}>
                      Copy Answer
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="result-empty">No result yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

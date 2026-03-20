import { useState } from "react";
import { addPatient } from "../services/api";

export default function AddPatient() {
  // Form field values
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [severity, setSeverity] = useState(5);
  const [symptoms, setSymptoms] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate preview score (same formula as Java backend)
  function calcScore() {
    let score = severity * 5;
    const ageNum = parseInt(age) || 0;
    if (ageNum < 12 || ageNum > 65) score += 3;
    return score;
  }

  // Get severity label for display
  function getSeverityLabel() {
    if (severity >= 8) return { text: "Critical", cls: "badge-danger" };
    if (severity >= 5) return { text: "Moderate", cls: "badge-warning" };
    return { text: "Minor", cls: "badge-success" };
  }

  // Estimate wait time based on score
  function getEstimatedWait() {
    const score = calcScore();
    // Simple estimate: higher score = fewer patients ahead
    if (score >= 45) return "0–5 min";
    if (score >= 35) return "5–15 min";
    if (score >= 25) return "15–30 min";
    return "30–60 min";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    if (!name || !age || !symptoms) {
      setMessage("Please fill in all fields.");
      setIsSuccess(false);
      return;
    }
    if (parseInt(age) < 1 || parseInt(age) > 120) {
      setMessage("Please enter a valid age (1–120).");
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      const res = await addPatient({
        name,
        age: parseInt(age),
        severity,
        symptoms,
      });

      setMessage(
        `✅ ${res.data.name} added to queue! ID: ${res.data.id} | Score: ${res.data.priorityScore}`
      );
      setIsSuccess(true);

      // Reset form
      setName("");
      setAge("");
      setSeverity(5);
      setSymptoms("");
    } catch (err) {
      setMessage("❌ Failed to add patient. Is the backend running?");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  const sevLabel = getSeverityLabel();

  return (
    <div className="page">
      <h2 className="page-title">Add New Patient</h2>

      {message && (
        <div className={`alert-banner ${isSuccess ? "success" : "error"}`}>
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      <div className="form-layout">
        {/* Form */}
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Amal Perera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 45"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Symptoms</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. chest pain"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
          </div>

          {/* Severity Slider */}
          <div className="form-group">
            <label className="form-label">
              Severity Level &nbsp;
              <span className={`badge ${sevLabel.cls}`}>{sevLabel.text}</span>
            </label>
            <div className="severity-row">
              <span className="sev-hint">1 Minor</span>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="severity-slider"
              />
              <span className="sev-hint">10 Critical</span>
            </div>
            {/* Severity dots */}
            <div className="sev-dots">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <div
                  key={n}
                  onClick={() => setSeverity(n)}
                  className={`sev-dot 
                    ${n <= 4 ? "dot-green" : n <= 7 ? "dot-amber" : "dot-red"}
                    ${severity === n ? "dot-active" : ""}
                  `}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary full-width" type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Patient to Queue"}
          </button>
        </form>

        {/* Score Preview Card */}
        <div className="score-preview-card">
          <h3 className="section-title">Priority Score Preview</h3>

          <div className="score-big">{calcScore()}</div>
          <div className="score-sub">Priority Score</div>

          <div className="score-breakdown">
            <div className="score-row">
              <span>Severity × 5</span>
              <span>{severity} × 5 = {severity * 5}</span>
            </div>
            <div className="score-row">
              <span>Age bonus</span>
              <span>
                {(parseInt(age) < 12 || parseInt(age) > 65) && parseInt(age) > 0
                  ? "+3 (vulnerable)"
                  : "+0"}
              </span>
            </div>
            <div className="score-row">
              <span>Wait bonus</span>
              <span>+0 (just arriving)</span>
            </div>
            <div className="score-divider" />
            <div className="score-row total">
              <span>Total Score</span>
              <span>{calcScore()}</span>
            </div>
          </div>

          <div className="wait-estimate">
            <div className="wait-label">Estimated Wait Time</div>
            <div className="wait-value">{getEstimatedWait()}</div>
          </div>

          <div className="severity-desc">
            <div className="sev-desc-title">Severity Guide</div>
            <div className="sev-desc-row"><span className="badge badge-danger">8–10</span> Critical — immediate risk</div>
            <div className="sev-desc-row"><span className="badge badge-warning">5–7</span> Moderate — urgent care</div>
            <div className="sev-desc-row"><span className="badge badge-success">1–4</span> Minor — non-urgent</div>
          </div>
        </div>
      </div>
    </div>
  );
}

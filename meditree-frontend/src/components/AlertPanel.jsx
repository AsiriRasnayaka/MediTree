import { useEffect, useState } from "react";
import { getAlerts } from "../services/api";

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAlerts();
    // Auto-refresh alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const res = await getAlerts();
      setAlerts(res.data);
    } catch (err) {
      setMessage("Could not load alerts. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  // Get how far over the safe limit this patient is
  function getOvertime(patient) {
    const limits = { 10: 0, 9: 10, 8: 10 };
    let limit = 60;
    if (patient.severity === 10) limit = 0;
    else if (patient.severity >= 8) limit = 10;
    else if (patient.severity >= 5) limit = 30;
    return patient.waitMinutes - limit;
  }

  function getSafeLimit(severity) {
    if (severity === 10) return 0;
    if (severity >= 8) return 10;
    if (severity >= 5) return 30;
    return 60;
  }

  function getUrgencyLevel(patient) {
    const overtime = getOvertime(patient);
    if (overtime > 20) return { text: "URGENT", cls: "urgency-critical" };
    if (overtime > 10) return { text: "HIGH", cls: "urgency-high" };
    return { text: "MODERATE", cls: "urgency-moderate" };
  }

  if (loading) return <div className="loading">Checking alerts...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">
          Alert Panel
          {alerts.length > 0 && (
            <span className="alert-count-badge">{alerts.length}</span>
          )}
        </h2>
        <button className="btn-secondary" onClick={loadAlerts}>
          Refresh
        </button>
      </div>

      <p className="page-desc">
        Patients who have waited beyond the safe threshold for their severity level.
        Auto-refreshes every 30 seconds.
      </p>

      {message && (
        <div className="alert-banner error">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      {/* Safe wait limits reference table */}
      <div className="limits-card">
        <div className="limits-title">Safe Wait Time Limits by Severity</div>
        <div className="limits-grid">
          <div className="limit-item critical">
            <span>Severity 10</span><span>Max 0 min</span>
          </div>
          <div className="limit-item high">
            <span>Severity 8–9</span><span>Max 10 min</span>
          </div>
          <div className="limit-item moderate">
            <span>Severity 5–7</span><span>Max 30 min</span>
          </div>
          <div className="limit-item minor">
            <span>Severity 1–4</span><span>Max 60 min</span>
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state success-state">
          ✅ No alerts — all patients are within safe wait limits.
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((patient) => {
            const urgency = getUrgencyLevel(patient);
            const overtime = getOvertime(patient);
            return (
              <div key={patient.id} className="alert-card-full">
                <div className="alert-card-header">
                  <div>
                    <span className="alert-patient-name">{patient.name}</span>
                    <span className="mono" style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                      {patient.id}
                    </span>
                  </div>
                  <span className={`urgency-badge ${urgency.cls}`}>
                    {urgency.text}
                  </span>
                </div>

                <div className="alert-details">
                  <div className="alert-detail-item">
                    <span className="detail-label">Severity</span>
                    <span className="detail-value danger">{patient.severity}/10</span>
                  </div>
                  <div className="alert-detail-item">
                    <span className="detail-label">Waited</span>
                    <span className="detail-value danger">{patient.waitMinutes} min</span>
                  </div>
                  <div className="alert-detail-item">
                    <span className="detail-label">Safe limit</span>
                    <span className="detail-value">{getSafeLimit(patient.severity)} min</span>
                  </div>
                  <div className="alert-detail-item">
                    <span className="detail-label">Overtime</span>
                    <span className="detail-value danger">+{overtime} min</span>
                  </div>
                  <div className="alert-detail-item">
                    <span className="detail-label">Priority Score</span>
                    <span className="detail-value">{patient.priorityScore}</span>
                  </div>
                  <div className="alert-detail-item">
                    <span className="detail-label">Age</span>
                    <span className="detail-value">{patient.age}</span>
                  </div>
                </div>

                <div className="alert-symptoms">
                  Symptoms: {patient.symptoms}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

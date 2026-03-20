import { useEffect, useState } from "react";
import { getQueue, treatNext, updateSeverity } from "../services/api";

export default function QueueView() {
  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  // For updating severity inline
  const [editingId, setEditingId] = useState(null);
  const [newSeverity, setNewSeverity] = useState(5);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    try {
      setLoading(true);
      const res = await getQueue();
      setQueue(res.data);
    } catch (err) {
      setMessage("Could not load queue. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleTreatNext() {
    try {
      const res = await treatNext();
      if (res.data.name) {
        setMessage(`✅ Treated: ${res.data.name} (Score: ${res.data.priorityScore})`);
      } else {
        setMessage("Queue is empty.");
      }
      loadQueue();
    } catch (err) {
      setMessage("Error treating patient.");
    }
  }

  // Novelty Feature 1: Dynamic severity update
  async function handleUpdateSeverity(id) {
    try {
      await updateSeverity(id, newSeverity);
      setMessage(`✅ Severity updated. AVL Tree rebalanced automatically.`);
      setEditingId(null);
      loadQueue(); // reload to show new order
    } catch (err) {
      setMessage("Error updating severity.");
    }
  }

  function getSeverityBadge(severity) {
    if (severity >= 8) return <span className="badge badge-danger">{severity} Critical</span>;
    if (severity >= 5) return <span className="badge badge-warning">{severity} Moderate</span>;
    return <span className="badge badge-success">{severity} Minor</span>;
  }

  if (loading) return <div className="loading">Loading queue...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Patient Queue</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-secondary" onClick={loadQueue}>Refresh</button>
          <button className="btn-primary" onClick={handleTreatNext}>
            Treat Next Patient
          </button>
        </div>
      </div>

      <p className="page-desc">
        Sorted by AVL Tree in-order traversal — highest priority score first.
        Total: <strong>{queue.length} patients</strong>
      </p>

      {message && (
        <div className="alert-banner success">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="empty-state">No patients in queue. Add patients first.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Severity</th>
                <th>Priority Score</th>
                <th>Wait (min)</th>
                <th>Symptoms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((patient, index) => (
                <tr key={patient.id} className={index === 0 ? "top-row" : ""}>
                  <td className="rank">
                    {index === 0 ? "🔴 #1" : `#${index + 1}`}
                  </td>
                  <td className="mono">{patient.id}</td>
                  <td className="patient-name">{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{getSeverityBadge(patient.severity)}</td>
                  <td className="score-cell">{patient.priorityScore}</td>
                  <td>{patient.waitMinutes}</td>
                  <td className="symptoms-cell">{patient.symptoms}</td>
                  <td>
                    {editingId === patient.id ? (
                      // Show inline severity editor
                      <div className="inline-edit">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newSeverity}
                          onChange={(e) => setNewSeverity(parseInt(e.target.value))}
                          className="inline-input"
                        />
                        <button
                          className="btn-small btn-primary"
                          onClick={() => handleUpdateSeverity(patient.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-small btn-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => {
                          setEditingId(patient.id);
                          setNewSeverity(patient.severity);
                        }}
                      >
                        Update Severity
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { getQueue, treatNext, updateSeverity, updatePatientStatus } from "../services/api";

export default function QueueView() {
  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  // For updating severity inline
  const [editingId, setEditingId] = useState(null);
  const [newSeverity, setNewSeverity] = useState(5);
  // For updating status inline
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState("WAITING");

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

  // Update severity
  async function handleUpdateSeverity(id) {
    try {
      await updateSeverity(id, newSeverity);
      setMessage(`✅ Severity updated. AVL Tree rebalanced automatically.`);
      setEditingId(null);
      loadQueue();
    } catch (err) {
      setMessage("Error updating severity.");
    }
  }

  // Update status
  async function handleUpdateStatus(id, status) {
    try {
      await updatePatientStatus(id, status);
      setMessage(`✅ Status updated to ${status}.`);
      setEditingStatusId(null);
      loadQueue();
    } catch (err) {
      setMessage("Error updating status.");
    }
  }

  function getSeverityBadge(severity) {
    if (severity >= 8) return <span className="badge badge-danger">{severity} Critical</span>;
    if (severity >= 5) return <span className="badge badge-warning">{severity} Moderate</span>;
    return <span className="badge badge-success">{severity} Minor</span>;
  }

  function getStatusBadge(status) {
    const statusColors = {
      WAITING: { bg: "#faeeda", color: "#854f0b" },
      IN_TREATMENT: { bg: "#e1f5ee", color: "#0f6e56" },
      DISCHARGED: { bg: "#eaf3de", color: "#3b6d11" },
      REFERRED: { bg: "#fcebeb", color: "#a32d2d" },
    };
    const s = statusColors[status] || statusColors.WAITING;
    return (
      <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
        {status.replace("_", " ")}
      </span>
    );
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
                <th>Status</th>
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
                  <td>
                    {editingStatusId === patient.id ? (
                      <select
                        className="form-input"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{ width: "120px", fontSize: "12px", padding: "4px" }}
                      >
                        <option value="WAITING">Waiting</option>
                        <option value="IN_TREATMENT">In Treatment</option>
                        <option value="DISCHARGED">Discharged</option>
                        <option value="REFERRED">Referred</option>
                      </select>
                    ) : (
                      getStatusBadge(patient.status)
                    )}
                  </td>
                  <td className="score-cell">{patient.priorityScore}</td>
                  <td>{patient.waitMinutes}</td>
                  <td className="symptoms-cell">{patient.symptoms}</td>
                  <td style={{ fontSize: "11px" }}>
                    {editingStatusId === patient.id ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          className="btn-small btn-primary"
                          onClick={() => handleUpdateStatus(patient.id, newStatus)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-small btn-secondary"
                          onClick={() => setEditingStatusId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
                        <button
                          className="btn-small btn-secondary"
                          onClick={() => {
                            setEditingStatusId(patient.id);
                            setNewStatus(patient.status);
                          }}
                        >
                          Status
                        </button>
                        {editingId === patient.id ? (
                          <div className="inline-edit" style={{ minWidth: "120px" }}>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={newSeverity}
                              onChange={(e) => setNewSeverity(parseInt(e.target.value))}
                              className="inline-input"
                              style={{ width: "50px" }}
                            />
                            <button
                              className="btn-small btn-primary"
                              onClick={() => handleUpdateSeverity(patient.id)}
                            >
                              ✓
                            </button>
                            <button
                              className="btn-small btn-secondary"
                              onClick={() => setEditingId(null)}
                            >
                              ✕
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
                            Severity
                          </button>
                        )}
                      </div>
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

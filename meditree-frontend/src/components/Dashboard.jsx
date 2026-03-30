import { useEffect, useState } from "react";
import { getDashboard, getQueue, treatNext } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [nextPatient, setNextPatient] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load dashboard data when page opens
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsRes, queueRes] = await Promise.all([
        getDashboard(),
        getQueue(),
      ]);
      setStats(statsRes.data);
      // Next patient = first in sorted queue (highest priority)
      if (queueRes.data.length > 0) {
        setNextPatient(queueRes.data[0]);
      } else {
        setNextPatient(null);
      }
    } catch (err) {
      setMessage("Could not connect to backend. Is Spring Boot running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleTreatNext() {
    try {
      const res = await treatNext();
      if (res.data.name) {
        setMessage(`✅ ${res.data.name} has been treated and removed from queue.`);
      } else {
        setMessage("No patients in the queue.");
      }
      loadData(); // refresh
    } catch (err) {
      setMessage("Error treating patient.");
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>

      {message && (
        <div className="alert-banner">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Patients</div>
          <div className="stat-value">{stats?.total ?? 0}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Critical</div>
          <div className="stat-value">{stats?.critical ?? 0}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Alerts</div>
          <div className="stat-value">{stats?.alertCount ?? 0}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Avg Wait</div>
          <div className="stat-value">{Math.round(stats?.avgWaitMinutes ?? 0)}m</div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <h3 className="section-title">Severity Breakdown</h3>
      <div className="breakdown-grid">
        <div className="breakdown-card critical">
          <div className="breakdown-label">Critical (8–10)</div>
          <div className="breakdown-num">{stats?.critical ?? 0}</div>
        </div>
        <div className="breakdown-card moderate">
          <div className="breakdown-label">Moderate (5–7)</div>
          <div className="breakdown-num">{stats?.moderate ?? 0}</div>
        </div>
        <div className="breakdown-card minor">
          <div className="breakdown-label">Minor (1–4)</div>
          <div className="breakdown-num">{stats?.minor ?? 0}</div>
        </div>
      </div>

      {/* Status Breakdown (Feature 4 - Advanced Analytics) */}
      <h3 className="section-title">Patient Status Breakdown</h3>
      <div className="breakdown-grid">
        <div className="breakdown-card critical">
          <div className="breakdown-label">In Treatment</div>
          <div className="breakdown-num">{stats?.inTreatment ?? 0}</div>
        </div>
        <div className="breakdown-card moderate">
          <div className="breakdown-label">Waiting</div>
          <div className="breakdown-num">{stats?.waiting ?? 0}</div>
        </div>
        <div className="breakdown-card minor">
          <div className="breakdown-label">Discharged</div>
          <div className="breakdown-num">{stats?.discharged ?? 0}</div>
        </div>
      </div>

      {/* Wait Time Analytics (Feature 4 - Advanced Analytics) */}
      <h3 className="section-title">Wait Time Analysis</h3>
      <div className="breakdown-grid">
        <div className="breakdown-card moderate">
          <div className="breakdown-label">Avg Wait (All)</div>
          <div className="breakdown-num">{Math.round(stats?.avgWaitMinutes ?? 0)}m</div>
        </div>
        <div className="breakdown-card critical">
          <div className="breakdown-label">Avg Wait (Critical)</div>
          <div className="breakdown-num">{Math.round(stats?.avgWaitCritical ?? 0)}m</div>
        </div>
      </div>

      {/* Next Patient */}
      <h3 className="section-title">Next Patient to Treat</h3>
      {nextPatient ? (
        <div className="next-patient-card">
          <div className="next-patient-info">
            <div className="next-patient-name">{nextPatient.name}</div>
            <div className="next-patient-details">
              Severity: <strong>{nextPatient.severity}</strong> &nbsp;·&nbsp;
              Score: <strong>{nextPatient.priorityScore}</strong> &nbsp;·&nbsp;
              Waiting: <strong>{nextPatient.waitMinutes} min</strong> &nbsp;·&nbsp;
              Age: <strong>{nextPatient.age}</strong>
            </div>
            <div className="next-patient-symptoms">
              Symptoms: {nextPatient.symptoms}
            </div>
          </div>
          <button className="btn-primary" onClick={handleTreatNext}>
            Treat Now
          </button>
        </div>
      ) : (
        <div className="empty-state">No patients in queue.</div>
      )}
    </div>
  );
}

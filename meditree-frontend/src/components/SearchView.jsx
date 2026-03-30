import { useState } from "react";
import { searchPatients, filterPatients } from "../services/api";

export default function SearchView() {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // search or filter

  // Search fields
  const [searchQuery, setSearchQuery] = useState("");

  // Filter fields
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [minSeverity, setMinSeverity] = useState(1);
  const [maxSeverity, setMaxSeverity] = useState(10);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setMessage("Please enter a search query");
      return;
    }

    try {
      setLoading(true);
      const res = await searchPatients(searchQuery);
      setResults(res.data);
      setMessage(`Found ${res.data.length} patient(s)`);
    } catch (err) {
      setMessage("Error searching patients");
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const params = {};

      if (filterStatus) params.status = filterStatus;
      if (filterSeverity) params.severity = parseInt(filterSeverity);
      if (minSeverity && maxSeverity) {
        params.minSev = parseInt(minSeverity);
        params.maxSev = parseInt(maxSeverity);
      }

      const res = await filterPatients(params);
      setResults(res.data);
      setMessage(`Found ${res.data.length} patient(s)`);
    } catch (err) {
      setMessage("Error filtering patients");
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    const statusColors = {
      WAITING: { bg: "#faeeda", color: "#854f0b", text: "Waiting" },
      IN_TREATMENT: { bg: "#e1f5ee", color: "#0f6e56", text: "In Treatment" },
      DISCHARGED: { bg: "#eaf3de", color: "#3b6d11", text: "Discharged" },
      REFERRED: { bg: "#fcebeb", color: "#a32d2d", text: "Referred" },
    };
    const s = statusColors[status] || statusColors.WAITING;
    return (
      <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
        {s.text}
      </span>
    );
  }

  function getSeverityBadge(severity) {
    if (severity >= 8) return <span className="badge badge-danger">{severity} Critical</span>;
    if (severity >= 5) return <span className="badge badge-warning">{severity} Moderate</span>;
    return <span className="badge badge-success">{severity} Minor</span>;
  }

  if (loading) return <div className="loading">Searching...</div>;

  return (
    <div className="page">
      <h2 className="page-title">Search & Filter Patients</h2>

      {message && (
        <div className="alert-banner success">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className={`btn-secondary ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
          style={activeTab === "search" ? { background: "#1D9E75", color: "white" } : {}}
        >
          Search by Name/ID
        </button>
        <button
          className={`btn-secondary ${activeTab === "filter" ? "active" : ""}`}
          onClick={() => setActiveTab("filter")}
          style={activeTab === "filter" ? { background: "#1D9E75", color: "white" } : {}}
        >
          Filter by Criteria
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <form className="form-card" onSubmit={handleSearch} style={{ marginBottom: "20px", maxWidth: "400px" }}>
          <div className="form-group">
            <label className="form-label">Search Patient by Name or ID</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. amal or P001"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary full-width" type="submit">
            Search
          </button>
        </form>
      )}

      {/* Filter Tab */}
      {activeTab === "filter" && (
        <form className="form-card" onSubmit={handleFilter} style={{ marginBottom: "20px", maxWidth: "500px" }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="WAITING">Waiting</option>
              <option value="IN_TREATMENT">In Treatment</option>
              <option value="DISCHARGED">Discharged</option>
              <option value="REFERRED">Referred</option>
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Severity Exact Match</label>
              <select
                className="form-input"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="">Any Severity</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Or Severity Range</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="10"
                  value={minSeverity}
                  onChange={(e) => setMinSeverity(e.target.value)}
                  placeholder="Min"
                />
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="10"
                  value={maxSeverity}
                  onChange={(e) => setMaxSeverity(e.target.value)}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          <button className="btn-primary full-width" type="submit">
            Apply Filters
          </button>
        </form>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <div className="empty-state">No patients found. Try a different search.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Wait (min)</th>
                <th>Symptoms</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((patient) => (
                <tr key={patient.id}>
                  <td className="mono">{patient.id}</td>
                  <td className="patient-name">{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{getSeverityBadge(patient.severity)}</td>
                  <td>{getStatusBadge(patient.status)}</td>
                  <td>{patient.waitMinutes}</td>
                  <td className="symptoms-cell">{patient.symptoms}</td>
                  <td className="score-cell">{patient.priorityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

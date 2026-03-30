import { useEffect, useState, useRef } from "react";
import { getTreeStructure } from "../services/api";

export default function AdminPanel() {
  const [tree, setTree] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadTree();
    
    // Auto-refresh tree every 3 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadTree, 3000);
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (tree) {
      drawTree();
    }
  }, [tree]);

  async function loadTree() {
    try {
      const res = await getTreeStructure();
      setTree(res.data);
      if (loading) setLoading(false);
    } catch (err) {
      setMessage("Could not load tree structure");
      if (loading) setLoading(false);
    }
  }

  function drawTree() {
    const canvas = canvasRef.current;
    if (!canvas || !tree) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Object.keys(tree).length === 0) {
      ctx.fillStyle = "#888";
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      ctx.fillText("No patients in queue yet", canvas.width / 2, canvas.height / 2);
      return;
    }

    // Calculate tree dimensions
    const nodeRadius = 35;
    const verticalGap = 80;
    const horizontalGap = 60;

    const treeWidth = calculateTreeWidth(tree, horizontalGap);
    const treeHeight = calculateTreeHeight(tree) * verticalGap + 40;

    // Center the tree on canvas
    const offsetX = Math.max(10, (canvas.width - treeWidth) / 2);
    const offsetY = 20;

    // Draw the tree
    drawNode(ctx, tree, offsetX + treeWidth / 2, offsetY, horizontalGap, verticalGap, nodeRadius);
  }

  function drawNode(ctx, node, x, y, horizontalGap, verticalGap, radius) {
    if (!node) return;

    // Draw lines to children first (so they appear behind nodes)
    if (node.left) {
      const leftWidth = calculateTreeWidth(node.left, horizontalGap);
      const leftX = x - horizontalGap - leftWidth / 2;
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.lineTo(leftX, y + verticalGap - radius);
      ctx.stroke();
      drawNode(ctx, node.left, leftX, y + verticalGap, horizontalGap, verticalGap, radius);
    }

    if (node.right) {
      const rightWidth = calculateTreeWidth(node.right, horizontalGap);
      const rightX = x + horizontalGap + rightWidth / 2;
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.lineTo(rightX, y + verticalGap - radius);
      ctx.stroke();
      drawNode(ctx, node.right, rightX, y + verticalGap, horizontalGap, verticalGap, radius);
    }

    // Draw node circle
    const severity = node.severity;
    let nodeColor;
    if (severity >= 8) {
      nodeColor = "#e24b4a"; // Critical - red
    } else if (severity >= 5) {
      nodeColor = "#ef9f27"; // Moderate - orange
    } else {
      nodeColor = "#1D9E75"; // Minor - green
    }

    ctx.fillStyle = nodeColor;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw text on node
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.score, x, y - 8);
    ctx.font = "10px Arial";
    ctx.fillText(`S:${node.severity}`, x, y + 6);

    // Draw tooltip info
    ctx.fillStyle = "#333";
    ctx.font = "9px Arial";
    ctx.textAlign = "center";
    ctx.fillText(node.id, x, y + radius + 15);
  }

  function calculateTreeWidth(node, horizontalGap) {
    if (!node) return 0;
    const leftWidth = calculateTreeWidth(node.left, horizontalGap);
    const rightWidth = calculateTreeWidth(node.right, horizontalGap);
    return Math.max(70, leftWidth + rightWidth + horizontalGap);
  }

  function calculateTreeHeight(node) {
    if (!node) return -1;  // No children = -1, so parent returns 1 + (-1) = 0
    return 1 + Math.max(calculateTreeHeight(node.left), calculateTreeHeight(node.right));
  }

  if (loading) return <div className="loading">Loading tree visualization...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">AVL Tree Visualization (Admin)</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span style={{ fontSize: "13px" }}>Auto-refresh every 3s</span>
          </label>
          <button className="btn-secondary" onClick={loadTree}>
            Refresh
          </button>
        </div>
      </div>

      <p className="page-desc">
        Visual representation of the AVL Tree structure. Updates automatically when patients are added or their severity is changed.
      </p>

      {message && (
        <div className="alert-banner error">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      {/* Tree Info */}
      {tree && Object.keys(tree).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
          <div className="form-card" style={{ padding: "12px" }}>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Root Patient</div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{tree.name || "N/A"}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>Score: {tree.score}, Severity: {tree.severity}</div>
          </div>
          <div className="form-card" style={{ padding: "12px" }}>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Tree Height</div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{tree.height || 1}</div>
          </div>
          <div className="form-card" style={{ padding: "12px" }}>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Severity Legend</div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <span style={{ width: "12px", height: "12px", background: "#e24b4a", borderRadius: "2px" }}></span>
              <span style={{ fontSize: "10px" }}>Critical</span>
              <span style={{ width: "12px", height: "12px", background: "#ef9f27", borderRadius: "2px" }}></span>
              <span style={{ fontSize: "10px" }}>Moderate</span>
              <span style={{ width: "12px", height: "12px", background: "#1D9E75", borderRadius: "2px" }}></span>
              <span style={{ fontSize: "10px" }}>Minor</span>
            </div>
          </div>
        </div>
      )}

      {/* Canvas for tree visualization */}
      <div style={{ background: "#f9fbf9", borderRadius: "10px", border: "1px solid #e8eaed", padding: "20px", overflowX: "auto" }}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "white",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>

      {/* Legend and instructions */}
      <div style={{ marginTop: "20px", padding: "12px", background: "#f0fdf8", borderRadius: "8px", fontSize: "12px", color: "#0f6e56" }}>
        <strong>How to read the MAX HEAP AVL Tree:</strong>
        <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
          <li><strong>Root node = Highest priority patient</strong> (next to be treated!)</li>
          <li>Left subtree contains patients with higher priority scores</li>
          <li>Right subtree contains patients with lower priority scores</li>
          <li>Each circle represents a patient node</li>
          <li>Number inside = Priority Score (used for queue ordering)</li>
          <li>Color indicates severity: Red (Critical), Orange (Moderate), Green (Minor)</li>
          <li>Patient ID shown below each node</li>
          <li>The tree automatically rebalances when severity is updated while maintaining MAX HEAP property</li>
        </ul>
      </div>
    </div>
  );
}

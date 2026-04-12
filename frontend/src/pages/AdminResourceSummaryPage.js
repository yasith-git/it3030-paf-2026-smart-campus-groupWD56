import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminResourceSummaryPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/resources", {
        withCredentials: true,
      });
      setResources(res.data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
    setLoading(false);
  };

  const total = resources.length;
  const available = resources.filter((r) => r.status === "AVAILABLE").length;
  const booked = resources.filter((r) => r.status === "BOOKED").length;
  const maintenance = resources.filter((r) => r.status === "UNDER_MAINTENANCE").length;

  const typeCounts = {};
  resources.forEach((r) => {
    const type = r.resourceType || "OTHER";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const topCapacity = [...resources]
    .sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
    .slice(0, 3);

  const maxTypeCount = Math.max(...Object.values(typeCounts), 1);

  if (loading) {
    return (
      <div style={styles.loading}>
        <h3>Loading Summary...</h3>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.heroCard}>
          <div>
            <div style={styles.smallLabel}>Admin Insights</div>
            <h1 style={styles.title}>📊 Resource Summary Dashboard</h1>
            <p style={styles.subtitle}>
              Quick operational overview of campus facilities and assets
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={styles.cardGrid}>
          <Card title="Total Resources" value={total} color="#6366f1" icon="📦" />
          <Card title="Available" value={available} color="#38bdf8" icon="🟢" />
          <Card title="Booked" value={booked} color="#ef4444" icon="🔴" />
          <Card title="Maintenance" value={maintenance} color="#f59e0b" icon="🟡" />
        </div>

        {/* MODERN 2-COLUMN SECTION */}
        <div style={styles.twoColumnGrid}>
          {/* Resource Types */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📂 Resource Types</h2>
              <span style={styles.sectionHint}>Distribution</span>
            </div>

            <div style={styles.typeList}>
              {Object.entries(typeCounts).map(([type, count], index) => {
                const percentage = (count / maxTypeCount) * 100;
                const barColors = ["#6366f1", "#38bdf8", "#f59e0b", "#ef4444", "#8b5cf6"];
                return (
                  <div key={type} style={styles.typeItem}>
                    <div style={styles.typeTopRow}>
                      <span style={styles.typeName}>{type}</span>
                      <span style={styles.typeCount}>{count}</span>
                    </div>

                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${barColors[index % barColors.length]}66, ${barColors[index % barColors.length]})`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Capacity */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🏆 Top Capacity Resources</h2>
              <span style={styles.sectionHint}>Top 3</span>
            </div>

            <div style={styles.topList}>
              {topCapacity.length > 0 ? (
                topCapacity.map((r, i) => (
                  <div key={r.resourceId} style={styles.topItem}>
                    <div style={styles.rankBadge}>{i + 1}</div>

                    <div style={styles.topInfo}>
                      <div style={styles.topName}>{r.resourceName}</div>
                      <div style={styles.topMeta}>
                        {r.resourceType} • {r.location}
                      </div>
                    </div>

                    <div style={styles.topCapacityValue}>
                      {r.capacity || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyText}>No resources available</div>
              )}
            </div>
          </div>
        </div>

        {/* ALL RESOURCES TABLE */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📋 All Resources</h2>
            <span style={styles.sectionHint}>{resources.length} items</span>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Capacity</th>
                </tr>
              </thead>

              <tbody>
                {resources.map((r, index) => (
                  <tr
                    key={r.resourceId}
                    style={{
                      ...styles.tr,
                      background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)"
                    }}
                  >
                    <td style={styles.tdName}>
                      <div style={styles.resourceName}>{r.resourceName}</div>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.typeBadge}>{r.resourceType}</span>
                    </td>

                    <td style={styles.td}>
                      {getStatusBadge(r.status)}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.capacityBadge}>{r.capacity || "-"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {resources.length === 0 && (
              <div style={styles.emptyTable}>No resources available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Card = ({ title, value, color, icon }) => (
  <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
    <div style={styles.cardIcon}>{icon}</div>
    <h3 style={styles.cardTitle}>{title}</h3>
    <h1 style={styles.cardValue}>{value}</h1>
  </div>
);

const getStatusBadge = (status) => {
  if (status === "AVAILABLE") {
    return <span style={styles.green}>🟢 Available</span>;
  }
  if (status === "BOOKED") {
    return <span style={styles.red}>🔴 Booked</span>;
  }
  if (status === "UNDER_MAINTENANCE") {
    return <span style={styles.orange}>🟡 Maintenance</span>;
  }
  return <span style={styles.gray}>Unknown</span>;
};

const styles = {
  page: {
    padding: "40px 24px 60px",
    background: "rgba(255,255,255,0.04)",
    minHeight: "100vh"
  },

  wrapper: {
    maxWidth: "1280px",
    margin: "0 auto"
  },

  heroCard: {
    background: "transparent",
    borderRadius: "24px",
    padding: "28px 30px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    marginBottom: "24px",
    border: '1px solid rgba(255,255,255,0.12)',
    marginTop:"100px"
  },

  smallLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#38bdf8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px"
  },

  title: {
    margin: 0,
    fontSize: "42px",
    fontWeight: "800",
    color: "#f0f9ff"
  },

  subtitle: {
    marginTop: "10px",
    color: "rgba(240,249,255,0.55)",
    fontSize: "16px"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
    gap: "20px",
    marginBottom: "24px"
  },

  card: {
    background: 'transparent',
    padding: "22px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
    border: '1px solid rgba(255,255,255,0.12)'
  },

  cardIcon: {
    fontSize: "30px",
    marginBottom: "10px"
  },

  cardTitle: {
    margin: 0,
    fontSize: "13px",
    color: "rgba(240,249,255,0.55)",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  },

  cardValue: {
    marginTop: "10px",
    marginBottom: 0,
    fontSize: "34px",
    fontWeight: "800",
    color: "#f0f9ff"
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
    marginBottom: "24px"
  },

  sectionCard: {
    background: 'transparent',
    padding: "24px",
    borderRadius: "22px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
    border: '1px solid rgba(255,255,255,0.12)'
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    flexWrap: "wrap",
    gap: "10px"
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#f0f9ff",
    fontWeight: "700"
  },

  sectionHint: {
    fontSize: "13px",
    color: "rgba(240,249,255,0.45)",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "600"
  },

  typeList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  typeItem: {
    width: "100%"
  },

  typeTopRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },

  typeName: {
    fontWeight: "700",
    color: "rgba(240,249,255,0.75)",
    fontSize: "14px"
  },

  typeCount: {
    fontSize: "13px",
    color: "rgba(240,249,255,0.45)",
    fontWeight: "600"
  },

  progressTrack: {
    height: "14px",
    background: "rgba(255,255,255,0.07)",
    borderRadius: "999px",
    overflow: "hidden"
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"
  },

  topList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  topItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "16px",
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)'
  },

  rankBadge: {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    background: "rgba(56,189,248,0.12)",
    border: "1px solid rgba(56,189,248,0.25)",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800"
  },

  topInfo: {
    flex: 1
  },

  topName: {
    fontWeight: "700",
    color: "#f0f9ff",
    fontSize: "15px"
  },

  topMeta: {
    marginTop: "4px",
    fontSize: "13px",
    color: "rgba(240,249,255,0.45)"
  },

  topCapacityValue: {
    fontWeight: "800",
    color: "#f59e0b",
    fontSize: "18px",
    minWidth: "40px",
    textAlign: "right"
  },

  tableWrap: {
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px"
  },

  tableHeadRow: {
    background: 'rgba(255,255,255,0.06)'
  },

  th: {
    padding: "16px 18px",
    textAlign: "left",
    color: "rgba(240,249,255,0.55)",
    fontSize: "12px",
    fontWeight: "800",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  },

  tr: {
    transition: "background-color 0.2s ease"
  },

  td: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(240,249,255,0.75)",
    fontSize: "15px"
  },

  tdName: {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)"
  },

  resourceName: {
    fontWeight: "700",
    color: "#f0f9ff"
  },

  typeBadge: {
    background: "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.25)",
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block"
  },

  capacityBadge: {
    background: "rgba(251,191,36,0.12)",
    color: "#fbbf24",
    border: "1px solid rgba(251,191,36,0.25)",
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block"
  },

  green: {
    background: "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.25)",
    padding: "5px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
    display: "inline-block"
  },

  red: {
    background: "rgba(248,113,113,0.12)",
    color: "#fca5a5",
    border: "1px solid rgba(248,113,113,0.25)",
    padding: "5px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
    display: "inline-block"
  },

  orange: {
    background: "rgba(251,191,36,0.12)",
    color: "#fbbf24",
    border: "1px solid rgba(251,191,36,0.25)",
    padding: "5px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
    display: "inline-block"
  },

  gray: {
    background: "rgba(255,255,255,0.07)",
    color: "rgba(240,249,255,0.55)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "5px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
    display: "inline-block"
  },

  emptyTable: {
    textAlign: "center",
    padding: "30px",
    color: "rgba(240,249,255,0.45)",
    fontWeight: "600"
  },

  emptyText: {
    color: "rgba(240,249,255,0.45)",
    padding: "20px 0"
  },

  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: 'rgba(255,255,255,0.06)'
  }
};

export default AdminResourceSummaryPage;
import React, { useEffect, useState } from "react";
import { getAllResources, searchResources } from "../services/resourceService";

const RESOURCE_ICONS = {
  LECTURE_HALL: "🏛️", LAB: "🔬", MEETING_ROOM: "🤝", AUDITORIUM: "🎭",
  LIBRARY: "📚", SPORTS: "⚽", PARKING: "🅿️", CAFETERIA: "🍽️",
  CLASSROOM: "🏫", CONFERENCE_ROOM: "💼", STUDIO: "🎨", GYM: "💪",
  default: "🏢",
};

const ResourceCataloguePage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const [filters, setFilters] = useState({ type: "", location: "", minCapacity: "", status: "" });

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await getAllResources();
      setResources(res.data || []);
    } catch (error) { console.error("Error fetching resources:", error); }
    setLoading(false);
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await searchResources(cleaned);
      setResources(res.data || []);
    } catch (error) { console.error("Search error:", error); }
    setLoading(false);
  };

  const handleReset = () => {
    setFilters({ type: "", location: "", minCapacity: "", status: "" });
    fetchResources();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "AVAILABLE":      return { label: "Available",        color: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.35)",  dot: "#34d399" };
      case "BOOKED":         return { label: "Booked",           color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)", dot: "#f87171" };
      case "UNDER_MAINTENANCE": return { label: "Maintenance",  color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.35)",  dot: "#fbbf24" };
      default:               return { label: status,             color: "#94a3b8", bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.35)", dot: "#94a3b8" };
    }
  };

  const availableCount = resources.filter(r => r.status === "AVAILABLE").length;
  const bookedCount = resources.filter(r => r.status === "BOOKED").length;
  const maintenanceCount = resources.filter(r => r.status === "UNDER_MAINTENANCE").length;

  return (
    <div style={styles.page}>
      <style>{`
        .resource-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .resource-card:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(56,189,248,0.3) !important;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(56,189,248,0.1), inset 0 1px 0 rgba(255,255,255,0.14) !important;
        }
        .filter-input:focus { border-color: rgba(56,189,248,0.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(56,189,248,0.12); }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
      `}</style>

      <div style={styles.wrapper}>
        {/* ===== Hero Header ===== */}
        <div style={styles.heroCard}>
          <div>
            <div style={styles.smallLabel}>Facilities & Assets</div>
            <h1 style={styles.pageTitle}>Resource Catalogue</h1>
            <p style={styles.pageSubtitle}>
              Discover and book campus facilities — lecture halls, labs, meeting rooms, and more.
            </p>
          </div>
          {/* Stats pills */}
          <div style={styles.heroStats}>
            {[
              { count: resources.length, label: "Total", color: "#38bdf8" },
              { count: availableCount, label: "Available", color: "#34d399" },
              { count: bookedCount, label: "Booked", color: "#f87171" },
              { count: maintenanceCount, label: "Maintenance", color: "#fbbf24" },
            ].map((s, i) => (
              <div key={i} style={{ ...styles.statPill, borderColor: s.color + "55" }}>
                <div style={{ ...styles.statNum, color: s.color }}>{s.count}</div>
                <div style={styles.statLbl}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Filter Card ===== */}
        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div>
              <h3 style={styles.filterTitle}>Search & Filter</h3>
              <p style={styles.filterSubtitle}>Narrow down to exactly what you need</p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} style={styles.viewToggle}>
                {viewMode === "grid" ? "☰ List View" : "⊞ Grid View"}
              </button>
              <button onClick={() => setShowFilters(!showFilters)} style={styles.toggleBtn}>
                {showFilters ? "▲ Hide" : "▼ Filters"}
              </button>
            </div>
          </div>

          {showFilters && (
            <>
              <div style={styles.filterGrid}>
                {[
                  { name: "type", placeholder: "🏷️ Resource type", type: "text" },
                  { name: "location", placeholder: "📍 Location / building", type: "text" },
                  { name: "minCapacity", placeholder: "👥 Min capacity", type: "number" },
                ].map(f => (
                  <input key={f.name} name={f.name} placeholder={f.placeholder} type={f.type}
                    value={filters[f.name]} onChange={handleChange}
                    style={styles.input} className="filter-input" />
                ))}
                <select name="status" value={filters.status} onChange={handleChange} style={styles.input} className="filter-input">
                  <option value="">🔘 All Status</option>
                  <option value="AVAILABLE">🟢 Available</option>
                  <option value="BOOKED">🔴 Booked</option>
                  <option value="UNDER_MAINTENANCE">🟡 Under Maintenance</option>
                </select>
              </div>
              <div style={styles.buttonRow}>
                <button onClick={handleSearch} style={styles.searchBtn}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 30px rgba(56,189,248,0.5)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(56,189,248,0.3)"}>
                  🔍 Search Resources
                </button>
                <button onClick={handleReset} style={styles.resetBtn}>↺ Reset</button>
              </div>
            </>
          )}
        </div>

        {/* ===== Summary bar ===== */}
        <div style={styles.summaryRow}>
          <div style={styles.summaryText}>
            Showing <strong style={{ color: "#38bdf8" }}>{resources.length}</strong> resource{resources.length !== 1 ? "s" : ""}
            {loading && <span style={{ color: "#38bdf8", marginLeft: "10px" }}>· Loading…</span>}
          </div>
        </div>

        {/* ===== Resource Cards Grid ===== */}
        {resources.length > 0 ? (
          <div style={viewMode === "grid" ? styles.cardsGrid : styles.cardsList}>
            {resources.map((resource, index) => {
              const st = getStatusConfig(resource.status);
              const typeIcon = RESOURCE_ICONS[resource.resourceType?.toUpperCase()] || RESOURCE_ICONS.default;
              return (
                <div key={resource.resourceId} className="resource-card" style={{
                  ...styles.resourceCard,
                  animationDelay: `${index * 0.04}s`,
                  animation: "fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) both",
                  animationDelay: `${Math.min(index * 0.04, 0.5)}s`,
                }}>
                  {/* Card top accent line */}
                  <div style={{ height: "3px", background: `linear-gradient(90deg, ${st.color}, transparent)`, borderRadius: "0 0 2px 0", marginBottom: "18px" }} />

                  {/* Icon + Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={styles.resourceIcon}>{typeIcon}</div>
                    <span style={{ ...styles.statusBadge, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.dot, display: "inline-block", marginRight: "5px" }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 style={styles.resourceName}>{resource.resourceName}</h3>

                  {/* Type chip */}
                  <div style={styles.typeChip}>{resource.resourceType}</div>

                  {/* Details */}
                  <div style={styles.detailsBlock}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailIcon}>📍</span>
                      <span style={styles.detailText}>{resource.location || "—"}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailIcon}>👥</span>
                      <span style={styles.detailText}>Capacity: <strong style={{ color: "#f0f9ff" }}>{resource.capacity || "—"}</strong></span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailIcon}>#</span>
                      <span style={styles.detailText}>ID: <strong style={{ color: "rgba(240,249,255,0.6)" }}>{resource.resourceId}</strong></span>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  {resource.status === "AVAILABLE" && (
                    <a href="/bookings/new" style={styles.bookBtn}
                      onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#0284c7,#0ea5e9)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#0ea5e9,#38bdf8)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      Book Now →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔭</div>
              <h3 style={styles.emptyTitle}>No resources found</h3>
              <p style={styles.emptyText}>Try adjusting your filters or check back later.</p>
              <button onClick={handleReset} style={styles.searchBtn}>Reset Filters</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "transparent",
    padding: "100px 20px 60px",
    fontFamily: "'Plus Jakarta Sans','Inter',-apple-system,sans-serif",
    position: "relative",
    zIndex: 1,
  },

  wrapper: { maxWidth: "1280px", margin: "0 auto" },

  heroCard: {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(40px) saturate(160%)",
    WebkitBackdropFilter: "blur(40px) saturate(160%)",
    borderRadius: "24px",
    padding: "36px 40px",
    boxShadow: "0 12px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
    marginBottom: "24px",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  smallLabel: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: "#38bdf8",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: "8px",
  },

  pageTitle: {
    margin: 0, fontSize: "2.6rem", fontWeight: "900",
    background: "linear-gradient(140deg, #f0f9ff 20%, #7dd3fc 55%, #38bdf8 85%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
    letterSpacing: "-0.03em", lineHeight: 1,
  },

  pageSubtitle: {
    marginTop: "10px", marginBottom: 0,
    color: "rgba(240,249,255,0.65)", fontSize: "0.95rem", lineHeight: "1.6",
  },

  heroStats: { display: "flex", gap: "12px", flexWrap: "wrap" },

  statPill: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid",
    borderRadius: "14px",
    padding: "12px 18px",
    textAlign: "center",
    minWidth: "80px",
    backdropFilter: "blur(20px)",
  },

  statNum: { fontSize: "1.6rem", fontWeight: "800", lineHeight: 1 },
  statLbl: { fontSize: "0.68rem", color: "rgba(240,249,255,0.55)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "3px" },

  filterCard: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(32px) saturate(140%)",
    WebkitBackdropFilter: "blur(32px) saturate(140%)",
    borderRadius: "20px",
    padding: "24px 28px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.11)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  },

  filterHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "18px" },
  filterTitle: { margin: 0, fontSize: "1.1rem", color: "#f0f9ff", fontWeight: "700" },
  filterSubtitle: { margin: "4px 0 0 0", color: "rgba(240,249,255,0.5)", fontSize: "0.82rem" },

  toggleBtn: {
    background: "rgba(56,189,248,0.1)", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.3)",
    padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer",
    fontSize: "0.8rem", fontFamily: "inherit", transition: "all 0.2s ease",
  },

  viewToggle: {
    background: "rgba(255,255,255,0.08)", color: "rgba(240,249,255,0.8)",
    border: "1px solid rgba(255,255,255,0.14)",
    padding: "8px 16px", borderRadius: "10px", fontWeight: "600", cursor: "pointer",
    fontSize: "0.8rem", fontFamily: "inherit", transition: "all 0.2s ease",
  },

  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "16px" },

  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    color: "#f0f9ff",
    transition: "all 0.2s ease",
  },

  buttonRow: { display: "flex", gap: "10px", flexWrap: "wrap" },

  searchBtn: {
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    color: "white", border: "none",
    padding: "11px 24px", borderRadius: "12px", fontWeight: "700",
    cursor: "pointer", fontSize: "0.875rem", fontFamily: "inherit",
    boxShadow: "0 4px 20px rgba(56,189,248,0.3)",
    transition: "all 0.2s ease",
  },

  resetBtn: {
    background: "rgba(255,255,255,0.08)", color: "rgba(240,249,255,0.75)",
    border: "1px solid rgba(255,255,255,0.14)",
    padding: "11px 20px", borderRadius: "12px", fontWeight: "600",
    cursor: "pointer", fontSize: "0.875rem", fontFamily: "inherit",
    transition: "all 0.2s ease",
  },

  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "8px" },
  summaryText: { color: "rgba(240,249,255,0.65)", fontSize: "0.875rem", fontWeight: "500" },

  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  cardsList: { display: "flex", flexDirection: "column", gap: "14px" },

  resourceCard: {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(32px) saturate(140%)",
    WebkitBackdropFilter: "blur(32px) saturate(140%)",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "20px",
    padding: "0 22px 22px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
  },

  resourceIcon: { fontSize: "2.8rem", lineHeight: 1 },

  statusBadge: {
    display: "inline-flex", alignItems: "center",
    padding: "5px 12px", borderRadius: "999px",
    fontSize: "0.72rem", fontWeight: "700",
    letterSpacing: "0.04em",
  },

  resourceName: {
    margin: "0 0 8px",
    fontSize: "1.05rem", fontWeight: "800",
    color: "#f0f9ff", letterSpacing: "-0.01em",
  },

  typeChip: {
    display: "inline-block",
    background: "rgba(56,189,248,0.1)", color: "#38bdf8",
    border: "1px solid rgba(56,189,248,0.25)",
    padding: "4px 12px", borderRadius: "999px",
    fontSize: "0.72rem", fontWeight: "700",
    letterSpacing: "0.05em", textTransform: "uppercase",
    marginBottom: "14px",
  },

  detailsBlock: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" },

  detailRow: { display: "flex", alignItems: "center", gap: "8px" },

  detailIcon: { fontSize: "0.9rem", width: "20px", flexShrink: 0, textAlign: "center" },

  detailText: { fontSize: "0.82rem", color: "rgba(240,249,255,0.65)", fontWeight: "500" },

  bookBtn: {
    display: "inline-flex", alignItems: "center",
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    color: "#fff", textDecoration: "none",
    padding: "9px 20px", borderRadius: "10px",
    fontSize: "0.8rem", fontWeight: "700",
    boxShadow: "0 4px 16px rgba(56,189,248,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
    transition: "all 0.2s ease", letterSpacing: "0.01em",
  },

  emptyState: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { fontSize: "4rem", marginBottom: "16px" },
  emptyTitle: { margin: 0, fontSize: "1.5rem", color: "#f0f9ff", fontWeight: "700" },
  emptyText: { marginTop: "10px", color: "rgba(240,249,255,0.55)", fontSize: "0.9rem", marginBottom: "24px" },
};

export default ResourceCataloguePage;
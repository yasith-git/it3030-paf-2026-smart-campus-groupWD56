import React, { useEffect, useState } from "react";
import {
  getAllResources,
  createResource,
  updateResource,
  deleteResource
} from "../services/resourceService";

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    resourceName: "",
    resourceType: "",
    location: "",
    capacity: "",
    status: "AVAILABLE"
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await getAllResources();
      setResources(res.data || []);
    } catch (error) {
      console.error("Error loading resources:", error);
      setMessage("Failed to load resources");
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "resourceName":
        if (!value.trim()) return "Resource name is required";
        if (value.trim().length < 3) return "Resource name must be at least 3 characters";
        if (!/^[A-Za-z0-9\s-]+$/.test(value)) {
          return "Only letters, numbers, spaces and - are allowed";
        }
        return "";

      case "resourceType":
        if (!value.trim()) return "Resource type is required";
        if (!["HALL", "LAB", "ROOM", "EQUIPMENT"].includes(value)) {
          return "Please select a valid resource type";
        }
        return "";

      case "location":
        if (!value.trim()) return "Location is required";
        if (value.trim().length < 3) return "Location must be at least 3 characters";
        if (!/^[A-Za-z0-9\s\-/]+$/.test(value)) {
          return "Only letters, numbers, spaces, - and / are allowed";
        }
        return "";

      case "capacity":
        if (value === "" || value === null) return "Capacity is required";
        if (Number(value) <= 0) return "Capacity must be greater than 0";
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      resourceName: validateField("resourceName", formData.resourceName),
      resourceType: validateField("resourceType", formData.resourceType),
      location: validateField("location", formData.location),
      capacity: validateField("capacity", formData.capacity)
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const clearForm = () => {
    setFormData({
      resourceName: "",
      resourceType: "",
      location: "",
      capacity: "",
      status: "AVAILABLE"
    });
    setErrors({});
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!validateForm()) {
      setMessage("Please fix the validation errors before saving");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      ...formData,
      capacity: Number(formData.capacity)
    };

    try {
      if (editingId) {
        await updateResource(editingId, payload);
        setMessage("Resource updated successfully");
      } else {
        await createResource(payload);
        setMessage("Resource created successfully");
      }

      clearForm();
      await fetchResources();
    } catch (error) {
      console.error("Save error:", error);
      const msg = error?.response?.data?.message || error?.response?.data || "Failed to save resource";
      setMessage(typeof msg === "string" ? msg : "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.resourceId);
    setFormData({
      resourceName: resource.resourceName,
      resourceType: resource.resourceType,
      location: resource.location,
      capacity: resource.capacity,
      status: resource.status
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmed) return;

    try {
      await deleteResource(id);
      setMessage("Resource deleted successfully");
      await fetchResources();
    } catch (error) {
      console.error("Delete error:", error);
      const msg = error?.response?.data?.message || error?.response?.data || "Failed to delete resource";
      setMessage(typeof msg === "string" ? msg : "Failed to delete resource");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <span style={badgeGreen}>🟢 Available</span>;
      case "BOOKED":
        return <span style={badgeRed}>🔴 Booked</span>;
      case "UNDER_MAINTENANCE":
        return <span style={badgeYellow}>🟡 Under Maintenance</span>;
      default:
        return <span style={badgeDefault}>{status}</span>;
    }
  };

  const getTypeBadgeStyle = () => {
    return {
      backgroundColor: "#eff6ff",
      color: "#1d4ed8",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "600",
      fontSize: "12px",
      display: "inline-block"
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.heroCard}>
          <div>
            <div style={styles.smallLabel}>Admin Control</div>
            <h1 style={styles.pageTitle}>Resource Management</h1>
            <p style={styles.pageSubtitle}>
              Create, update, and manage campus facilities and assets with a clean and organized admin workspace.
            </p>
          </div>

          <div style={styles.heroStats}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{resources.length}</div>
              <div style={styles.statLabel}>Total Resources</div>
            </div>
          </div>
        </div>

        {message && <div style={styles.messageStyle}>{message}</div>}

        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h3 style={styles.formTitle}>
                {editingId ? "Edit Resource" : "Add New Resource"}
              </h3>
              <p style={styles.formSubtitle}>
                Fill in the resource details and save changes
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.gridStyle}>
              <div>
                <input
                  name="resourceName"
                  placeholder="Resource Name"
                  value={formData.resourceName}
                  onChange={handleChange}
                  style={{
                    ...styles.inputStyle,
                    borderColor: errors.resourceName ? "#ef4444" : "rgba(240,249,255,0.75)"
                  }}
                />
                {errors.resourceName && (
                  <div style={styles.errorText}>{errors.resourceName}</div>
                )}
              </div>

              <div>
                <select
                  name="resourceType"
                  value={formData.resourceType}
                  onChange={handleChange}
                  style={{
                    ...styles.inputStyle,
                    borderColor: errors.resourceType ? "#ef4444" : "rgba(240,249,255,0.75)"
                  }}
                >
                  <option value="">Select Resource Type</option>
                  <option value="HALL">HALL</option>
                  <option value="LAB">LAB</option>
                  <option value="ROOM">ROOM</option>
                  <option value="EQUIPMENT">EQUIPMENT</option>
                </select>
                {errors.resourceType && (
                  <div style={styles.errorText}>{errors.resourceType}</div>
                )}
              </div>

              <div>
                <input
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  style={{
                    ...styles.inputStyle,
                    borderColor: errors.location ? "#ef4444" : "rgba(240,249,255,0.75)"
                  }}
                />
                {errors.location && (
                  <div style={styles.errorText}>{errors.location}</div>
                )}
              </div>

              <div>
                <input
                  type="number"
                  name="capacity"
                  placeholder="Capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  style={{
                    ...styles.inputStyle,
                    borderColor: errors.capacity ? "#ef4444" : "rgba(240,249,255,0.75)"
                  }}
                />
                {errors.capacity && (
                  <div style={styles.errorText}>{errors.capacity}</div>
                )}
              </div>

              <div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.inputStyle}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                </select>
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.saveButtonStyle,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "not-allowed" : "pointer"
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Resource"
                  : "Add Resource"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                style={styles.resetButtonStyle}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h3 style={styles.tableTitle}>All Resources</h3>
              <p style={styles.tableSubtitle}>
                View all resources currently available in the system
              </p>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Capacity</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {resources.length > 0 ? (
                  resources.map((r, index) => (
                    <tr
                      key={r.resourceId}
                      style={{
                        ...styles.tr,
                        background: index % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)"
                      }}
                    >
                      <td style={styles.tdId}>
                        <span style={styles.idBadge}>{r.resourceId}</span>
                      </td>

                      <td style={styles.tdName}>
                        <div style={styles.resourceName}>{r.resourceName}</div>
                      </td>

                      <td style={styles.td}>
                        <span style={getTypeBadgeStyle(r.resourceType)}>
                          {r.resourceType}
                        </span>
                      </td>

                      <td style={styles.td}>{r.location}</td>

                      <td style={styles.td}>
                        <span style={styles.capacityText}>{r.capacity}</span>
                      </td>

                      <td style={styles.td}>{getStatusBadge(r.status)}</td>

                      <td style={styles.td}>
                        <div style={styles.actionRow}>
                          <button
                            type="button"
                            onClick={() => handleEdit(r)}
                            style={styles.editButtonStyle}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(r.resourceId)}
                            style={styles.deleteButtonStyle}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={styles.emptyCell}>
                      No resources available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "rgba(255,255,255,0.04)",
    padding: "32px 20px 60px"
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "24px",
    marginTop: "100px",
    border: '1px solid rgba(255,255,255,0.12)'
  },

  smallLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px"
  },

  pageTitle: {
    margin: 0,
    fontSize: "44px",
    fontWeight: "800",
    color: "#f0f9ff",
    lineHeight: "1.1"
  },

  pageSubtitle: {
    marginTop: "12px",
    marginBottom: 0,
    color: "rgba(240,249,255,0.55)",
    fontSize: "16px",
    lineHeight: "1.6",
    maxWidth: "760px"
  },

  heroStats: {
    display: "flex",
    gap: "16px"
  },

  statCard: {
    minWidth: "160px",
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: "20px",
    padding: "18px 22px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)"
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#f0f9ff"
  },

  statLabel: {
    marginTop: "4px",
    fontSize: "13px",
    color: "rgba(240,249,255,0.55)",
    fontWeight: "600"
  },

  messageStyle: {
    background: "rgba(56,189,248,0.1)",
    color: "#38bdf8",
    padding: "14px 18px",
    borderRadius: "14px",
    marginBottom: "20px",
    fontWeight: "600",
    border: "1px solid rgba(56,189,248,0.25)"
  },

  formCard: {
    background: 'transparent',
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    marginBottom: "24px",
    border: '1px solid rgba(255,255,255,0.12)'
  },

  formHeader: {
    marginBottom: "18px"
  },

  formTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#f0f9ff"
  },

  formSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "rgba(240,249,255,0.55)",
    fontSize: "14px"
  },

  gridStyle: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "18px"
  },

  inputStyle: {
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(240,249,255,0.75)",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: 'transparent',
    color: "#f0f9ff"
  },

  errorText: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#dc2626",
    fontWeight: "600"
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },

  saveButtonStyle: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "14px",
    fontWeight: "700",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)"
  },

  resetButtonStyle: {
    background: "rgba(255,255,255,0.07)",
    color: "rgba(240,249,255,0.75)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "12px 22px",
    borderRadius: "14px",
    fontWeight: "700",
    cursor: "pointer"
  },

  tableCard: {
    background: 'transparent',
    borderRadius: "22px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
    border: '1px solid rgba(255,255,255,0.12)'
  },

  tableHeader: {
    padding: "24px 24px 10px"
  },

  tableTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#f0f9ff"
  },

  tableSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "rgba(240,249,255,0.55)",
    fontSize: "14px"
  },

  tableWrap: {
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px"
  },

  tableHeadRow: {
    background: 'rgba(255,255,255,0.06)'
  },

  th: {
    padding: "18px 20px",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(240,249,255,0.55)",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },

  tr: {
    transition: "background-color 0.2s ease"
  },

  td: {
    padding: "18px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(240,249,255,0.75)",
    fontSize: "15px",
    verticalAlign: "middle"
  },

  tdId: {
    padding: "18px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    verticalAlign: "middle"
  },

  tdName: {
    padding: "18px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    verticalAlign: "middle"
  },

  idBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background: "rgba(56,189,248,0.12)",
    border: "1px solid rgba(56,189,248,0.25)",
    color: "#38bdf8",
    fontWeight: "700",
    fontSize: "12px"
  },

  resourceName: {
    fontWeight: "700",
    color: "#f0f9ff",
    fontSize: "16px"
  },

  capacityText: {
    fontWeight: "700",
    color: "#f0f9ff"
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  editButtonStyle: {
    background: "rgba(56,189,248,0.12)",
    border: "1px solid rgba(56,189,248,0.25)",
    color: "#38bdf8",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px"
  },

  deleteButtonStyle: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700"
  },

  emptyCell: {
    textAlign: "center",
    padding: "32px",
    color: "rgba(240,249,255,0.45)",
    fontWeight: "600"
  }
};

const badgeGreen = {
  background: "rgba(56,189,248,0.12)",
  color: "#38bdf8",
  border: "1px solid rgba(56,189,248,0.25)",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "12px",
  display: "inline-block"
};

const badgeRed = {
  background: "rgba(248,113,113,0.12)",
  color: "#fca5a5",
  border: "1px solid rgba(248,113,113,0.25)",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "12px",
  display: "inline-block"
};

const badgeYellow = {
  background: "rgba(251,191,36,0.12)",
  color: "#fbbf24",
  border: "1px solid rgba(251,191,36,0.25)",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: "700",
  fontSize: "12px",
  display: "inline-block"
};

const badgeDefault = {
  background: "rgba(255,255,255,0.08)",
  color: "rgba(240,249,255,0.65)",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  display: "inline-block"
};

export default AdminResourcesPage;

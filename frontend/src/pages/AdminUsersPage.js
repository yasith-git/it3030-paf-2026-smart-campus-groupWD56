import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "STUDENT",
    provider: "LOCAL",
  });

  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
    role: "STUDENT",
    provider: "LOCAL",
  });

  const editSectionRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (role) params.role = role;

      const res = await axios.get(
        "http://localhost:8080/api/v1/admin/users",
        { params, withCredentials: true }
      );

      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [keyword, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("success");

    try {
      await axios.post(
        "http://localhost:8080/api/v1/admin/users",
        formData,
        { withCredentials: true }
      );

      setMessage("User created successfully");
      setMessageType("success");

      setFormData({
        username: "",
        email: "",
        password: "",
        role: "STUDENT",
        provider: "LOCAL",
      });

      fetchUsers();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data || "Error creating user");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const startEdit = (user) => {
    setEditUserId(user.userId);
    setEditData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      provider: user.provider,
    });
    setMessage("");
    
    setTimeout(() => {
      if (editSectionRef.current) {
        editSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        editSectionRef.current.style.transition = 'all 0.3s ease';
        editSectionRef.current.style.boxShadow = '0 0 0 3px #e0f2fe';
        setTimeout(() => {
          if (editSectionRef.current) {
            editSectionRef.current.style.boxShadow = '';
          }
        }, 1500);
      }
    }, 100);
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("success");

    try {
      await axios.put(
        `http://localhost:8080/api/v1/admin/users/${editUserId}`,
        editData,
        { withCredentials: true }
      );

      setMessage("User updated successfully");
      setMessageType("success");
      setEditUserId(null);
      fetchUsers();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data || "Error updating user");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/v1/admin/users/${id}`,
        { withCredentials: true }
      );

      setMessage("User deleted successfully");
      setMessageType("success");
      fetchUsers();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data || "Error deleting user");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return '#dc2626';
      case 'STAFF': return '#3b82f6';
      case 'TECHNICIAN': return '#38bdf8';
      default: return 'rgba(240,249,255,0.5)';
    }
  };

  return (
    <div className="incident-shell">
      <div className="incident-page">
        {/* Header with Circular User Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' ,padding:'100px'}}>
          <div>
            <h1 className="incident-headline" style={{ fontSize: '3rem' }}>User Management</h1>
            <p className="incident-subtext" style={{ fontSize: '1.5rem' }}>Manage and control all user accounts</p>
          </div>
          
          {/* Circular User Count */}
          <div style={{
            width: '85px',
            height: '85px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(240,249,255,0.55))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f0f9ff' }}>{users.length}</span>
            <span style={{ fontSize: '1rem', color: '#f0f9ff', marginTop: '2px' }}>USERS</span>
          </div>
        </div>

        {/* Add User Card */}
        <div className="incident-card" style={{ marginBottom: '20px',padding:'30px 30px 30px' }}>
          <h2 className="incident-section-title" style={{ fontSize: '1.65rem' }}>Add New User</h2>
          <p className="incident-subtext" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Create a new user account</p>

          <form onSubmit={handleCreateUser}>
            <div className="incident-grid" style={{ marginBottom: '16px' }}>
              <div>
                <label className="incident-label">Username</label>
                <input
                  name="username"
                  placeholder="Enter username"
                  className="incident-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="incident-label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  className="incident-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="incident-label">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  className="incident-input"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="incident-label">Role</label>
                <select
                  name="role"
                  className="incident-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="incident-label">Provider</label>
                <select
                  name="provider"
                  className="incident-select"
                  value={formData.provider}
                  onChange={handleChange}
                >
                  <option value="LOCAL">Local</option>
                  <option value="GOOGLE">Google</option>
                </select>
              </div>
            </div>

            <div className="incident-actions">
              <button type="submit" className="incident-btn-primary">
                Add User
              </button>
            </div>
          </form>
        </div>

        {/* Edit User Card */}
        {editUserId && (
          <div ref={editSectionRef} className="incident-card" style={{ marginBottom: '20px', border: '2px solid #e0f2fe',padding:'30px 30px 30px'  }}>
            <h2 className="incident-section-title" style={{ fontSize: '1.65rem' }}>Edit User</h2>
            <p className="incident-subtext" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Update user information</p>

            <form onSubmit={handleUpdateUser}>
              <div className="incident-grid" style={{ marginBottom: '16px' }}>
                <div>
                  <label className="incident-label">Username</label>
                  <input
                    name="username"
                    placeholder="Username"
                    className="incident-input"
                    value={editData.username}
                    onChange={handleEditChange}
                  />
                </div>

                <div>
                  <label className="incident-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="incident-input"
                    value={editData.email}
                    onChange={handleEditChange}
                  />
                </div>

                <div>
                  <label className="incident-label">New Password (optional)</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="incident-input"
                    value={editData.password}
                    onChange={handleEditChange}
                  />
                </div>

                <div>
                  <label className="incident-label">Role</label>
                  <select
                    name="role"
                    className="incident-select"
                    value={editData.role}
                    onChange={handleEditChange}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="STAFF">Staff</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="incident-label">Provider</label>
                  <select
                    name="provider"
                    className="incident-select"
                    value={editData.provider}
                    onChange={handleEditChange}
                  >
                    <option value="LOCAL">Local</option>
                    <option value="GOOGLE">Google</option>
                  </select>
                </div>
              </div>

              <div className="incident-actions">
                <button type="submit" className="incident-btn-primary">
                  Update User
                </button>
                <button
                  type="button"
                  className="incident-btn-secondary"
                  onClick={() => setEditUserId(null)}
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Card */}
        <div className="incident-card" style={{ marginBottom: '20px' ,padding:'30px 30px 30px' }}>
          <h2 className="incident-section-title" style={{ fontSize: '1.65rem' }}>Search & Filter</h2>
          <p className="incident-subtext" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Find specific users quickly</p>

          <form onSubmit={handleSearch}>
            <div className="incident-grid" style={{ marginBottom: '16px' }}>
              <div>
                <label className="incident-label">Search by name or email</label>
                <input
                  placeholder="Type to search..."
                  className="incident-input"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div>
                <label className="incident-label">Filter by role</label>
                <select
                  className="incident-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="incident-actions" style={{ alignItems: 'flex-end' }}>
                <button type="submit" className="incident-btn-primary">
                  Search
                </button>
                {(keyword || role) && (
                  <button
                    type="button"
                    className="incident-btn-secondary"
                    onClick={() => {
                      setKeyword("");
                      setRole("");
                      fetchUsers();
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Message Toast */}
        {message && (
          <div className="incident-toast" style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#f0f9ff',
            fontSize: '0.875rem',
            fontWeight: '500',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backgroundColor: messageType === 'success' ? '#38bdf8' : '#ef4444'
          }}>
            {messageType === 'success' ? '✓' : '✗'} {message}
          </div>
        )}

        {/* Users Table */}
        <div className="incident-card"style={{padding:'30px 30px 30px' }}>
          <h2 className="incident-section-title" style={{ fontSize: '1.65rem' }}>User List</h2>
          <p className="incident-subtext" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Manage existing users</p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#f0f9ff' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#f0f9ff' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#f0f9ff' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#f0f9ff' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#f0f9ff' }}>Provider</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.8rem', fontWeight: '800', color: '#f0f9ff' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s ease' }}>
                      <td style={{ padding: '12px', fontSize: '0.875rem', color: 'rgba(240,249,255,0.5)' }}>
                        <span style={{ fontWeight: '500' }}>#{u.userId}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.875rem', color: '#f0f9ff', fontWeight: '500' }}>
                        {u.username}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.875rem', color: 'rgba(240,249,255,0.7)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.875rem' }}>
                        <span style={{ 
                          fontWeight: '600',
                          color: getRoleColor(u.role)
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.875rem', color: 'rgba(240,249,255,0.7)' }}>
                        {u.provider}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          className="incident-btn-secondary"
                          onClick={() => startEdit(u)}
                          style={{ marginRight: '8px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}
                        >
                          Edit
                        </button>
                        <button
                          className="incident-btn-secondary"
                          onClick={() => handleDeleteUser(u.userId)}
                          style={{ background: 'rgba(248,113,113,0.1)', color: '#fca5a5', borderColor: 'rgba(248,113,113,0.3)' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'rgba(240,249,255,0.55)' }}>
                      No users found
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
}

export default AdminUsersPage;

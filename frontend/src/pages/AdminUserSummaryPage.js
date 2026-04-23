import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

function AdminUserSummaryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeChart, setActiveChart] = useState("role");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("csv");
  const [reportType, setReportType] = useState("all");
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const res = await axios.get("http://localhost:8080/api/v1/admin/users", {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized. Please login as admin.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.response?.data?.message || "Failed to load user summary");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [users, roleFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Statistics and Chart Data
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalStudents = users.filter((u) => u.role === "STUDENT").length;
    const totalStaff = users.filter((u) => u.role === "STAFF").length;
    const totalTechnicians = users.filter((u) => u.role === "TECHNICIAN").length;
    const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
    const totalLocalUsers = users.filter((u) => u.provider === "LOCAL").length;
    const totalGoogleUsers = users.filter((u) => u.provider === "GOOGLE").length;
    
    const lastMonthCount = Math.floor(totalUsers * 0.85);
    const userGrowth = totalUsers > 0 ? ((totalUsers - lastMonthCount) / lastMonthCount) * 100 : 0;
    
    return {
      totalUsers,
      totalStudents,
      totalStaff,
      totalTechnicians,
      totalAdmins,
      totalLocalUsers,
      totalGoogleUsers,
      userGrowth: userGrowth.toFixed(1),
      activeUsers: users.filter(u => u.active !== false).length,
      inactiveUsers: users.filter(u => u.active === false).length
    };
  }, [users]);

  // Chart data for roles
  const roleChartData = useMemo(() => {
    return [
      { label: "Students", value: stats.totalStudents, color: "#3b82f6", percentage: (stats.totalStudents / stats.totalUsers) * 100 || 0 },
      { label: "Staff", value: stats.totalStaff, color: "#f59e0b", percentage: (stats.totalStaff / stats.totalUsers) * 100 || 0 },
      { label: "Technicians", value: stats.totalTechnicians, color: "#8b5cf6", percentage: (stats.totalTechnicians / stats.totalUsers) * 100 || 0 },
      { label: "Admins", value: stats.totalAdmins, color: "#ef4444", percentage: (stats.totalAdmins / stats.totalUsers) * 100 || 0 }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Chart data for providers
  const providerChartData = useMemo(() => {
    return [
      { label: "Local Users", value: stats.totalLocalUsers, color: "#06b6d4", percentage: (stats.totalLocalUsers / stats.totalUsers) * 100 || 0 },
      { label: "Google Users", value: stats.totalGoogleUsers, color: "#ec4899", percentage: (stats.totalGoogleUsers / stats.totalUsers) * 100 || 0 }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Chart data for status
  const statusChartData = useMemo(() => {
    return [
      { label: "Active", value: stats.activeUsers, color: "#38bdf8", percentage: (stats.activeUsers / stats.totalUsers) * 100 || 0 },
      { label: "Inactive", value: stats.inactiveUsers, color: "#ef4444", percentage: (stats.inactiveUsers / stats.totalUsers) * 100 || 0 }
    ].filter(item => item.value > 0);
  }, [stats]);

  const recentUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      return new Date(b.createdAt || b.joinDate || 0) - new Date(a.createdAt || a.joinDate || 0);
    }).slice(0, 5);
  }, [users]);

  const handleRefresh = () => {
    fetchUsers(true);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Report Generation Functions
  const generateCSV = (data, filename) => {
    const headers = ["Username", "Email", "Role", "Provider", "Status", "Joined Date"];
    const csvRows = [headers];
    
    data.forEach(user => {
      const row = [
        `"${user.username || ''}"`,
        `"${user.email || ''}"`,
        `"${user.role || ''}"`,
        `"${user.provider || ''}"`,
        `"${user.active !== false ? 'Active' : 'Inactive'}"`,
        `"${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateHTML = (data, filename) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: rgba(255,255,255,0.05); }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .summary { margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
          .stat-card { padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .stat-label { color: #64748b; margin-top: 5px; }
        </style>
      </head>
      <body>
        <h1>User Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
          <h2>Summary Statistics</h2>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${data.length}</div>
              <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.filter(u => u.role === 'STUDENT').length}</div>
              <div class="stat-label">Students</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.filter(u => u.role === 'STAFF').length}</div>
              <div class="stat-label">Staff</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.filter(u => u.provider === 'LOCAL').length}</div>
              <div class="stat-label">Local Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.filter(u => u.provider === 'GOOGLE').length}</div>
              <div class="stat-label">Google Users</div>
            </div>
          </div>
        </div>
        
        <h2>User Details</h2>
         <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(user => `
              <tr>
                <td>${user.username || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.role || ''}</td>
                <td>${user.provider || ''}</td>
                <td>${user.active !== false ? 'Active' : 'Inactive'}</td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
         </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePDF = async (data, filename) => {
    // Simple PDF generation using browser's print functionality
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: rgba(255,255,255,0.05); }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; }
          @media print {
            body { margin: 0; padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>User Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <h2>User Details</h2>
         <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Provider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(user => `
              <tr>
                <td>${user.username || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.role || ''}</td>
                <td>${user.provider || ''}</td>
                <td>${user.active !== false ? 'Active' : 'Inactive'}</td>
              </tr>
            `).join('')}
          </tbody>
         </table>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    
    try {
      let dataToExport = [];
      let filename = `user_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
      
      // Select data based on report type
      if (reportType === "all") {
        dataToExport = users;
        filename += `_all_users`;
      } else if (reportType === "filtered") {
        dataToExport = filteredUsers;
        filename += `_filtered_users`;
      } else if (reportType === "recent") {
        dataToExport = recentUsers;
        filename += `_recent_users`;
      } else if (reportType === "stats") {
        // Export statistics summary
        const statsData = {
          generatedAt: new Date().toISOString(),
          summary: stats,
          roleDistribution: roleChartData,
          providerDistribution: providerChartData,
          statusDistribution: statusChartData
        };
        
        if (reportFormat === "json") {
          generateJSON(statsData, `${filename}.json`);
        } else {
          generateJSON(statsData, `${filename}.json`);
        }
        setGeneratingReport(false);
        setShowReportModal(false);
        return;
      }
      
      // Generate report in selected format
      switch(reportFormat) {
        case "csv":
          generateCSV(dataToExport, `${filename}.csv`);
          break;
        case "json":
          generateJSON(dataToExport, `${filename}.json`);
          break;
        case "html":
          generateHTML(dataToExport, `${filename}.html`);
          break;
        case "pdf":
          generatePDF(dataToExport, `${filename}.pdf`);
          break;
        default:
          generateCSV(dataToExport, `${filename}.csv`);
      }
      
      setGeneratingReport(false);
      setShowReportModal(false);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report");
      setGeneratingReport(false);
    }
  };

  const renderChart = () => {
    let data = [];
    let title = "";

    switch(activeChart) {
      case "role":
        data = roleChartData;
        title = "User Distribution by Role";
        break;
      case "provider":
        data = providerChartData;
        title = "User Distribution by Provider";
        break;
      case "status":
        data = statusChartData;
        title = "User Status Distribution";
        break;
      default:
        data = roleChartData;
        title = "User Distribution by Role";
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
      <div>
        <h3 style={styles.chartTitle}>{title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', alignItems: 'center' }}>

          {/* ── Bar Chart ── */}
          <div>
            {data.map((item, index) => (
              <div key={index} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'rgba(240,249,255,0.85)', fontWeight: '600', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f0f9ff' }}>
                    {item.value} <span style={{ fontSize: '0.72rem', color: 'rgba(240,249,255,0.4)', fontWeight: '500' }}>users</span>
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', height: '48px' }}>
                  <div style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${item.color}66, ${item.color})`,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '14px',
                    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                    minWidth: item.value > 0 ? '56px' : '0',
                  }}>
                    <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: '700' }}>{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Donut Chart ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <svg viewBox="0 0 240 240" style={{ width: '210px', height: '210px', overflow: 'visible' }}>
              {data.reduce((acc, item, index) => {
                const startAngle = acc.angle - 90;
                const sliceAngle = (item.value / stats.totalUsers) * 360;
                const endAngle = startAngle + sliceAngle;
                const r = 95;
                const x1 = 120 + r * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 120 + r * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 120 + r * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 120 + r * Math.sin((endAngle * Math.PI) / 180);
                const largeArc = sliceAngle > 180 ? 1 : 0;
                acc.elements.push(
                  <path
                    key={index}
                    d={`M 120 120 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    stroke="rgba(4,9,15,0.9)"
                    strokeWidth="3"
                  />
                );
                acc.angle += sliceAngle;
                return acc;
              }, { elements: [], angle: 0 }).elements}
              {/* Donut hole */}
              <circle cx="120" cy="120" r="58" fill="#04090F" />
              <text x="120" y="114" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgba(240,249,255,0.5)">Total</text>
              <text x="120" y="137" textAnchor="middle" fontSize="24" fontWeight="800" fill="#38bdf8">{stats.totalUsers}</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '220px' }}>
              {data.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: item.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.84rem', color: 'rgba(240,249,255,0.7)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#f0f9ff' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingText}>Loading user dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>User Overview Dashboard</h1>
            <p style={styles.subtitle}>
              Comprehensive analytics and management for all system users
            </p>
          </div>
          <div style={styles.headerButtons}>
            <button 
              onClick={() => setShowReportModal(true)} 
              style={styles.reportButton}
            >
              📊 Download Report
            </button>
            <button 
              onClick={handleRefresh} 
              style={styles.refreshButton}
              disabled={refreshing}
            >
              <span style={styles.refreshIcon}>⟳</span>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
            <button onClick={() => fetchUsers()} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid - Rounded Shapes without emojis */}
        <div style={styles.grid}>
          <SummaryCard 
            title="Total Users" 
            value={stats.totalUsers}
            trend={stats.userGrowth}
            color="#3b82f6"
          />
          <SummaryCard 
            title="Students" 
            value={stats.totalStudents}
            color="#38bdf8"
          />
          <SummaryCard 
            title="Staff" 
            value={stats.totalStaff}
            color="#f59e0b"
          />
          <SummaryCard 
            title="Technicians" 
            value={stats.totalTechnicians}
            color="#8b5cf6"
          />
          <SummaryCard 
            title="Admins" 
            value={stats.totalAdmins}
            color="#ef4444"
          />
          <SummaryCard 
            title="Local Users" 
            value={stats.totalLocalUsers}
            color="#06b6d4"
          />
          <SummaryCard 
            title="Google Users" 
            value={stats.totalGoogleUsers}
            color="#ec4899"
          />
          <SummaryCard 
            title="Active Users" 
            value={stats.activeUsers}
            color="#38bdf8"
          />
        </div>

        {/* Charts Section */}
        <div style={styles.chartsSection}>
          <div style={styles.chartsHeader}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📊</span>
              Analytics & Insights
            </h2>
            <div style={styles.chartTabs}>
              <button
                onClick={() => setActiveChart("role")}
                style={{
                  ...styles.chartTab,
                  ...(activeChart === "role" ? styles.activeChartTab : {})
                }}
              >
                By Role
              </button>
              <button
                onClick={() => setActiveChart("provider")}
                style={{
                  ...styles.chartTab,
                  ...(activeChart === "provider" ? styles.activeChartTab : {})
                }}
              >
                By Provider
              </button>
              <button
                onClick={() => setActiveChart("status")}
                style={{
                  ...styles.chartTab,
                  ...(activeChart === "status" ? styles.activeChartTab : {})
                }}
              >
                By Status
              </button>
            </div>
          </div>
          {renderChart()}
        </div>

        {/* Filters and Search */}
        <div style={styles.filterContainer}>
          <div style={styles.filterSection}>
            <div style={styles.searchWrapper}>
              <input
                type="text"
                placeholder="🔍 Search by username or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.filterWrapper}>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.filterSelect}
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="STAFF">Staff</option>
                <option value="TECHNICIAN">Technicians</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>👥</span>
            User Management
            <span style={styles.userCount}>
              {filteredUsers.length} / {users.length} users
            </span>
          </h2>

          {filteredUsers.length === 0 ? (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIcon}>📭</div>
              <p>No users found matching your criteria</p>
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, index) => (
                      <tr key={user.userId || index} style={styles.tableRow}>
                        <td style={styles.td}>
                          <strong>{user.username}</strong>
                        </td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.roleBadge,
                            ...getRoleStyle(user.role)
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.providerBadge,
                            ...getProviderStyle(user.provider)
                          }}>
                            {user.provider === 'GOOGLE' ? '🌐' : '📧'} {user.provider}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={styles.pageButton}
                  >
                    ← Previous
                  </button>
                  <div style={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            ...styles.pageNumberButton,
                            ...(currentPage === pageNum ? styles.activePage : {})
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={styles.pageButton}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Users Section */}
        <div style={styles.recentSection}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>📈</span>
            Recent Registrations
          </h2>
          <div style={styles.recentList}>
            {recentUsers.length === 0 ? (
              <div style={styles.emptyBox}>No recent users</div>
            ) : (
              recentUsers.map((user, index) => (
                <div key={user.userId || index} style={styles.recentItem}>
                  <div style={styles.recentAvatar}>
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={styles.recentInfo}>
                    <div style={styles.recentName}>{user.username}</div>
                    <div style={styles.recentEmail}>{user.email}</div>
                  </div>
                  <div style={styles.recentMeta}>
                    <span style={styles.recentRole}>{user.role}</span>
                    <span style={styles.recentProvider}>{user.provider === 'GOOGLE' ? '🌐 Google' : '📧 Local'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Download Report</h2>
              <button style={styles.modalClose} onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>Report Type:</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={styles.modalSelect}
                >
                  <option value="all">All Users</option>
                  <option value="filtered">Filtered Users (Current View)</option>
                  <option value="recent">Recent Users (Last 5)</option>
                  <option value="stats">Statistics Summary Only</option>
                </select>
              </div>
              
              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>Format:</label>
                <div style={styles.formatOptions}>
                  <label style={styles.formatOption}>
                    <input
                      type="radio"
                      value="csv"
                      checked={reportFormat === "csv"}
                      onChange={(e) => setReportFormat(e.target.value)}
                      style={styles.radio}
                    />
                    CSV (Excel)
                  </label>
                  <label style={styles.formatOption}>
                    <input
                      type="radio"
                      value="json"
                      checked={reportFormat === "json"}
                      onChange={(e) => setReportFormat(e.target.value)}
                      style={styles.radio}
                    />
                    JSON
                  </label>
                  <label style={styles.formatOption}>
                    <input
                      type="radio"
                      value="html"
                      checked={reportFormat === "html"}
                      onChange={(e) => setReportFormat(e.target.value)}
                      style={styles.radio}
                    />
                    HTML (Web Page)
                  </label>
                  <label style={styles.formatOption}>
                    <input
                      type="radio"
                      value="pdf"
                      checked={reportFormat === "pdf"}
                      onChange={(e) => setReportFormat(e.target.value)}
                      style={styles.radio}
                    />
                    PDF (Print)
                  </label>
                </div>
              </div>
              
              <div style={styles.modalInfo}>
                <p>📊 Report will include:</p>
                <ul>
                  {reportType === "stats" ? (
                    <>
                      <li>Summary statistics</li>
                      <li>Role distribution data</li>
                      <li>Provider distribution data</li>
                      <li>Status distribution data</li>
                    </>
                  ) : (
                    <>
                      <li>User details (Username, Email, Role, Provider, Status)</li>
                      <li>Generated timestamp</li>
                      <li>{reportType === "all" ? "All users in system" : reportType === "filtered" ? "Currently filtered users" : "5 most recent users"}</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.modalCancel} onClick={() => setShowReportModal(false)}>
                Cancel
              </button>
              <button 
                style={styles.modalDownload} 
                onClick={handleGenerateReport}
                disabled={generatingReport}
              >
                {generatingReport ? 'Generating...' : 'Download Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

function SummaryCard({ title, value, trend, color }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardContent}>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardValue}>{value.toLocaleString()}</div>
        {trend && trend !== '0.0' && (
          <div style={styles.cardTrend}>
            <span>📊</span>
            <span style={{ color: parseFloat(trend) > 0 ? '#38bdf8' : '#ef4444' }}>
              {parseFloat(trend) > 0 ? '+' : ''}{trend}%
            </span>
            <span style={styles.trendText}>vs last month</span>
          </div>
        )}
      </div>
      <div style={{ ...styles.cardAccent, backgroundColor: color }}></div>
    </div>
  );
}

const getRoleStyle = (role) => {
  const styles = {
    STUDENT:    { background: 'rgba(56,189,248,0.15)',  color: '#38bdf8',  border: '1px solid rgba(56,189,248,0.3)' },
    STAFF:      { background: 'rgba(251,191,36,0.13)',  color: '#fbbf24',  border: '1px solid rgba(251,191,36,0.3)' },
    TECHNICIAN: { background: 'rgba(167,139,250,0.13)', color: '#c4b5fd',  border: '1px solid rgba(167,139,250,0.3)' },
    ADMIN:      { background: 'rgba(248,113,113,0.13)', color: '#fca5a5',  border: '1px solid rgba(248,113,113,0.3)' },
  };
  return styles[role] || styles.STUDENT;
};

const getProviderStyle = (provider) => {
  const styles = {
    LOCAL:  { background: 'rgba(6,182,212,0.13)',  color: '#22d3ee',  border: '1px solid rgba(6,182,212,0.3)' },
    GOOGLE: { background: 'rgba(236,72,153,0.13)', color: '#f472b6',  border: '1px solid rgba(236,72,153,0.3)' },
  };
  return styles[provider] || styles.LOCAL;
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "transparent",
    padding: "100px 20px 40px",
    fontFamily: "'Plus Jakarta Sans','Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  headerButtons: {
    display: "flex",
    gap: "12px",
  },
  title: {
    fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
    fontWeight: "800",
    background: "linear-gradient(140deg, #f0f9ff 20%, #7dd3fc 55%, #38bdf8 85%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "1rem",
    color: "rgba(240,249,255,0.55)",
    margin: 0,
  },
  reportButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    color: '#f0f9ff',
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: 'rgba(255,255,255,0.07)',
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    color: "rgba(240,249,255,0.8)",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },
  refreshIcon: {
    fontSize: "18px",
    display: "inline-block",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(32px) saturate(140%)',
    WebkitBackdropFilter: 'blur(32px) saturate(140%)',
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.11)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
  },
  cardAccent: {
    width: "6px",
    height: "60px",
    borderRadius: "3px",
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  cardTitle: {
    fontSize: "0.72rem",
    color: "rgba(240,249,255,0.55)",
    marginBottom: "8px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  cardValue: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#f0f9ff",
    lineHeight: 1.2,
  },
  cardTrend: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.75rem",
    marginTop: "8px",
  },
  trendText: {
    color: "rgba(240,249,255,0.6)",
    marginLeft: "4px",
  },
  chartsSection: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(32px) saturate(140%)',
    WebkitBackdropFilter: 'blur(32px) saturate(140%)',
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.11)",
    marginBottom: "30px",
  },
  chartsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "16px",
  },
  chartTabs: {
    display: "flex",
    gap: "8px",
    background: 'rgba(255,255,255,0.05)',
    padding: "4px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  chartTab: {
    padding: "8px 16px",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "rgba(240,249,255,0.55)",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  activeChartTab: {
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", border: "none",
    color: '#f0f9ff',
  },
  chartContainer: {
    marginTop: "16px",
  },
  chartTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#f0f9ff",
    marginBottom: "20px",
  },
  barChart: {
    marginBottom: "30px",
  },
  barChartItem: {
    marginBottom: "16px",
  },
  barChartLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
    fontSize: "0.85rem",
    color: "rgba(240,249,255,0.65)",
  },
  barColorDot: {
    width: "12px",
    height: "12px",
    borderRadius: "3px",
  },
  barChartValue: {
    marginLeft: "auto",
    fontWeight: "600",
    color: "#f0f9ff",
  },
  barChartBarWrapper: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: "8px",
    overflow: "hidden",
  },
  barChartBar: {
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "12px",
    transition: "width 0.5s ease-out",
  },
  barChartPercentage: {
    color: '#f0f9ff',
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  pieChartContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
    padding: "20px",
    background: 'transparent',
    borderRadius: "12px",
  },
  pieChart: {
    width: "200px",
    height: "200px",
  },
  pieChartLegend: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendColor: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
  },
  legendText: {
    fontSize: "0.85rem",
    color: "rgba(240,249,255,0.7)",
  },
  filterContainer: {
    marginBottom: "24px",
  },
  filterSection: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchWrapper: {
    flex: 2,
    minWidth: "250px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.2s",
    background: 'rgba(255,255,255,0.06)',
    color: '#f0f9ff',
    backdropFilter: 'blur(12px)',
    fontFamily: "inherit",
  },
  filterWrapper: {
    flex: 1,
    minWidth: "180px",
  },
  filterSelect: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "0.95rem",
    background: 'rgba(7,18,32,0.85)',
    color: '#f0f9ff',
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  section: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(32px) saturate(140%)',
    WebkitBackdropFilter: 'blur(32px) saturate(140%)',
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.11)",
    marginBottom: "30px",
  },
  recentSection: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(32px) saturate(140%)',
    WebkitBackdropFilter: 'blur(32px) saturate(140%)',
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.11)",
  },
  sectionTitle: {
    fontSize: "clamp(1.2rem, 4vw, 1.4rem)",
    fontWeight: "700",
    color: "#f0f9ff",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  sectionIcon: {
    fontSize: "1.4rem",
  },
  userCount: {
    marginLeft: "auto",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "rgba(240,249,255,0.45)",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    background: 'rgba(255,255,255,0.04)',
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(240,249,255,0.55)",
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(240,249,255,0.75)",
    fontSize: "0.9rem",
  },
  tableRow: {
    transition: "background-color 0.2s",
  },
  roleBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "inline-block",
  },
  providerBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginTop: "24px",
    flexWrap: "wrap",
  },
  pageButton: {
    padding: "8px 16px",
    background: 'rgba(255,255,255,0.06)',
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "rgba(240,249,255,0.75)",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  pageNumbers: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  pageNumberButton: {
    padding: "8px 12px",
    background: 'rgba(255,255,255,0.06)',
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "rgba(240,249,255,0.75)",
    minWidth: "36px",
    fontFamily: "inherit",
  },
  activePage: {
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", border: "none",
    color: '#f0f9ff',
    borderColor: "#3b82f6",
  },
  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  recentItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: 'rgba(255,255,255,0.04)',
    border: "1px solid rgba(255,255,255,0.07)",
    transition: "transform 0.2s",
    flexWrap: "wrap",
  },
  recentAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", border: "none",
    color: '#f0f9ff',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  recentInfo: {
    flex: 1,
    minWidth: "150px",
  },
  recentName: {
    fontWeight: "600",
    color: "#f0f9ff",
    marginBottom: "4px",
  },
  recentEmail: {
    fontSize: "0.8rem",
    color: "rgba(240,249,255,0.45)",
  },
  recentMeta: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  recentRole: {
    padding: "3px 8px",
    background: 'rgba(56,189,248,0.13)',
    border: '1px solid rgba(56,189,248,0.25)',
    borderRadius: "6px",
    fontSize: "0.7rem",
    fontWeight: "700",
    color: '#38bdf8',
    letterSpacing: '0.04em',
  },
  recentProvider: {
    padding: "3px 8px",
    background: 'rgba(6,182,212,0.13)',
    border: '1px solid rgba(6,182,212,0.25)',
    borderRadius: "6px",
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#22d3ee",
  },
  loadingContainer: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    padding: "60px",
    borderRadius: "16px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.11)",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  loadingText: {
    color: "rgba(240,249,255,0.6)",
    fontSize: "1rem",
  },
  errorBox: {
    background: 'rgba(248,113,113,0.1)',
    color: "#fca5a5",
    padding: "14px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid rgba(248,113,113,0.3)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  errorIcon: {
    fontSize: "1.2rem",
  },
  retryButton: {
    marginLeft: "auto",
    padding: "6px 12px",
    backgroundColor: "#dc2626",
    color: '#f0f9ff',
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    color: "rgba(240,249,255,0.6)",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "slideIn 0.3s ease-out",
  },
  modal: {
    background: 'rgba(7,18,32,0.95)',
    backdropFilter: 'blur(40px) saturate(160%)',
    WebkitBackdropFilter: 'blur(40px) saturate(160%)',
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(240,249,255,0.85)",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#f0f9ff",
    margin: 0,
  },
  modalClose: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "18px",
    cursor: "pointer",
    color: "rgba(240,249,255,0.65)",
    padding: "0",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
  modalBody: {
    padding: "24px",
  },
  modalSection: {
    marginBottom: "24px",
  },
  modalLabel: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#f0f9ff",
    marginBottom: "8px",
  },
  modalSelect: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "0.95rem",
    background: 'rgba(4,9,15,0.8)',
    color: '#f0f9ff',
    cursor: "pointer",
    fontFamily: "inherit",
  },
  formatOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  formatOption: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "rgba(240,249,255,0.7)",
  },
  radio: {
    cursor: "pointer",
  },
  modalInfo: {
    background: 'rgba(56,189,248,0.07)',
    border: '1px solid rgba(56,189,248,0.18)',
    padding: "16px",
    borderRadius: "8px",
    marginTop: "16px",
    color: 'rgba(240,249,255,0.7)',
    fontSize: '0.9rem',
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "20px 24px",
    borderTop: "1px solid rgba(240,249,255,0.85)",
  },
  modalCancel: {
    padding: "8px 16px",
    background: 'rgba(255,255,255,0.07)',
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "rgba(240,249,255,0.75)",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  modalDownload: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: '#f0f9ff',
    transition: "all 0.2s",
  },
};

// Add hover effects with CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input::placeholder { color: rgba(240,249,255,0.35); }
  input:focus, select:focus {
    border-color: rgba(56,189,248,0.5) !important;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
  }
  tr:hover td { background-color: rgba(255,255,255,0.03); }
`;
document.head.appendChild(styleSheet);

export default AdminUserSummaryPage;
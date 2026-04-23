import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import bookingService from '../services/bookingService';

function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchAllBookings();
    }, []);

    const fetchAllBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getAllBookings();
            setBookings(data);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await bookingService.decideBooking(id, 'APPROVE');
            toast.success('Booking approved successfully');
            fetchAllBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve booking');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
        try {
            await bookingService.cancelBooking(id);
            toast.success('Booking cancelled');
            fetchAllBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        try {
            await bookingService.decideBooking(id, 'REJECT', rejectReason);
            toast.success('Booking rejected');
            setRejectingId(null);
            setRejectReason('');
            fetchAllBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject booking');
        }
    };

    const getStatusConfig = (status) => {
        const config = {
            PENDING: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
            APPROVED: { label: 'Approved', color: '#38bdf8', bg: '#e0f2fe' },
            REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
            CANCELLED: { label: 'Cancelled', color: 'rgba(240,249,255,0.5)', bg: '#f3f4f6' }
        };
        return config[status] || { label: status, color: '#3b82f6', bg: '#dbeafe' };
    };

    const totalBookings = bookings.length;
    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
    const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
    const rejectedCount = bookings.filter(b => b.status === 'REJECTED').length;
    const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

    const filteredBookings = filterStatus === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading bookings...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header Section */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Booking Management</h1>
                        <p style={styles.subtitle}>Admin — View and manage all campus bookings</p>
                    </div>
                </div>

                {/* Stats Cards - Square Shape without emojis */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{totalBookings}</div>
                        <div style={styles.statLabel}>Total Bookings</div>
                        <div style={styles.statBar}></div>
                    </div>
                    <div style={{...styles.statCard, borderBottomColor: '#f59e0b'}}>
                        <div style={styles.statValue}>{pendingCount}</div>
                        <div style={styles.statLabel}>Pending</div>
                        <div style={{...styles.statBar, backgroundColor: '#f59e0b'}}></div>
                    </div>
                    <div style={{...styles.statCard, borderBottomColor: '#38bdf8'}}>
                        <div style={styles.statValue}>{approvedCount}</div>
                        <div style={styles.statLabel}>Approved</div>
                        <div style={{...styles.statBar, backgroundColor: '#38bdf8'}}></div>
                    </div>
                    <div style={{...styles.statCard, borderBottomColor: '#ef4444'}}>
                        <div style={styles.statValue}>{rejectedCount}</div>
                        <div style={styles.statLabel}>Rejected</div>
                        <div style={{...styles.statBar, backgroundColor: '#ef4444'}}></div>
                    </div>
                    <div style={{...styles.statCard, borderBottomColor: 'rgba(240,249,255,0.5)'}}>
                        <div style={styles.statValue}>{cancelledCount}</div>
                        <div style={styles.statLabel}>Cancelled</div>
                        <div style={{...styles.statBar, backgroundColor: 'rgba(240,249,255,0.5)'}}></div>
                    </div>
                </div>

                {/* Filter Section */}
                <div style={styles.filterCard}>
                    <div style={styles.filterHeader}>
                        <h3 style={styles.filterTitle}>Filter Bookings</h3>
                    </div>
                    <div style={styles.filterControls}>
                        <select
                            style={styles.filterSelect}
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        {filterStatus !== 'ALL' && (
                            <button
                                style={styles.clearButton}
                                onClick={() => setFilterStatus('ALL')}
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Bookings Table */}
                {filteredBookings.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <h3 style={styles.emptyTitle}>No Bookings Found</h3>
                        <p style={styles.emptyText}>
                            {filterStatus === 'ALL' 
                                ? 'No bookings have been created yet.' 
                                : `No ${filterStatus.toLowerCase()} bookings found.`}
                        </p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>User</th>
                                    <th style={styles.th}>Resource</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Time</th>
                                    <th style={styles.th}>Purpose</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Decision By</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => {
                                    const statusConfig = getStatusConfig(booking.status);
                                    return (
                                        <React.Fragment key={booking.bookingId}>
                                            <tr style={styles.tableRow}>
                                                <td style={styles.td}>
                                                    <span style={styles.idBadge}>#{booking.bookingId}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.username}>{booking.username}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.resourceName}>{booking.resourceName}</div>
                                                    <div style={styles.resourceLocation}>{booking.resourceLocation}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.dateText}>
                                                        {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.timeText}>
                                                        {booking.startTime} - {booking.endTime}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.purposeText} title={booking.purpose}>
                                                        {booking.purpose.length > 30 
                                                            ? `${booking.purpose.substring(0, 30)}...` 
                                                            : booking.purpose}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        backgroundColor: statusConfig.bg,
                                                        color: statusConfig.color
                                                    }}>
                                                        {statusConfig.label}
                                                    </span>
                                                    {booking.decisionReason && booking.status === 'REJECTED' && (
                                                        <div style={styles.reasonTooltip}>
                                                            <span style={styles.reasonText}>{booking.decisionReason}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.decidedBy}>
                                                        {booking.decidedBy || '-'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {booking.status === 'PENDING' && (
                                                        <div style={styles.actionButtons}>
                                                            <button
                                                                style={styles.approveButton}
                                                                onClick={() => handleApprove(booking.bookingId)}
                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0ea5e9'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#38bdf8'; }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                style={styles.rejectButton}
                                                                onClick={() => setRejectingId(booking.bookingId)}
                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; }}
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                style={styles.cancelAdminButton}
                                                                onClick={() => handleCancel(booking.bookingId)}
                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#78716c'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#57534e'; }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                    {booking.status === 'APPROVED' && (
                                                        <div style={styles.actionButtons}>
                                                            <button
                                                                style={styles.cancelAdminButton}
                                                                onClick={() => handleCancel(booking.bookingId)}
                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#78716c'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#57534e'; }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {rejectingId === booking.bookingId && (
                                                <tr style={styles.rejectRow}>
                                                    <td colSpan="9" style={styles.rejectCell}>
                                                        <div style={styles.rejectContainer}>
                                                            <input
                                                                type="text"
                                                                style={styles.rejectInput}
                                                                placeholder="Enter rejection reason..."
                                                                value={rejectReason}
                                                                onChange={e => setRejectReason(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <button
                                                                style={styles.confirmButton}
                                                                onClick={() => handleReject(booking.bookingId)}
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                style={styles.cancelRejectButton}
                                                                onClick={() => {
                                                                    setRejectingId(null);
                                                                    setRejectReason('');
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                         </table>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .table-row:hover {
                    background-color: rgba(255,255,255,0.05);
                    transition: background-color 0.2s ease;
                }
                
                .approve-button:hover,
                .reject-button:hover {
                    transform: translateY(-1px);
                }
                
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .stat-card:hover .stat-bar {
                    width: 60px;
                }
            `}</style>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'transparent',
        fontFamily: "'Plus Jakarta Sans','Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: '100px 20px'
    },

    container: {
        maxWidth: '1400px',
        margin: '0 auto'
    },

    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        gap: '16px'
    },

    loadingSpinner: {
        width: '48px',
        height: '48px',
        border: '3px solid rgba(56,189,248,0.18)',
        borderTopColor: '#38bdf8',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },

    loadingText: {
        color: 'rgba(240,249,255,0.5)',
        fontSize: '0.875rem'
    },

    header: {
        marginBottom: '32px'
    },

    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#f0f9ff',
        marginBottom: '8px',
        letterSpacing: '-0.02em'
    },

    subtitle: {
        fontSize: '1rem',
        color: 'rgba(240,249,255,0.5)'
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
    },

    statCard: {
        background: 'transparent',
        borderRadius: '20px',
        padding: '24px 20px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.12)',
        borderBottomWidth: '4px',
        borderBottomColor: 'rgba(255,255,255,0.05)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },

    statValue: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#f0f9ff',
        marginBottom: '8px'
    },

    statLabel: {
        fontSize: '0.75rem',
        color: '#f0f9ff',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },

    statBar: {
        width: '40px',
        height: '3px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        margin: '12px auto 0',
        transition: 'width 0.3s ease'
    },

    filterCard: {
        background: 'transparent',
        borderRadius: '16px',
        padding: '20px 20px 20px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },

    filterHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
    },

    filterTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#f0f9ff',
        margin: 0
    },

    filterControls: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },

    filterSelect: {
        padding: '10px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(56,189,248,0.25)',
        fontSize: '0.875rem',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit'
    },

    clearButton: {
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontWeight: '500',
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(240,249,255,0.7)',
        border: '1px solid rgba(255,255,255,0.12)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },

    emptyState: {
        textAlign: 'center',
        padding: '80px 40px',
        background: 'transparent',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.12)'
    },

    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '20px'
    },

    emptyTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#f0f9ff',
        marginBottom: '8px'
    },

    emptyText: {
        fontSize: '0.875rem',
        color: 'rgba(240,249,255,0.5)'
    },

    tableContainer: {
        background: 'transparent',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '20px 20px 20px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },

    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },

    tableHeader: {
        borderBottom: '2px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.06)'
    },

    th: {
        textAlign: 'left',
        padding: '16px',
        fontSize: '1rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#f0f9ff'
    },

    tableRow: {
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background-color 0.2s ease'
    },

    td: {
        padding: '16px',
        fontSize: '0.875rem',
        color: '#f0f9ff',
        verticalAlign: 'middle'
    },

    idBadge: {
        fontWeight: '600',
        color: '#f0f9ff',
        fontSize: '0.8rem'
    },

    username: {
        fontWeight: '600',
        color: '#f0f9ff'
    },

    resourceName: {
        fontWeight: '500',
        color: '#f0f9ff'
    },

    resourceLocation: {
        fontSize: '0.7rem',
        color: '#f0f9ff',
        marginTop: '2px'
    },

    dateText: {
        fontWeight: '500',
        color: '#f0f9ff'
    },

    timeText: {
        color: '#f0f9ff',
        fontSize: '0.8rem'
    },

    purposeText: {
        color: '#f0f9ff',
        fontSize: '0.85rem'
    },

    statusBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600'
    },

    decidedBy: {
        fontSize: '0.8rem',
        color: '#f0f9ff'
    },

    actionButtons: {
        display: 'flex',
        gap: '8px'
    },

    approveButton: {
        background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
        color: '#f0f9ff',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },

    rejectButton: {
        background: 'rgba(248,113,113,0.15)',
        color: '#f0f9ff',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },

    rejectRow: {
        background: 'rgba(251,191,36,0.06)',
        borderLeft: '3px solid rgba(251,191,36,0.4)'
    },

    rejectCell: {
        padding: '16px'
    },

    rejectContainer: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },

    rejectInput: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(56,189,248,0.25)',
        fontSize: '0.875rem',
        background: 'transparent',
        fontFamily: 'inherit'
    },

    confirmButton: {
        background: 'rgba(248,113,113,0.15)',
        color: '#f0f9ff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },

    cancelRejectButton: {
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(240,249,255,0.7)',
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },

    cancelAdminButton: {
        backgroundColor: '#57534e',
        color: '#fff',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
    },

    reasonTooltip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginLeft: '8px',
        cursor: 'help'
    },

    reasonText: {
        fontSize: '0.7rem',
        color: '#f0f9ff'
    }
};

export default AdminBookingsPage;

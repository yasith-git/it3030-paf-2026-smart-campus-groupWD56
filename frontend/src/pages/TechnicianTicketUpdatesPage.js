import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllTickets, getTicketById, updateTicketStatus } from '../services/incidentService';
import './incident.css';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

function formatDate(value) {
    if (!value) {
        return '-';
    }
    return new Date(value).toLocaleString();
}

function detailText(value) {
    if (!value) {
        return '-';
    }
    return value;
}

function getTransitionOptions(status) {
    if (status === 'OPEN') {
        return ['IN_PROGRESS'];
    }
    if (status === 'IN_PROGRESS') {
        return ['RESOLVED'];
    }
    return [];
}

function TechnicianTicketUpdatesPage() {
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [statusForm, setStatusForm] = useState({
        status: '',
        resolutionNotes: ''
    });
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const transitionOptions = useMemo(
        () => getTransitionOptions(selectedTicket?.status),
        [selectedTicket]
    );

    const loadTickets = async () => {
        setLoadingTickets(true);
        try {
            const data = await getAllTickets({
                page: 0,
                size: 50,
                sort: 'createdAt,desc',
                status: statusFilter === 'ALL' ? undefined : statusFilter
            });
            const list = data?.content || [];
            setTickets(list);

            if (selectedTicket?.id) {
                const stillPresent = list.some((ticket) => ticket.id === selectedTicket.id);
                if (!stillPresent) {
                    setSelectedTicket(null);
                    setStatusForm({ status: '', resolutionNotes: '' });
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingTickets(false);
        }
    };

    const selectTicket = async (ticketId) => {
        setLoadingDetails(true);
        try {
            const data = await getTicketById(ticketId);
            setSelectedTicket(data);
            setStatusForm({ status: '', resolutionNotes: '' });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const refreshSelectedTicket = async (ticketId) => {
        const data = await getTicketById(ticketId);
        setSelectedTicket(data);
    };

    const handleStatusUpdate = async (event) => {
        event.preventDefault();

        if (!selectedTicket) {
            return;
        }

        if (!statusForm.status) {
            toast.error('Please select a status update.');
            return;
        }

        if (statusForm.status === 'RESOLVED' && !statusForm.resolutionNotes.trim()) {
            toast.error('Resolution notes are required when resolving a ticket.');
            return;
        }

        setUpdatingStatus(true);
        try {
            await updateTicketStatus(selectedTicket.id, {
                status: statusForm.status,
                resolutionNotes: statusForm.status === 'RESOLVED' ? statusForm.resolutionNotes.trim() : ''
            });
            await Promise.all([refreshSelectedTicket(selectedTicket.id), loadTickets()]);
            setStatusForm({ status: '', resolutionNotes: '' });
            toast.success('Ticket status updated.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    useEffect(() => {
        loadTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    return (
        <div className="incident-shell"style={{padding:'100px'}}>
            <div className="incident-page">
                <h1 className="incident-headline">Ticket Updates</h1>
                <p className="incident-subtext">View your assigned tickets, inspect details, and update statuses.</p>

                <div className="incident-card" style={{ marginBottom: '14px' }}>
                    <div className="incident-grid">
                        <div>
                            <label className="incident-label">Filter by status</label>
                            <select
                                className="incident-select"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                <option value="ALL">All statuses</option>
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="incident-admin-grid">
                    <div className="incident-card">
                        <h2 className="incident-section-title">Assigned Tickets</h2>

                        {loadingTickets ? (
                            <div className="incident-loading">
                                <div className="incident-loading-spinner" />
                                <div className="incident-loading-text">Loading assigned tickets...</div>
                            </div>
                        ) : null}

                        {!loadingTickets && tickets.length === 0 ? (
                            <div>No tickets are currently assigned to you.</div>
                        ) : null}

                        {!loadingTickets && tickets.length > 0 ? (
                            <ul className="incident-list">
                                {tickets.map((ticket) => (
                                    <li
                                        key={ticket.id}
                                        className={`incident-item ${selectedTicket?.id === ticket.id ? 'incident-item-active' : ''}`}
                                    >
                                        <div className="incident-item-top">
                                            <strong>{ticket.ticketCode}</strong>
                                            <span className={`incident-chip status-${ticket.status}`}>{ticket.status}</span>
                                        </div>

                                        <div className="incident-meta" style={{ marginTop: '6px' }}>
                                            {ticket.category} • {ticket.locationText || ticket.resource?.location || 'No location'}
                                        </div>
                                        <div className="incident-meta" style={{ marginTop: '3px' }}>
                                            Priority: <span className={`incident-chip priority-${ticket.priority}`}>{ticket.priority}</span>
                                        </div>
                                        <div className="incident-meta" style={{ marginTop: '3px' }}>
                                            Created: {formatDate(ticket.createdAt)}
                                        </div>

                                        <div className="incident-actions" style={{ marginTop: '10px' }}>
                                            <button
                                                type="button"
                                                className="incident-btn-secondary"
                                                onClick={() => selectTicket(ticket.id)}
                                            >
                                                View & Update
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    <div className="incident-card">
                        <h2 className="incident-section-title">Ticket Details</h2>

                        {loadingDetails ? (
                            <div className="incident-loading">
                                <div className="incident-loading-spinner" />
                                <div className="incident-loading-text">Loading ticket details...</div>
                            </div>
                        ) : null}

                        {!loadingDetails && !selectedTicket ? (
                            <div>Select an assigned ticket to view details and update it.</div>
                        ) : null}

                        {!loadingDetails && selectedTicket ? (
                            <>
                                <div className="incident-detail-grid" style={{ marginBottom: '14px' }}>
                                    <div className="incident-kv">
                                        <strong>Ticket</strong>
                                        <div>{selectedTicket.ticketCode}</div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Status</strong>
                                        <div><span className={`incident-chip status-${selectedTicket.status}`}>{selectedTicket.status}</span></div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Category</strong>
                                        <div>{detailText(selectedTicket.category)}</div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Priority</strong>
                                        <div><span className={`incident-chip priority-${selectedTicket.priority}`}>{selectedTicket.priority}</span></div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Location</strong>
                                        <div>{detailText(selectedTicket.locationText || selectedTicket.resource?.location)}</div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Requester</strong>
                                        <div>{detailText(selectedTicket.createdBy?.fullName)}</div>
                                    </div>
                                    <div className="incident-kv incident-grid-full">
                                        <strong>Description</strong>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{detailText(selectedTicket.description)}</div>
                                    </div>
                                </div>

                                <div className="incident-actions" style={{ marginTop: 0, marginBottom: '16px' }}>
                                    <Link className="incident-btn-ghost" to={`/incidents/${selectedTicket.id}`}>
                                        Open Full Details
                                    </Link>
                                </div>

                                <form onSubmit={handleStatusUpdate} className="incident-helper-box">
                                    <div className="incident-helper-title">Update Ticket Status</div>

                                    <label className="incident-label">Next status</label>
                                    <select
                                        className="incident-select"
                                        value={statusForm.status}
                                        onChange={(event) => setStatusForm((prev) => ({ ...prev, status: event.target.value }))}
                                        disabled={transitionOptions.length === 0 || updatingStatus}
                                    >
                                        <option value="">Select next status</option>
                                        {transitionOptions.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>

                                    {statusForm.status === 'RESOLVED' ? (
                                        <>
                                            <label className="incident-label" style={{ marginTop: '10px' }}>Resolution Notes</label>
                                            <textarea
                                                className="incident-textarea"
                                                value={statusForm.resolutionNotes}
                                                onChange={(event) => setStatusForm((prev) => ({ ...prev, resolutionNotes: event.target.value }))}
                                                placeholder="Describe how the issue was fixed"
                                                maxLength={2000}
                                            />
                                        </>
                                    ) : null}

                                    {transitionOptions.length === 0 ? (
                                        <div className="incident-meta" style={{ marginTop: '10px' }}>
                                            No technician status updates available for this ticket.
                                        </div>
                                    ) : null}

                                    <div className="incident-actions">
                                        <button
                                            type="submit"
                                            className="incident-btn-primary"
                                            disabled={transitionOptions.length === 0 || updatingStatus}
                                        >
                                            {updatingStatus ? 'Updating...' : 'Update Status'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TechnicianTicketUpdatesPage;

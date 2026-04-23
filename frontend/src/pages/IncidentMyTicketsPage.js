import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyTickets } from '../services/incidentService';
import './incident.css';

function formatDate(value) {
    if (!value) {
        return '-';
    }
    return new Date(value).toLocaleString();
}

function IncidentMyTicketsPage() {
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getMyTickets({ page: 0, size: 20, sort: 'createdAt,desc' });
                if (mounted) {
                    setTickets(data?.content || []);
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="incident-shell">
            <div className="incident-page">
                <h1 className="incident-headline">My Incident Tickets</h1>
                <p className="incident-subtext">Tickets submitted by you with latest status and quick access to details.</p>

                <div className="incident-actions" style={{ marginBottom: '14px' }}>
                    <Link className="incident-btn-primary" to="/incidents/new">Create New Ticket</Link>
                </div>

                <div className="incident-card">
                    {loading ? (
                        <div className="incident-loading">
                            <div className="incident-loading-spinner" />
                            <div className="incident-loading-text">Loading your incident tickets...</div>
                        </div>
                    ) : null}
                    {!loading && tickets.length === 0 ? (
                        <div>
                            No incident tickets found. <Link to="/incidents/new">Create your first ticket</Link>.
                        </div>
                    ) : null}

                    {!loading && tickets.length > 0 ? (
                        <ul className="incident-list">
                            {tickets.map((ticket) => (
                                <li key={ticket.id} className="incident-item">
                                    <div className="incident-item-top">
                                        <strong>{ticket.ticketCode}</strong>
                                        <span className={`incident-chip status-${ticket.status}`}>{ticket.status}</span>
                                    </div>
                                    <div className="incident-meta" style={{ marginTop: '8px' }}>
                                        {ticket.category} • {ticket.locationText || ticket.resource?.location || 'No location'}
                                    </div>
                                    <div className="incident-meta" style={{ marginTop: '2px' }}>
                                        Created: {formatDate(ticket.createdAt)}
                                    </div>
                                    <div className="incident-actions" style={{ marginTop: '10px' }}>
                                        <Link className="incident-btn-view" to={`/incidents/${ticket.id}`}>
                                            View Details
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default IncidentMyTicketsPage;

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    addTicketComment,
    deleteTicket,
    deleteTicketAttachment,
    deleteTicketComment,
    downloadTicketAttachment,
    getTicketById,
    updateTicketComment
} from '../services/incidentService';
import './incident.css';

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

function IncidentTicketDetailsPage() {
    const { ticketId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [busyAction, setBusyAction] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getTicketById(ticketId);
                if (mounted) {
                    setTicket(data);
                }
                if (location.state?.justCreated) {
                    toast.success('You can now track this ticket from your dashboard.');
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
    }, [ticketId, location.state]);

    async function refreshTicket() {
        const data = await getTicketById(ticketId);
        setTicket(data);
    }

    async function handleAddComment(event) {
        event.preventDefault();
        if (!commentText.trim()) {
            toast.error('Comment message is required');
            return;
        }

        setBusyAction('comment');
        try {
            await addTicketComment(ticketId, commentText.trim());
            setCommentText('');
            await refreshTicket();
            toast.success('Comment added successfully');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusyAction('');
        }
    }

    async function handleDeleteComment(commentId) {
        setBusyAction(`delete-comment-${commentId}`);
        try {
            await deleteTicketComment(ticketId, commentId);
            await refreshTicket();
            toast.success('Comment deleted');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusyAction('');
        }
    }

    function startEditComment(comment) {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.message || '');
    }

    function cancelEditComment() {
        setEditingCommentId(null);
        setEditingCommentText('');
    }

    async function handleSaveCommentEdit(commentId) {
        if (!editingCommentText.trim()) {
            toast.error('Comment message is required');
            return;
        }

        setBusyAction(`edit-comment-${commentId}`);
        try {
            await updateTicketComment(ticketId, commentId, editingCommentText.trim());
            await refreshTicket();
            cancelEditComment();
            toast.success('Comment updated');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusyAction('');
        }
    }

    async function handleDeleteAttachment(attachmentId) {
        setBusyAction(`delete-attachment-${attachmentId}`);
        try {
            await deleteTicketAttachment(ticketId, attachmentId);
            await refreshTicket();
            toast.success('Attachment deleted');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusyAction('');
        }
    }

    async function handleDownloadAttachment(attachment) {
        try {
            const blob = await downloadTicketAttachment(ticketId, attachment.id);
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = attachment.originalFileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error.message);
        }
    }

    async function handleDeleteTicket() {
        const confirmed = window.confirm('Delete this OPEN ticket? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        setBusyAction('delete-ticket');
        try {
            await deleteTicket(ticketId);
            toast.success('Ticket deleted successfully');
            navigate('/incidents');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBusyAction('');
        }
    }

    const isTechnician = user?.role === 'TECHNICIAN';
    const isAdmin = user?.role === 'ADMIN';
    const backLink = isTechnician ? '/technician/tickets' : '/incidents';
    const backLabel = isTechnician ? 'Back To Ticket Updates' : 'Back To My Tickets';
    const currentUserId = Number(user?.userId ?? user?.id);
    const isOwner = ticket && Number(ticket.createdBy?.id) === currentUserId;
    const canEditOrDelete = isOwner && ticket?.status === 'OPEN';

    return (
        <div className="incident-shell">
            <div className="incident-page">
                <h1 className="incident-headline">Incident Ticket Details</h1>

                <div className="incident-actions" style={{ marginBottom: '14px' }}>
                    <Link className="incident-btn-ghost" to={backLink}>{backLabel}</Link>
                    {canEditOrDelete && (
                        <Link className="incident-btn-primary" to={`/incidents/${ticketId}/edit`}>Edit Ticket</Link>
                    )}
                    {canEditOrDelete && (
                        <button
                            className="incident-btn-secondary incident-btn-danger"
                            type="button"
                            onClick={handleDeleteTicket}
                            disabled={busyAction === 'delete-ticket'}
                        >
                            {busyAction === 'delete-ticket' ? 'Deleting...' : 'Delete Ticket'}
                        </button>
                    )}
                    {!isTechnician && !isAdmin && (
                        <Link className="incident-btn-secondary" to="/incidents/new">Create Another</Link>
                    )}
                </div>

                <div className="incident-card">
                    {loading ? (
                        <div className="incident-loading">
                            <div className="incident-loading-spinner" />
                            <div className="incident-loading-text">Loading ticket details...</div>
                        </div>
                    ) : null}
                    {!loading && !ticket ? <div>Ticket not found.</div> : null}

                    {!loading && ticket ? (
                        <>
                            <div className="incident-item-top" style={{ marginBottom: '12px' }}>
                                <h2 style={{ margin: 0 }}>{ticket.ticketCode}</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className={`incident-chip status-${ticket.status}`}>{ticket.status}</span>
                                    <span className={`incident-chip priority-${ticket.priority}`}>{ticket.priority}</span>
                                </div>
                            </div>

                            <div className="incident-detail-grid">
                                <div className="incident-kv">
                                    <strong>CATEGORY</strong>
                                    <div>{detailText(ticket.category)}</div>
                                </div>
                                <div className="incident-kv">
                                    <strong>LOCATION</strong>
                                    <div>{detailText(ticket.locationText || ticket.resource?.location)}</div>
                                </div>
                                <div className="incident-kv">
                                    <strong>RESOURCE</strong>
                                    <div>{detailText(ticket.resource?.name)}</div>
                                </div>
                                <div className="incident-kv">
                                    <strong>CREATED AT</strong>
                                    <div>{formatDate(ticket.createdAt)}</div>
                                </div>
                                <div className="incident-kv">
                                    <strong>PREFERRED CONTACT</strong>
                                    <div>{detailText(ticket.preferredContactName)}</div>
                                    <div className="incident-meta">{detailText(ticket.preferredContactEmail)}</div>
                                    <div className="incident-meta">{detailText(ticket.preferredContactPhone)}</div>
                                </div>
                                <div className="incident-kv">
                                    <strong>ASSIGNED TECHNICIAN</strong>
                                    <div>{detailText(ticket.assignedTechnician?.fullName)}</div>
                                    <div className="incident-meta">{detailText(ticket.assignedTechnician?.email)}</div>
                                </div>
                            </div>

                            <div className="incident-kv" style={{ marginTop: '12px' }}>
                                <strong>DESCRIPTION</strong>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{detailText(ticket.description)}</div>
                            </div>

                            <div className="incident-card incident-attachments-card" style={{ marginTop: '12px', padding: '16px' }}>
                                <h3 className="incident-attachments-header" style={{ fontSize: '1.05rem', marginBottom: '12px' }}>Attachments</h3>
                                <div style={{ marginTop: '14px' }}>
                                    {(ticket.attachments || []).length === 0 ? (
                                        <div className="incident-meta">No attachments uploaded yet.</div>
                                    ) : (
                                        <div className="incident-list">
                                            {ticket.attachments.map((attachment) => (
                                                <div key={attachment.id} className="incident-item">
                                                    <div className="incident-item-top">
                                                        <strong>{attachment.originalFileName}</strong>
                                                        <span className="incident-meta">{attachment.contentType}</span>
                                                    </div>
                                                    <div className="incident-meta" style={{ marginTop: '4px' }}>
                                                        Uploaded by {attachment.uploadedBy?.fullName || '-'} on {formatDate(attachment.uploadedAt)}
                                                    </div>
                                                    <div className="incident-actions" style={{ marginTop: '10px' }}>
                                                        <button
                                                            type="button"
                                                            className="incident-btn-ghost incident-btn-attachment-download"
                                                            onClick={() => handleDownloadAttachment(attachment)}
                                                        >
                                                            Download <span className="incident-download-icon">⬇</span>
                                                        </button>
                                                        {!isTechnician && !isAdmin && (
                                                            <button
                                                                type="button"
                                                                className="incident-btn-ghost incident-btn-attachment-delete"
                                                                onClick={() => handleDeleteAttachment(attachment.id)}
                                                                disabled={busyAction === `delete-attachment-${attachment.id}`}
                                                            >
                                                                {busyAction === `delete-attachment-${attachment.id}` ? 'Deleting...' : 'Delete'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="incident-card incident-comments-card" style={{ marginTop: '12px', padding: '16px' }}>
                                <h3 className="incident-comments-header" style={{ fontSize: '1.05rem', marginBottom: '12px' }}>Comments</h3>
                                <form onSubmit={handleAddComment}>
                                    <div className="incident-grid">
                                        <div className="incident-grid-full">
                                            <label className="incident-label">Add comment</label>
                                            <textarea
                                                className="incident-textarea"
                                                value={commentText}
                                                onChange={(event) => setCommentText(event.target.value)}
                                                maxLength={1000}
                                                placeholder="Add an update, note, or question about this ticket..."
                                            />
                                        </div>
                                    </div>
                                    <div className="incident-actions">
                                        <button className="incident-btn-primary" type="submit" disabled={busyAction === 'comment'}>
                                            {busyAction === 'comment' ? 'Posting...' : 'Post Comment'}
                                        </button>
                                    </div>
                                </form>

                                <div style={{ marginTop: '14px' }}>
                                    {(ticket.comments || []).length === 0 ? (
                                        <div className="incident-meta">No comments yet.</div>
                                    ) : (
                                        <div className="incident-list">
                                            {ticket.comments.map((comment) => (
                                                <div key={comment.id} className="incident-item incident-comment-item">
                                                    <div className="incident-item-top">
                                                        <strong>{comment.author?.fullName || '-'}</strong>
                                                        <span className="incident-meta">{formatDate(comment.updatedAt)}</span>
                                                    </div>
                                                    {editingCommentId === comment.id ? (
                                                        <div style={{ marginTop: '8px' }}>
                                                            <textarea
                                                                className="incident-textarea"
                                                                value={editingCommentText}
                                                                onChange={(event) => setEditingCommentText(event.target.value)}
                                                                maxLength={1000}
                                                                disabled={busyAction === `edit-comment-${comment.id}`}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="incident-comment-text">{detailText(comment.message)}</div>
                                                    )}
                                                    <div className="incident-comment-meta">
                                                        {comment.edited ? 'Edited' : 'Original'} • {comment.deleted ? 'Deleted' : 'Visible'}
                                                    </div>
                                                    <div className="incident-actions" style={{ marginTop: '10px' }}>
                                                        {!comment.deleted && Number(comment.author?.id) === currentUserId && editingCommentId !== comment.id ? (
                                                            <button
                                                                type="button"
                                                                className="incident-btn-ghost incident-btn-comment-edit"
                                                                onClick={() => startEditComment(comment)}
                                                            >
                                                                Edit Comment
                                                            </button>
                                                        ) : null}

                                                        {!comment.deleted && editingCommentId === comment.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="incident-btn-primary incident-btn-comment-save"
                                                                    onClick={() => handleSaveCommentEdit(comment.id)}
                                                                    disabled={busyAction === `edit-comment-${comment.id}`}
                                                                >
                                                                    {busyAction === `edit-comment-${comment.id}` ? 'Saving...' : 'Save'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="incident-btn-ghost incident-btn-comment-cancel"
                                                                    onClick={cancelEditComment}
                                                                    disabled={busyAction === `edit-comment-${comment.id}`}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : null}

                                                        {!comment.deleted && Number(comment.author?.id) === currentUserId ? (
                                                            <button
                                                                type="button"
                                                                className="incident-btn-ghost incident-btn-comment-delete"
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                disabled={busyAction === `delete-comment-${comment.id}`}
                                                            >
                                                                {busyAction === `delete-comment-${comment.id}` ? 'Deleting...' : 'Delete Comment'}
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {ticket.rejectionReason ? (
                                <div className="incident-kv incident-kv-rejection" style={{ marginTop: '12px' }}>
                                    <strong>REJECTION REASON</strong>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{ticket.rejectionReason}</div>
                                </div>
                            ) : null}

                            {ticket.resolutionNotes ? (
                                <div className="incident-kv incident-kv-resolution" style={{ marginTop: '12px' }}>
                                    <strong>RESOLUTION NOTES</strong>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{ticket.resolutionNotes}</div>
                                </div>
                            ) : null}

                            <h3 style={{ fontSize: '1.05rem', marginTop: '20px' }}>Status Timeline</h3>
                            <div className="incident-timeline">
                                {(ticket.statusHistory || []).map((item) => (
                                    <div key={item.id} className="incident-timeline-item">
                                        <div style={{ fontWeight: 700 }}>
                                            {item.oldStatus || 'N/A'} → {item.newStatus}
                                        </div>
                                        <div className="incident-meta">By {item.changedBy?.fullName || '-'} on {formatDate(item.changedAt)}</div>
                                        <div style={{ marginTop: '4px' }}>{detailText(item.note)}</div>
                                    </div>
                                ))}
                                {(!ticket.statusHistory || ticket.statusHistory.length === 0) ? (
                                    <div className="incident-meta">No status history available yet.</div>
                                ) : null}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default IncidentTicketDetailsPage;
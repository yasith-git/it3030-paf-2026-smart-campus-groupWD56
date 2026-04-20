import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteTicket, getResources, getTicketById, updateTicket, uploadTicketAttachments } from '../services/incidentService';
import './incident.css';

const categories = [
    'ELECTRICAL',
    'NETWORK',
    'PROJECTOR',
    'COMPUTER',
    'FACILITY_DAMAGE',
    'PLUMBING',
    'AIR_CONDITIONING',
    'SAFETY',
    'OTHER'
];

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const emailRegex = /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const phoneRegex = /^0\d{9}$/;

const initialForm = {
    resourceId: '',
    locationText: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    preferredContactName: '',
    preferredContactEmail: '',
    preferredContactPhone: ''
};

function formatLabel(value) {
    return value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function EditIncidentPage() {
    const { ticketId } = useParams();
    const navigate = useNavigate();

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [resourceData, ticketData] = await Promise.all([
                    getResources(),
                    getTicketById(ticketId)
                ]);

                if (!mounted) {
                    return;
                }

                setResources(resourceData || []);

                if (ticketData.status !== 'OPEN') {
                    toast.error('Only OPEN tickets can be edited.');
                    navigate(`/incidents/${ticketId}`);
                    return;
                }

                setForm({
                    resourceId: ticketData.resource?.id ? String(ticketData.resource.id) : '',
                    locationText: ticketData.locationText || '',
                    category: ticketData.category || '',
                    description: ticketData.description || '',
                    priority: ticketData.priority || 'MEDIUM',
                    preferredContactName: ticketData.preferredContactName || '',
                    preferredContactEmail: ticketData.preferredContactEmail || '',
                    preferredContactPhone: ticketData.preferredContactPhone || ''
                });
            } catch (error) {
                toast.error(error.message);
                navigate(`/incidents/${ticketId}`);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [ticketId, navigate]);

    const selectedResource = useMemo(() => {
        if (!form.resourceId) {
            return null;
        }
        return resources.find((r) => String(r.resourceId) === String(form.resourceId)) || null;
    }, [form.resourceId, resources]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    function validate() {
        const nextErrors = {};

        if (!form.category) {
            nextErrors.category = 'Category is required';
        }
        if (!form.description.trim()) {
            nextErrors.description = 'Description is required';
        }
        if (!form.priority) {
            nextErrors.priority = 'Priority is required';
        }

        if (!form.resourceId && !form.locationText.trim()) {
            nextErrors.locationText = 'Provide either resource or location text';
        }

        if (form.preferredContactEmail && !emailRegex.test(form.preferredContactEmail)) {
            nextErrors.preferredContactEmail = 'Use a valid email address (must start with a letter or number)';
        }

        if (form.preferredContactPhone && !phoneRegex.test(form.preferredContactPhone)) {
            nextErrors.preferredContactPhone = 'Phone number must start with 0 and contain exactly 10 digits';
        }

        if (selectedFiles.length > 3) {
            nextErrors.attachments = 'You can upload maximum 3 images';
        }

        const invalidFile = selectedFiles.find((file) => !['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type));
        if (invalidFile) {
            nextErrors.attachments = 'Only JPG, JPEG, PNG, and WEBP images are allowed';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!validate()) {
            return;
        }

        setSaving(true);
        try {
            const payload = {
                resourceId: form.resourceId ? Number(form.resourceId) : null,
                locationText: form.locationText.trim() || null,
                category: form.category,
                description: form.description.trim(),
                priority: form.priority,
                preferredContactName: form.preferredContactName.trim() || null,
                preferredContactEmail: form.preferredContactEmail.trim() || null,
                preferredContactPhone: form.preferredContactPhone.trim() || null
            };

            await updateTicket(ticketId, payload);

            if (selectedFiles.length > 0) {
                try {
                    await uploadTicketAttachments(ticketId, selectedFiles);
                } catch (uploadError) {
                    toast.warning(`Ticket updated, but attachment upload failed: ${uploadError.message}`);
                }
            }

            toast.success('Ticket updated successfully.');
            navigate(`/incidents/${ticketId}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm('Delete this OPEN ticket? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        setDeleting(true);
        try {
            await deleteTicket(ticketId);
            toast.success('Ticket deleted successfully.');
            navigate('/incidents');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="incident-shell">
                <div className="incident-page">
                    <div className="incident-card">
                        <div className="incident-loading">
                            <div className="incident-loading-spinner" />
                            <div className="incident-loading-text">Loading ticket for edit...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="incident-shell">
            <div className="incident-page">
                <h1 className="incident-headline">Edit Incident Ticket</h1>
                <p className="incident-subtext">Only OPEN tickets can be edited or deleted.</p>

                <form className="incident-card" onSubmit={handleSubmit}>
                    <div className="incident-grid">
                        <div>
                            <label className="incident-label">Resource</label>
                            <select
                                className="incident-select"
                                name="resourceId"
                                value={form.resourceId}
                                onChange={handleChange}
                            >
                                <option value="">Select resource (optional)</option>
                                {resources.map((resource) => (
                                    <option key={resource.resourceId} value={resource.resourceId}>
                                        {resource.resourceName} - {resource.location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="incident-label">Fallback Location Text</label>
                            <input
                                className="incident-input"
                                name="locationText"
                                value={form.locationText}
                                onChange={handleChange}
                                maxLength={150}
                                placeholder="Building C, Floor 2, Corridor"
                            />
                            {errors.locationText ? <div className="incident-error">{errors.locationText}</div> : null}
                        </div>

                        <div>
                            <label className="incident-label">Category *</label>
                            <select className="incident-select" name="category" value={form.category} onChange={handleChange}>
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{formatLabel(category)}</option>
                                ))}
                            </select>
                            {errors.category ? <div className="incident-error">{errors.category}</div> : null}
                        </div>

                        <div>
                            <label className="incident-label">Priority *</label>
                            <select className="incident-select" name="priority" value={form.priority} onChange={handleChange}>
                                {priorities.map((priority) => (
                                    <option key={priority} value={priority}>{formatLabel(priority)}</option>
                                ))}
                            </select>
                            {errors.priority ? <div className="incident-error">{errors.priority}</div> : null}
                        </div>

                        <div className="incident-grid-full">
                            <label className="incident-label">Description *</label>
                            <textarea
                                className="incident-textarea"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                maxLength={2000}
                                placeholder="Describe what happened, when it started, and any visible impact..."
                            />
                            {errors.description ? <div className="incident-error">{errors.description}</div> : null}
                        </div>

                        <div className="incident-grid-full">
                            <label className="incident-label">Attachments (Optional)</label>
                            <input
                                className="incident-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                multiple
                                onClick={(event) => {
                                    event.target.value = '';
                                }}
                                onChange={(event) => {
                                    const files = Array.from(event.target.files || []);
                                    const limitedFiles = files.slice(0, 3);
                                    if (files.length > 3) {
                                        toast.warning('You can upload maximum 3 images. Only first 3 are kept.', {
                                            toastId: 'attachments-limit-warning'
                                        });
                                        setErrors((prev) => ({
                                            ...prev,
                                            attachments: 'You can upload maximum 3 images. Only first 3 are kept.'
                                        }));
                                    } else {
                                        setErrors((prev) => ({ ...prev, attachments: '' }));
                                    }
                                    setSelectedFiles(limitedFiles);
                                }}
                            />
                            <div className="incident-helper-box" style={{ marginTop: '8px' }}>
                                <div className="incident-helper-title">Attachment Guidelines</div>
                                <ul className="incident-helper-list">
                                    <li>Only image files are allowed: PNG, JPG, JPEG, WEBP</li>
                                    <li>Maximum attachments per ticket: 3 files</li>
                                    <li>Attachments are uploaded after saving ticket changes</li>
                                </ul>
                            </div>
                            {selectedFiles.length > 0 ? (
                                <div style={{ marginTop: '4px' }}>
                                    <div className="incident-meta">{selectedFiles.length} file(s) selected</div>
                                    <ul className="incident-helper-list" style={{ marginTop: '6px' }}>
                                        {selectedFiles.map((file) => (
                                            <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            {errors.attachments ? <div className="incident-error">{errors.attachments}</div> : null}
                        </div>

                        <div>
                            <label className="incident-label">Preferred Contact Name</label>
                            <input
                                className="incident-input"
                                name="preferredContactName"
                                value={form.preferredContactName}
                                onChange={handleChange}
                                maxLength={100}
                                placeholder="John Student"
                            />
                        </div>

                        <div>
                            <label className="incident-label">Preferred Contact Email</label>
                            <input
                                className="incident-input"
                                name="preferredContactEmail"
                                value={form.preferredContactEmail}
                                onChange={handleChange}
                                maxLength={150}
                                placeholder="john.student@novacampus.edu"
                            />
                            {errors.preferredContactEmail ? <div className="incident-error">{errors.preferredContactEmail}</div> : null}
                        </div>

                        <div>
                            <label className="incident-label">Preferred Contact Phone</label>
                            <input
                                className="incident-input"
                                name="preferredContactPhone"
                                value={form.preferredContactPhone}
                                onChange={handleChange}
                                maxLength={30}
                                placeholder="+94 77 123 4567"
                            />
                            {errors.preferredContactPhone ? <div className="incident-error">{errors.preferredContactPhone}</div> : null}
                        </div>

                        {selectedResource ? (
                            <div className="incident-kv">
                                <strong>SELECTED RESOURCE</strong>
                                <div>{selectedResource.resourceName}</div>
                                <div className="incident-meta">{selectedResource.location}</div>
                            </div>
                        ) : null}
                    </div>

                    <div className="incident-actions">
                        <button className="incident-btn-primary" type="submit" disabled={saving || deleting}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            className="incident-btn-secondary incident-btn-danger"
                            type="button"
                            disabled={saving || deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? 'Deleting...' : 'Delete Ticket'}
                        </button>
                        <Link className="incident-btn-ghost" to={`/incidents/${ticketId}`}>Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditIncidentPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import bookingService from '../services/bookingService';

function CreateBookingPage() {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        resourceId: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/api/resources', { withCredentials: true });
            setResources(res.data);
        } catch (error) {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.resourceId) {
            toast.error('Please select a resource');
            return;
        }
        if (form.startTime >= form.endTime) {
            toast.error('End time must be after start time');
            return;
        }
        
        setSubmitting(true);
        try {
            await bookingService.createBooking({
                ...form,
                resourceId: parseInt(form.resourceId),
                expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null
            });
            toast.success('Booking created successfully!');
            navigate('/bookings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.pageloadingSpinner}></div>
                <p style={styles.loadingText}>Loading resources...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header Section */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Create New Booking</h1>
                        <p style={styles.subtitle}>Book campus resources for your academic or administrative activities</p>
                    </div>
                    <Link to="/bookings" style={styles.secondaryButton}>
                        ← Back to Bookings
                    </Link>
                </div>

                {/* Form Card */}
                <div style={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        {/* Resource Selection */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Resource
                            </label>
                            <select
                                style={styles.select}
                                name="resourceId"
                                value={form.resourceId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a resource...</option>
                                {resources.map(r => (
                                    <option key={r.resourceId} value={r.resourceId}>
                                        {r.resourceName} — {r.location} {r.capacity ? `(Capacity: ${r.capacity})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Selection */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Booking Date
                            </label>
                            <input
                                type="date"
                                style={styles.input}
                                name="bookingDate"
                                value={form.bookingDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Time Selection */}
                        <div style={styles.row}>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    style={styles.input}
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    style={styles.input}
                                    name="endTime"
                                    value={form.endTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Purpose */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Purpose
                            </label>
                            <input
                                type="text"
                                style={styles.input}
                                name="purpose"
                                value={form.purpose}
                                onChange={handleChange}
                                placeholder="e.g., Lecture session, Team meeting, Study group"
                                required
                            />
                        </div>

                        {/* Expected Attendees */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Expected Attendees
                            </label>
                            <input
                                type="number"
                                style={styles.input}
                                name="expectedAttendees"
                                value={form.expectedAttendees}
                                onChange={handleChange}
                                placeholder="Optional"
                                min="1"
                            />
                        </div>

                        {/* Form Actions */}
                        <div style={styles.buttonGroup}>
                            <button
                                type="submit"
                                style={styles.submitButton}
                                disabled={submitting}
                                onMouseEnter={(e) => {
                                    if (!submitting) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <span style={styles.loadingSpinner}></span>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Booking'
                                )}
                            </button>
                            <button
                                type="button"
                                style={styles.cancelButton}
                                onClick={() => navigate('/bookings')}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
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
                
                input:focus, select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                button:active {
                    transform: translateY(0) !important;
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
        maxWidth: '800px',
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

    pageloadingSpinner: {
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
    },

    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#f0f9ff',
        marginBottom: '8px',
        letterSpacing: '-0.02em'
    },

    subtitle: {
        fontSize: '1rem',
        color: 'rgba(240,249,255,0.5)'
    },

    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#f0f9ff',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        display: 'inline-block',
        border: '1px solid rgba(255,255,255,0.12)'
    },

    formCard: {
        background: 'transparent',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        animation: 'fadeInUp 0.5s ease'
    },

    formGroup: {
        marginBottom: '24px'
    },

    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'rgba(240,249,255,0.7)',
        marginBottom: '8px'
    },

    labelIcon: {
        fontSize: '1rem'
    },

    input: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid rgba(56,189,248,0.25)',
        fontSize: '0.875rem',
        transition: 'all 0.2s ease',
        background: 'transparent',
        fontFamily: 'inherit'
    },

    select: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid rgba(56,189,248,0.25)',
        fontSize: '0.875rem',
        transition: 'all 0.2s ease',
        background: 'transparent',
        fontFamily: 'inherit',
        cursor: 'pointer'
    },

    row: {
        display: 'flex',
        gap: '16px',
        marginBottom: '0'
    },

    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '32px'
    },

    submitButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#f0f9ff',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },

    cancelButton: {
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '600',
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(240,249,255,0.7)',
        border: '1px solid rgba(255,255,255,0.12)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },

    loadingSpinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    }
};

export default CreateBookingPage;

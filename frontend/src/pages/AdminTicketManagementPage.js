import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    assignTicket,
    getAllTickets,
    getAssignableUsers,
    getTicketById,
    updateTicketStatus
} from '../services/incidentService';
import './incident.css';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CATEGORY_OPTIONS = ['ELECTRICAL', 'NETWORK', 'PROJECTOR', 'COMPUTER', 'FACILITY_DAMAGE', 'PLUMBING', 'AIR_CONDITIONING', 'SAFETY', 'OTHER'];

function formatDate(value) {
    if (!value) {
        return '-';
    }
    return new Date(value).toLocaleString();
}

function formatEnumLabel(value) {
    if (!value) {
        return '-';
    }
    return value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function escapePdfText(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

function buildSimplePdf(report) {
    const operations = [];

    const fmt = (value) => Number(value).toFixed(3);
    const addText = (x, y, text, size = 10, font = 'F1', color = [0.1, 0.12, 0.16]) => {
        operations.push(`BT /${font} ${size} Tf ${fmt(color[0])} ${fmt(color[1])} ${fmt(color[2])} rg ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
    };
    const addFillRect = (x, y, width, height, color = [1, 1, 1]) => {
        operations.push(`${fmt(color[0])} ${fmt(color[1])} ${fmt(color[2])} rg ${x} ${y} ${width} ${height} re f`);
    };

    addFillRect(24, 742, 564, 34, [0.07, 0.45, 0.43]);
    addText(38, 754, 'Admin Ticket Analytics Summary', 16, 'F2', [1, 1, 1]);

    addText(34, 726, `Generated: ${report.generatedAt}`, 9, 'F1', [0.29, 0.33, 0.4]);
    addText(34, 712, `Filters: Status=${report.filters.status}, Priority=${report.filters.priority}, Category=${report.filters.category}`, 9, 'F1', [0.29, 0.33, 0.4]);
    addText(34, 698, `Data window: ${report.loadedCount} loaded tickets`, 9, 'F1', [0.29, 0.33, 0.4]);

    const kpiCardColors = [
        [0.94, 0.97, 1.0],
        [0.94, 0.98, 1.0],
        [1.0, 0.98, 0.92],
        [0.94, 0.99, 0.95],
        [1.0, 0.95, 0.95],
        [0.93, 0.99, 1.0],
        [0.99, 0.95, 0.98],
        [0.96, 0.95, 1.0]
    ];

    report.kpis.forEach((kpi, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = 34 + col * 136;
        const y = 638 - row * 56;
        addFillRect(x, y, 128, 48, kpiCardColors[index % kpiCardColors.length]);
        addText(x + 8, y + 30, kpi.label, 7.6, 'F2', [0.07, 0.35, 0.33]);
        addText(x + 8, y + 12, kpi.value, 12, 'F2', [0.08, 0.1, 0.15]);
    });

    let cursorY = 518;
    const renderSection = (title, lines) => {
        if (cursorY < 80) {
            return;
        }
        addText(34, cursorY, title, 11, 'F2', [0.04, 0.4, 0.38]);
        cursorY -= 14;
        lines.forEach((line) => {
            if (cursorY < 62) {
                return;
            }
            addText(42, cursorY, `- ${line}`, 9, 'F1', [0.18, 0.22, 0.28]);
            cursorY -= 11;
        });
        cursorY -= 7;
    };

    renderSection('Tickets By Status', report.statusLines);
    renderSection('Tickets By Priority', report.priorityLines);
    renderSection('Top Categories', report.categoryLines);
    renderSection('Technician Workload', report.technicianLines);
    renderSection(`Daily Ticket Trend (${report.trendRangeDays} days)`, report.trendLines);

    const content = operations.join('\n');

    const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n';
    const obj4 = `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`;
    const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
    const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';
    const objects = [obj1, obj2, obj3, obj4, obj5, obj6];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((obj) => {
        offsets.push(pdf.length);
        pdf += obj;
    });

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
    };
}

function describePieSlice(centerX, centerY, radius, startAngle, endAngle) {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
        'M', centerX, centerY,
        'L', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'Z'
    ].join(' ');
}

function getStatusBarColor(label) {
    const map = {
        Open: 'linear-gradient(90deg, #2563eb, #60a5fa)',
        'In Progress': 'linear-gradient(90deg, #d97706, #f59e0b)',
        Resolved: 'linear-gradient(90deg, #0369a1, #38bdf8)',
        Closed: 'linear-gradient(90deg, #475569, rgba(240,249,255,0.6))',
        Rejected: 'linear-gradient(90deg, #b91c1c, #ef4444)'
    };
    return map[label] || 'linear-gradient(90deg, #0ea5e9, #38bdf8)';
}

function getPriorityBarColor(label) {
    const map = {
        Low: 'linear-gradient(90deg, #0ea5e9, #7dd3fc)',
        Medium: 'linear-gradient(90deg, #ca8a04, #facc15)',
        High: 'linear-gradient(90deg, #ea580c, #fb923c)',
        Critical: 'linear-gradient(90deg, #dc2626, #f87171)'
    };
    return map[label] || 'linear-gradient(90deg, #0369a1, #0ea5e9)';
}

function getNextStatuses(status) {
    if (status === 'OPEN' || status === 'IN_PROGRESS') {
        return ['REJECTED'];
    }
    if (status === 'RESOLVED') {
        return ['CLOSED'];
    }
    return [];
}

function normalizeFilterValue(value) {
    return value === 'ALL' ? '' : value;
}

function isLockedForAdminActions(status) {
    return status === 'CLOSED' || status === 'REJECTED';
}

function AdminTicketManagementPage() {
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [loadingTicketDetails, setLoadingTicketDetails] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [loadingAssignees, setLoadingAssignees] = useState(true);
    const [assignees, setAssignees] = useState([]);

    const [filters, setFilters] = useState({
        status: 'ALL',
        priority: 'ALL',
        category: 'ALL'
    });

    const [assigning, setAssigning] = useState(false);
    const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

    const [statusForm, setStatusForm] = useState({
        status: '',
        resolutionNotes: '',
        rejectionReason: ''
    });
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [trendRangeDays, setTrendRangeDays] = useState(7);
    const analyticsRef = useRef(null);

    useEffect(() => {
        if (showAnalytics && analyticsRef.current) {
            analyticsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [showAnalytics]);
    const categorySliceColors = ['#7c3aed', '#06b6d4', '#38bdf8', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#38bdf8', '#f97316'];

    const transitionOptions = useMemo(() => getNextStatuses(selectedTicket?.status), [selectedTicket]);
    const actionsLocked = isLockedForAdminActions(selectedTicket?.status);

    const analytics = useMemo(() => {
        const statusCounts = STATUS_OPTIONS.reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {});
        const priorityCounts = PRIORITY_OPTIONS.reduce((acc, priority) => {
            acc[priority] = 0;
            return acc;
        }, {});
        const categoryCounts = CATEGORY_OPTIONS.reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {});

        const technicianCounts = {};
        let resolutionHoursTotal = 0;
        let resolutionSamples = 0;

        tickets.forEach((ticket) => {
            if (statusCounts[ticket.status] !== undefined) {
                statusCounts[ticket.status] += 1;
            }
            if (priorityCounts[ticket.priority] !== undefined) {
                priorityCounts[ticket.priority] += 1;
            }
            if (categoryCounts[ticket.category] !== undefined) {
                categoryCounts[ticket.category] += 1;
            }

            const technicianName = ticket.assignedTechnician?.fullName;
            if (technicianName) {
                technicianCounts[technicianName] = (technicianCounts[technicianName] || 0) + 1;
            }

            if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
                const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null;
                const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt) : (ticket.updatedAt ? new Date(ticket.updatedAt) : null);
                if (createdAt && resolvedAt && !Number.isNaN(createdAt.getTime()) && !Number.isNaN(resolvedAt.getTime())) {
                    const hours = (resolvedAt.getTime() - createdAt.getTime()) / 3600000;
                    if (hours >= 0) {
                        resolutionHoursTotal += hours;
                        resolutionSamples += 1;
                    }
                }
            }
        });

        const totalTickets = tickets.length;
        const resolvedTickets = statusCounts.RESOLVED || 0;
        const rejectedTickets = statusCounts.REJECTED || 0;
        const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
        const rejectionRate = totalTickets > 0 ? (rejectedTickets / totalTickets) * 100 : 0;
        const avgResolutionHours = resolutionSamples > 0 ? resolutionHoursTotal / resolutionSamples : 0;

        const trendBuckets = [];
        const trendMap = {};
        for (let day = trendRangeDays - 1; day >= 0; day -= 1) {
            const dt = new Date();
            dt.setHours(0, 0, 0, 0);
            dt.setDate(dt.getDate() - day);
            const key = dt.toISOString().slice(0, 10);
            const label = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            trendBuckets.push({ key, label, value: 0 });
            trendMap[key] = trendBuckets[trendBuckets.length - 1];
        }

        tickets.forEach((ticket) => {
            if (!ticket.createdAt) {
                return;
            }
            const dt = new Date(ticket.createdAt);
            if (Number.isNaN(dt.getTime())) {
                return;
            }
            const key = dt.toISOString().slice(0, 10);
            if (trendMap[key]) {
                trendMap[key].value += 1;
            }
        });

        const technicianWorkload = Object.entries(technicianCounts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        const statusChart = STATUS_OPTIONS.map((status) => ({
            label: formatEnumLabel(status),
            value: statusCounts[status] || 0
        }));
        const priorityChart = PRIORITY_OPTIONS.map((priority) => ({
            label: formatEnumLabel(priority),
            value: priorityCounts[priority] || 0
        }));
        const categoryChart = CATEGORY_OPTIONS.map((category) => ({
            label: formatEnumLabel(category),
            value: categoryCounts[category] || 0
        }));

        return {
            totalTickets,
            statusCounts,
            resolvedTickets,
            rejectedTickets,
            resolutionRate,
            rejectionRate,
            avgResolutionHours,
            statusChart,
            priorityChart,
            categoryChart,
            trendBuckets,
            technicianWorkload
        };
    }, [tickets, trendRangeDays]);

    const trendPath = useMemo(() => {
        const points = analytics.trendBuckets;
        if (points.length === 0) {
            return '';
        }
        const width = 560;
        const height = 210;
        const left = 24;
        const top = 22;
        const chartWidth = width - 2 * left;
        const chartHeight = height - 2 * top;
        const maxValue = Math.max(1, ...points.map((point) => point.value));
        const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;

        return points
            .map((point, index) => {
                const x = left + index * stepX;
                const y = top + chartHeight * (1 - point.value / maxValue);
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
    }, [analytics.trendBuckets]);

    const categoryPie = useMemo(() => {
        const values = analytics.categoryChart.filter((item) => item.value > 0);
        const total = values.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            return { total: 0, slices: [] };
        }

        let currentAngle = 0;
        const slices = values.map((item, index) => {
            const portion = item.value / total;
            const angle = portion * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            return {
                ...item,
                percentage: portion * 100,
                color: categorySliceColors[index % categorySliceColors.length],
                path: describePieSlice(88, 88, 70, startAngle, endAngle),
                isFullCircle: values.length === 1
            };
        });

        return { total, slices };
    }, [analytics.categoryChart, categorySliceColors]);

    const downloadAnalyticsPdf = () => {
        const report = {
            generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            filters,
            loadedCount: tickets.length,
            trendRangeDays,
            kpis: [
                { label: 'Total Tickets', value: String(analytics.totalTickets) },
                { label: 'Open Tickets', value: String(analytics.statusCounts.OPEN || 0) },
                { label: 'In Progress', value: String(analytics.statusCounts.IN_PROGRESS || 0) },
                { label: 'Resolved', value: String(analytics.statusCounts.RESOLVED || 0) },
                { label: 'Rejected', value: String(analytics.statusCounts.REJECTED || 0) },
                { label: 'Resolution Rate', value: `${analytics.resolutionRate.toFixed(1)}%` },
                { label: 'Rejection Rate', value: `${analytics.rejectionRate.toFixed(1)}%` },
                { label: 'Avg Resolution Time', value: `${analytics.avgResolutionHours.toFixed(1)} h` }
            ],
            statusLines: analytics.statusChart.map((item) => `${item.label}: ${item.value}`),
            priorityLines: analytics.priorityChart.map((item) => `${item.label}: ${item.value}`),
            categoryLines: analytics.categoryChart
                .slice()
                .sort((a, b) => b.value - a.value)
                .slice(0, 6)
                .map((item) => `${item.label}: ${item.value}`),
            technicianLines: analytics.technicianWorkload.length > 0
                ? analytics.technicianWorkload.map((item) => `${item.label}: ${item.value}`)
                : ['No technician assignments in current data'],
            trendLines: analytics.trendBuckets.map((point) => `${point.label}: ${point.value}`)
        };

        const pdfBlob = buildSimplePdf(report);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-ticket-analytics-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const loadTickets = async () => {
        setLoadingTickets(true);
        try {
            const data = await getAllTickets({
                page: 0,
                size: 50,
                sort: 'createdAt,desc',
                status: normalizeFilterValue(filters.status) || undefined,
                priority: normalizeFilterValue(filters.priority) || undefined,
                category: normalizeFilterValue(filters.category) || undefined
            });
            const list = data?.content || [];
            setTickets(list);

            if (selectedTicket?.id) {
                const stillVisible = list.some((ticket) => ticket.id === selectedTicket.id);
                if (!stillVisible) {
                    setSelectedTicket(null);
                    setStatusForm({ status: '', resolutionNotes: '', rejectionReason: '' });
                    setSelectedAssigneeId('');
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingTickets(false);
        }
    };

    const loadAssignees = async () => {
        setLoadingAssignees(true);
        try {
            const data = await getAssignableUsers();
            setAssignees(data || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingAssignees(false);
        }
    };

    const selectTicket = async (ticketId) => {
        setLoadingTicketDetails(true);
        try {
            const details = await getTicketById(ticketId);
            setSelectedTicket(details);
            setSelectedAssigneeId(details?.assignedTechnician?.id ? String(details.assignedTechnician.id) : '');
            setStatusForm({ status: '', resolutionNotes: '', rejectionReason: '' });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingTicketDetails(false);
        }
    };

    const refreshSelectedTicket = async (ticketId) => {
        const details = await getTicketById(ticketId);
        setSelectedTicket(details);
        setSelectedAssigneeId(details?.assignedTechnician?.id ? String(details.assignedTechnician.id) : '');
    };

    const handleAssign = async (event) => {
        event.preventDefault();
        if (!selectedTicket) {
            return;
        }
        if (!selectedAssigneeId) {
            toast.error('Please choose a technician.');
            return;
        }
        if (actionsLocked) {
            toast.error('Resolved or rejected tickets cannot be assigned.');
            return;
        }

        setAssigning(true);
        try {
            await assignTicket(selectedTicket.id, Number(selectedAssigneeId));
            await Promise.all([refreshSelectedTicket(selectedTicket.id), loadTickets()]);
            toast.success('Ticket assignment updated.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setAssigning(false);
        }
    };

    const handleStatusUpdate = async (event) => {
        event.preventDefault();
        if (!selectedTicket) {
            return;
        }
        if (!statusForm.status) {
            toast.error('Please select a status transition.');
            return;
        }
        if (actionsLocked) {
            toast.error('Resolved or rejected tickets cannot be updated by admin.');
            return;
        }

        setUpdatingStatus(true);
        try {
            await updateTicketStatus(selectedTicket.id, {
                status: statusForm.status,
                resolutionNotes: statusForm.status === 'RESOLVED' ? statusForm.resolutionNotes : '',
                rejectionReason: statusForm.status === 'REJECTED' ? statusForm.rejectionReason : ''
            });
            await Promise.all([refreshSelectedTicket(selectedTicket.id), loadTickets()]);
            setStatusForm({ status: '', resolutionNotes: '', rejectionReason: '' });
            toast.success('Ticket status updated.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    useEffect(() => {
        loadAssignees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.priority, filters.category]);

    return (
        <div className="incident-shell"style={{padding:'100px'}}>
            <div className="incident-page">
                <h1 className="incident-headline">Ticket Management</h1>
                <p className="incident-subtext">Admin console for assigning tickets and enforcing workflow transitions.</p>

                <div className="incident-actions" style={{ marginTop: 0, marginBottom: '12px' }}>
                    <button
                        type="button"
                        className="incident-btn-secondary incident-btn-analytics"
                        onClick={() => setShowAnalytics((prev) => !prev)}
                    >
                        {showAnalytics ? 'Hide Analytics' : 'View Analytics Summary'}
                    </button>
                </div>

                {showAnalytics ? (
                    <div ref={analyticsRef} className="incident-analytics-inline">
                        <div className="incident-analytics-modal-inline">
                            <div className="incident-analytics-header">
                                <div>
                                    <h2 className="incident-section-title" style={{ marginBottom: '2px' }}>Analytics Summary</h2>
                                    <div className="incident-meta">Visual insights for currently loaded admin tickets</div>
                                </div>
                                <div className="incident-actions" style={{ marginTop: 0 }}>
                                    <select
                                        className="incident-select incident-analytics-range"
                                        value={trendRangeDays}
                                        onChange={(event) => setTrendRangeDays(Number(event.target.value))}
                                    >
                                        <option value={7}>Last 7 days</option>
                                        <option value={30}>Last 30 days</option>
                                    </select>
                                    <button type="button" className="incident-btn-primary" onClick={downloadAnalyticsPdf}>
                                        Download PDF
                                    </button>
                                    <button type="button" className="incident-btn-danger incident-btn-analytics-close" onClick={() => setShowAnalytics(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div className="incident-analytics-kpi-grid">
                                <div className="incident-analytics-kpi-card kpi-total"><strong>Total Tickets</strong><div>{analytics.totalTickets}</div></div>
                                <div className="incident-analytics-kpi-card kpi-open"><strong>Open Tickets</strong><div>{analytics.statusCounts.OPEN || 0}</div></div>
                                <div className="incident-analytics-kpi-card kpi-progress"><strong>In Progress</strong><div>{analytics.statusCounts.IN_PROGRESS || 0}</div></div>
                                <div className="incident-analytics-kpi-card kpi-resolved"><strong>Resolved</strong><div>{analytics.statusCounts.RESOLVED || 0}</div></div>
                                <div className="incident-analytics-kpi-card kpi-rejected"><strong>Rejected</strong><div>{analytics.statusCounts.REJECTED || 0}</div></div>
                                <div className="incident-analytics-kpi-card kpi-resolution-rate"><strong>Resolution Rate</strong><div>{analytics.resolutionRate.toFixed(1)}%</div></div>
                                <div className="incident-analytics-kpi-card kpi-rejection-rate"><strong>Rejection Rate</strong><div>{analytics.rejectionRate.toFixed(1)}%</div></div>
                                <div className="incident-analytics-kpi-card kpi-avg-time"><strong>Avg Resolution Time</strong><div>{analytics.avgResolutionHours.toFixed(1)} h</div></div>
                            </div>

                            <div className="incident-analytics-grid">
                                <div className="incident-helper-box">
                                    <div className="incident-helper-title">Tickets By Status</div>
                                    {analytics.statusChart.map((item) => {
                                        const max = Math.max(1, ...analytics.statusChart.map((entry) => entry.value));
                                        const width = (item.value / max) * 100;
                                        return (
                                            <div key={item.label} className="incident-analytics-bar-row">
                                                <span>{item.label}</span>
                                                <div className="incident-analytics-bar-track">
                                                    <div
                                                        className="incident-analytics-bar-fill"
                                                        style={{
                                                            width: `${width}%`,
                                                            background: getStatusBarColor(item.label)
                                                        }}
                                                    />
                                                </div>
                                                <strong>{item.value}</strong>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="incident-helper-box">
                                    <div className="incident-helper-title">Tickets By Priority</div>
                                    {analytics.priorityChart.map((item) => {
                                        const max = Math.max(1, ...analytics.priorityChart.map((entry) => entry.value));
                                        const width = (item.value / max) * 100;
                                        return (
                                            <div key={item.label} className="incident-analytics-bar-row">
                                                <span>{item.label}</span>
                                                <div className="incident-analytics-bar-track">
                                                    <div
                                                        className="incident-analytics-bar-fill"
                                                        style={{
                                                            width: `${width}%`,
                                                            background: getPriorityBarColor(item.label)
                                                        }}
                                                    />
                                                </div>
                                                <strong>{item.value}</strong>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="incident-helper-box">
                                    <div className="incident-helper-title">Tickets By Category</div>
                                    {categoryPie.total === 0 ? (
                                        <div className="incident-meta">No category data in current selection.</div>
                                    ) : (
                                        <div className="incident-analytics-pie-layout">
                                            <svg className="incident-analytics-pie-chart" viewBox="0 0 176 176" role="img" aria-label="Tickets by category pie chart">
                                                <circle cx="88" cy="88" r="70" fill="#eef2ff" />
                                                {categoryPie.slices.map((slice) => (
                                                    slice.isFullCircle ? (
                                                        <circle
                                                            key={slice.label}
                                                            cx="88"
                                                            cy="88"
                                                            r="70"
                                                            fill={slice.color}
                                                        />
                                                    ) : (
                                                        <path
                                                            key={slice.label}
                                                            d={slice.path}
                                                            fill={slice.color}
                                                            stroke="#ffffff"
                                                            strokeWidth="1"
                                                        />
                                                    )
                                                ))}
                                                <circle cx="88" cy="88" r="37" fill="#ffffff" />
                                                <text x="88" y="85" textAnchor="middle" className="incident-analytics-pie-center-label">Total</text>
                                                <text x="88" y="103" textAnchor="middle" className="incident-analytics-pie-center-value">{categoryPie.total}</text>
                                            </svg>
                                            <div className="incident-analytics-pie-legend">
                                                {categoryPie.slices.map((slice) => (
                                                    <div key={slice.label} className="incident-analytics-pie-legend-item">
                                                        <span className="incident-analytics-pie-dot" style={{ backgroundColor: slice.color }} />
                                                        <span>{slice.label}</span>
                                                        <strong>{slice.value} ({slice.percentage.toFixed(1)}%)</strong>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="incident-helper-box">
                                    <div className="incident-helper-title">Technician Workload</div>
                                    {analytics.technicianWorkload.length === 0 ? (
                                        <div className="incident-meta">No technician assignments in current data.</div>
                                    ) : analytics.technicianWorkload.map((item) => {
                                        const max = Math.max(1, ...analytics.technicianWorkload.map((entry) => entry.value));
                                        const width = (item.value / max) * 100;
                                        return (
                                            <div key={item.label} className="incident-analytics-bar-row">
                                                <span>{item.label}</span>
                                                <div className="incident-analytics-bar-track">
                                                    <div className="incident-analytics-bar-fill technician" style={{ width: `${width}%` }} />
                                                </div>
                                                <strong>{item.value}</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="incident-helper-box" style={{ marginTop: '12px' }}>
                                <div className="incident-helper-title">Daily Ticket Trend ({trendRangeDays} Days)</div>
                                <svg className="incident-trend-chart" viewBox="0 0 560 210" role="img" aria-label="Daily ticket trend">
                                    <line x1="24" y1="188" x2="536" y2="188" stroke="rgba(240,249,255,0.75)" strokeWidth="1" />
                                    <polyline
                                        fill="none"
                                        stroke="#0ea5e9"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={trendPath}
                                    />
                                    {analytics.trendBuckets.map((point, index) => {
                                        const maxValue = Math.max(1, ...analytics.trendBuckets.map((entry) => entry.value));
                                        const x = 24 + ((analytics.trendBuckets.length > 1 ? 512 / (analytics.trendBuckets.length - 1) : 0) * index);
                                        const y = 22 + 166 * (1 - point.value / maxValue);
                                        return <circle key={`${point.key}-${point.value}`} cx={x} cy={y} r="3" fill="#0ea5e9" />;
                                    })}
                                </svg>
                                <div className="incident-analytics-trend-labels">
                                    {analytics.trendBuckets.map((point) => (
                                        <span key={point.key}>{point.label} ({point.value})</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="incident-card" style={{ marginBottom: '14px' }}>
                    <div className="incident-grid">
                        <div>
                            <label className="incident-label">Status</label>
                            <select
                                className="incident-select"
                                value={filters.status}
                                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="ALL">All statuses</option>
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="incident-label">Priority</label>
                            <select
                                className="incident-select"
                                value={filters.priority}
                                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                            >
                                <option value="ALL">All priorities</option>
                                {PRIORITY_OPTIONS.map((priority) => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="incident-label">Category</label>
                            <select
                                className="incident-select"
                                value={filters.category}
                                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="ALL">All categories</option>
                                {CATEGORY_OPTIONS.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="incident-admin-grid">
                    <div className="incident-card">
                        <h2 className="incident-section-title">Tickets</h2>
                        {loadingTickets ? (
                            <div className="incident-loading">
                                <div className="incident-loading-spinner" />
                                <div className="incident-loading-text">Loading tickets...</div>
                            </div>
                        ) : null}

                        {!loadingTickets && tickets.length === 0 ? (
                            <div>No tickets found for the selected filters.</div>
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
                                            Assigned: {ticket.assignedTechnician?.fullName || 'Unassigned'}
                                        </div>

                                        <div className="incident-actions" style={{ marginTop: '10px' }}>
                                            <button
                                                type="button"
                                                className="incident-btn-secondary"
                                                onClick={() => selectTicket(ticket.id)}
                                            >
                                                Manage
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    <div className="incident-card">
                        <h2 className="incident-section-title">Selected Ticket</h2>

                        {loadingTicketDetails ? (
                            <div className="incident-loading">
                                <div className="incident-loading-spinner" />
                                <div className="incident-loading-text">Loading ticket details...</div>
                            </div>
                        ) : null}

                        {!loadingTicketDetails && !selectedTicket ? (
                            <div>Select a ticket to assign a user or update status.</div>
                        ) : null}

                        {!loadingTicketDetails && selectedTicket ? (
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
                                        <strong>Created By</strong>
                                        <div>{selectedTicket.createdBy?.fullName || '-'}</div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Current Assignee</strong>
                                        <div>{selectedTicket.assignedTechnician?.fullName || 'Unassigned'}</div>
                                    </div>
                                    <div className="incident-kv incident-grid-full">
                                        <strong>Description</strong>
                                        <div>{selectedTicket.description}</div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Created At</strong>
                                        <div>{formatDate(selectedTicket.createdAt)}</div>
                                    </div>
                                    <div className="incident-kv">
                                        <strong>Updated At</strong>
                                        <div>{formatDate(selectedTicket.updatedAt)}</div>
                                    </div>
                                </div>

                                <div className="incident-actions" style={{ marginTop: 0, marginBottom: '16px' }}>
                                    <Link className="incident-btn-ghost" to={`/incidents/${selectedTicket.id}`}>
                                        Open Full Details
                                    </Link>
                                </div>

                                <form onSubmit={handleAssign} className="incident-helper-box" style={{ marginBottom: '16px' }}>
                                    <div className="incident-helper-title">Assign Technician</div>
                                    <label className="incident-label">Assignee</label>
                                    <select
                                        className="incident-select"
                                        value={selectedAssigneeId}
                                        onChange={(e) => setSelectedAssigneeId(e.target.value)}
                                        disabled={loadingAssignees || assigning || actionsLocked}
                                    >
                                        <option value="">Select technician</option>
                                        {assignees.map((person) => (
                                            <option key={person.id} value={person.id}>
                                                {person.fullName} ({person.role})
                                            </option>
                                        ))}
                                    </select>

                                    <div className="incident-actions">
                                        <button
                                            type="submit"
                                            className="incident-btn-primary"
                                            disabled={loadingAssignees || assigning || actionsLocked}
                                        >
                                            {assigning ? 'Assigning...' : 'Update Assignment'}
                                        </button>
                                    </div>
                                </form>

                                <form onSubmit={handleStatusUpdate} className="incident-helper-box">
                                    <div className="incident-helper-title">Update Ticket Status</div>
                                    <label className="incident-label">Next status</label>
                                    <select
                                        className="incident-select"
                                        value={statusForm.status}
                                        onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
                                        disabled={updatingStatus || transitionOptions.length === 0 || actionsLocked}
                                    >
                                        <option value="">Select status</option>
                                        {transitionOptions.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>

                                    {statusForm.status === 'REJECTED' ? (
                                        <>
                                            <label className="incident-label" style={{ marginTop: '10px' }}>Rejection Reason</label>
                                            <textarea
                                                className="incident-textarea"
                                                value={statusForm.rejectionReason}
                                                onChange={(e) => setStatusForm((prev) => ({ ...prev, rejectionReason: e.target.value }))}
                                                placeholder="Explain why this ticket is being rejected"
                                                maxLength={1000}
                                            />
                                        </>
                                    ) : null}

                                    {transitionOptions.length === 0 ? (
                                        <div className="incident-meta" style={{ marginTop: '10px' }}>
                                            Admin can reject OPEN/IN_PROGRESS tickets, or close RESOLVED tickets.
                                        </div>
                                    ) : null}

                                    {actionsLocked ? (
                                        <div className="incident-meta" style={{ marginTop: '10px' }}>
                                            This ticket is {selectedTicket.status} and cannot be updated further.
                                        </div>
                                    ) : null}

                                    <div className="incident-actions">
                                        <button
                                            type="submit"
                                            className="incident-btn-primary"
                                            disabled={updatingStatus || transitionOptions.length === 0 || actionsLocked}
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

export default AdminTicketManagementPage;

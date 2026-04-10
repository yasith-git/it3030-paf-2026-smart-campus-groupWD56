import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Navbar() {
    const location = useLocation();
    const { user, logout, loading } = useAuth();
    const isLoggedIn = !!user;
    const dropdownRef = useRef(null);

    const [unreadCount, setUnreadCount]       = useState(0);
    const [mobileOpen, setMobileOpen]         = useState(false);
    const [adminOpen, setAdminOpen]           = useState(false);
    const [scrolled, setScrolled]             = useState(false);

    const fetchUnread = useCallback(async () => {
        try {
            const r = await axios.get('http://localhost:8080/api/v1/notifications/unread-count', { withCredentials: true });
            setUnreadCount(r.data);
        } catch (_) {}
    }, []);

    useEffect(() => {
        if (isLoggedIn) { fetchUnread(); const t = setInterval(fetchUnread, 30000); return () => clearInterval(t); }
    }, [isLoggedIn, fetchUnread]);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const fn = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setAdminOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    useEffect(() => { setMobileOpen(false); setAdminOpen(false); }, [location.pathname]);

    if (loading) return null;

    const isAdmin      = user?.role === 'ADMIN';
    const isTech       = user?.role === 'TECHNICIAN';
    const isStaff      = user?.role === 'STAFF';
    const isStudent    = user?.role === 'STUDENT';
    const displayName  = user?.username || (user?.email ? user.email.split('@')[0] : 'User');
    const isActive     = (p) => location.pathname === p;

    const ROLE_COLOR = {
        ADMIN:      { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.25)', text: '#ffffff' },
        TECHNICIAN: { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',   text: '#fbbf24' },
        STAFF:      { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.28)',  text: '#34d399' },
        STUDENT:    { bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.28)',  text: '#38bdf8' },
    };
    const rc = ROLE_COLOR[user?.role] || ROLE_COLOR.STUDENT;

    const lnkStyle = (path) => ({
        color: isActive(path) ? '#38bdf8' : 'rgba(240,249,255,0.82)',
        textDecoration: 'none',
        fontSize: '0.865rem',
        fontWeight: isActive(path) ? '700' : '500',
        padding: '6px 14px',
        borderRadius: '10px',
        background: isActive(path) ? 'rgba(56,189,248,0.12)' : 'transparent',
        border: isActive(path) ? '1px solid rgba(56,189,248,0.28)' : '1px solid transparent',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        display: 'flex',
        alignItems: 'center',
    });

    return (
        <>
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                padding: scrolled ? '0' : '10px 16px',
                transition: 'padding 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}>
                <nav style={{
                    maxWidth: scrolled ? '100%' : '1440px',
                    margin: '0 auto',
                    background: scrolled ? 'rgba(4, 9, 15, 0.78)' : 'rgba(4, 9, 15, 0.12)',
                    backdropFilter: 'blur(48px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(48px) saturate(180%)',
                    borderRadius: scrolled ? '0' : '18px',
                    border: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.14)',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: scrolled
                        ? '0 2px 48px rgba(0,0,0,0.55), inset 0 -1px 0 rgba(255,255,255,0.04)'
                        : '0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 24px',
                        height: scrolled ? '56px' : '62px',
                        transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)',
                        gap: '12px',
                    }}>
                        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '11px', flexShrink: 0 }}>
                            {/* SVG Logo */}
                            <div style={{
                                width: '38px', height: '38px', flexShrink: 0,
                                filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.45))',
                                transition: 'filter 0.25s ease',
                            }}>
                                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="logoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#0369a1"/>
                                            <stop offset="50%" stopColor="#0ea5e9"/>
                                            <stop offset="100%" stopColor="#38bdf8"/>
                                        </linearGradient>
                                        <linearGradient id="logoShine" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.35)"/>
                                            <stop offset="100%" stopColor="rgba(255,255,255,0.05)"/>
                                        </linearGradient>
                                    </defs>
                                    {/* Hexagonal base */}
                                    <path d="M19 2 L34 10.5 L34 27.5 L19 36 L4 27.5 L4 10.5 Z" fill="url(#logoGrad)"/>
                                    {/* Inner highlight ring */}
                                    <path d="M19 5 L31 12 L31 26 L19 33 L7 26 L7 12 Z" fill="none" stroke="url(#logoShine)" strokeWidth="1"/>
                                    {/* Stylized N letter */}
                                    <path d="M12 26 L12 12 L26 26 L26 12" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                    {/* Accent dot top */}
                                    <circle cx="26" cy="10" r="2.5" fill="#7dd3fc" opacity="0.9"/>
                                </svg>
                            </div>
                            <div>
                                <span style={{
                                    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
                                    fontWeight: '800', fontSize: '1.12rem',
                                    background: 'linear-gradient(120deg, #e0f2fe 10%, #38bdf8 55%, #7dd3fc 90%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text', letterSpacing: '-0.025em',
                                    display: 'block', lineHeight: 1,
                                }}>NovaCampus</span>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: '600', letterSpacing: '0.12em',
                                    color: 'rgba(56,189,248,0.65)', textTransform: 'uppercase',
                                    display: 'block', lineHeight: 1, marginTop: '2px',
                                }}>Smart Operations</span>
                            </div>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }} className="desktop-nav">
                            <Link to="/"          style={lnkStyle('/')}>Home</Link>
                            <Link to="/about"     style={lnkStyle('/about')}>About</Link>
                            <Link to="/contact"   style={lnkStyle('/contact')}>Contact</Link>
                            <Link to="/resources" style={lnkStyle('/resources')}>Resources</Link>
                            {isLoggedIn && (
                                <>
                                    <Link to="/bookings"     style={lnkStyle('/bookings')}>Bookings</Link>
                                    {(isStudent || isStaff || isAdmin) && (
                                        <Link to="/bookings/new" style={lnkStyle('/bookings/new')}>New Booking</Link>
                                    )}
                                    {(isStudent || isStaff) && (
                                        <>
                                            <Link to="/incidents"     style={lnkStyle('/incidents')}>My Tickets</Link>
                                            <Link to="/incidents/new" style={lnkStyle('/incidents/new')}>Report Issue</Link>
                                        </>
                                    )}
                                    {isAdmin && (
                                        <Link to="/incidents/new" style={lnkStyle('/incidents/new')}>Report Issue</Link>
                                    )}
                                    {isTech && !isAdmin && (
                                        <Link to="/technician/tickets" style={lnkStyle('/technician/tickets')}>Ticket Updates</Link>
                                    )}
                                </>
                            )}
                            {isLoggedIn && isAdmin && (
                                <div ref={dropdownRef} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setAdminOpen(!adminOpen)}
                                        style={{
                                            background: adminOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${adminOpen ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}`,
                                            color: '#ffffff',
                                            fontSize: '0.865rem', fontWeight: '600',
                                            padding: '6px 14px', cursor: 'pointer', borderRadius: '10px',
                                            transition: 'all 0.2s ease',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
                                        }}
                                    >
                                        Admin
                                        <svg style={{ transform: adminOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}
                                            width="11" height="11" viewBox="0 0 12 12" fill="none">
                                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    {adminOpen && (
                                        <div style={{
                                            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                            background: 'rgba(7,18,32,0.95)',
                                            backdropFilter: 'blur(48px) saturate(180%)',
                                            WebkitBackdropFilter: 'blur(48px) saturate(180%)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            borderRadius: '16px', padding: '8px',
                                            minWidth: '240px',
                                            boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
                                            zIndex: 200,
                                        }}>
                                            {[
                                                { to: '/admin/resources',        icon: '🗂️', label: 'Resource Management' },
                                                { to: '/admin/resources/summary',icon: '📊', label: 'Resource Summary' },
                                                { to: '/admin/tickets',          icon: '🎫', label: 'Ticket Management' },
                                                { to: '/admin/users',            icon: '👥', label: 'User Management' },
                                                { to: '/admin/bookings',         icon: '📅', label: 'Booking Approvals' },
                                                { to: '/admin/user-summary',     icon: '📋', label: 'User Overview' },
                                            ].map(item => (
                                                <Link key={item.to} to={item.to}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px',
                                                        padding: '10px 14px',
                                                        color: isActive(item.to) ? '#38bdf8' : 'rgba(240,249,255,0.82)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.86rem', fontWeight: '500',
                                                        borderRadius: '10px',
                                                        background: isActive(item.to) ? 'rgba(56,189,248,0.1)' : 'transparent',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#f0f9ff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = isActive(item.to) ? 'rgba(56,189,248,0.1)' : 'transparent'; e.currentTarget.style.color = isActive(item.to) ? '#38bdf8' : 'rgba(240,249,255,0.82)'; }}
                                                    onClick={() => setAdminOpen(false)}
                                                >
                                                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {isLoggedIn ? (
                                <>
                                    {/* ── Notification Bell ── */}
                                    <Link to="/notifications" style={{ position: 'relative', textDecoration: 'none', display: 'inline-flex', flexShrink: 0 }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '50%',
                                            border: unreadCount > 0 ? '1.5px solid rgba(56,189,248,0.45)' : '1px solid rgba(255,255,255,0.13)',
                                            background: unreadCount > 0 ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.06)',
                                            backdropFilter: 'blur(16px)',
                                            WebkitBackdropFilter: 'blur(16px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.25s ease',
                                            boxShadow: unreadCount > 0 ? '0 0 14px rgba(56,189,248,0.22)' : 'none',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.18)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(56,189,248,0.3)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = unreadCount > 0 ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = unreadCount > 0 ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.13)'; e.currentTarget.style.boxShadow = unreadCount > 0 ? '0 0 14px rgba(56,189,248,0.22)' : 'none'; }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={unreadCount > 0 ? '#38bdf8' : 'rgba(240,249,255,0.75)'} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                            </svg>
                                        </div>
                                        {unreadCount > 0 && (
                                            <span style={{
                                                position: 'absolute', top: '-3px', right: '-3px',
                                                background: 'linear-gradient(135deg, #f87171, #ef4444)',
                                                color: '#fff', fontSize: '9px', fontWeight: '800',
                                                padding: '2px 5px', borderRadius: '20px',
                                                minWidth: '17px', textAlign: 'center',
                                                boxShadow: '0 2px 12px rgba(239,68,68,0.7)',
                                                lineHeight: 1.4, letterSpacing: '0.02em',
                                                animation: 'nbPulse 2s ease-in-out infinite',
                                            }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                                        )}
                                    </Link>

                                    {/* ── Unified Identity Chip: Avatar + Name/Role + Divider + Power Icon ── */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0',
                                        background: 'rgba(255,255,255,0.07)',
                                        backdropFilter: 'blur(24px) saturate(150%)',
                                        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                                        border: '1px solid rgba(255,255,255,0.11)',
                                        borderRadius: '24px',
                                        padding: '4px 4px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                                        transition: 'box-shadow 0.2s',
                                    }}>
                                        {/* Avatar with role-colour ring */}
                                        <div style={{
                                            width: '30px', height: '30px', borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${rc.bg} 0%, ${rc.border} 100%)`,
                                            border: `2px solid ${rc.border}`,
                                            boxShadow: `0 0 10px ${rc.border}55`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '12px', fontWeight: '800', color: rc.text,
                                            flexShrink: 0,
                                        }}>{displayName.charAt(0).toUpperCase()}</div>

                                        {/* Name + role badge */}
                                        <div style={{ padding: '0 10px 0 8px', minWidth: 0 }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f0f9ff', maxWidth: '88px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 }}>{displayName}</div>
                                            <div style={{
                                                display: 'inline-block',
                                                fontSize: '0.58rem', fontWeight: '800', color: rc.text,
                                                background: `${rc.bg}55`,
                                                border: `1px solid ${rc.border}55`,
                                                borderRadius: '6px', padding: '1px 5px',
                                                textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.5,
                                                marginTop: '2px',
                                            }}>{user?.role}</div>
                                        </div>

                                        {/* Vertical divider */}
                                        <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.12)', flexShrink: 0, marginRight: '2px' }} />

                                        {/* Sign-out power icon */}
                                        <button onClick={logout}
                                            title="Sign Out"
                                            style={{
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'rgba(240,249,255,0.45)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
                                                padding: 0,
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,249,255,0.45)'; e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link to="/login" style={{
                                    background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                                    color: '#fff', fontSize: '0.875rem', fontWeight: '700',
                                    padding: '8px 22px', borderRadius: '11px',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 20px rgba(56,189,248,0.38), inset 0 1px 0 rgba(255,255,255,0.25)',
                                    letterSpacing: '0.01em',
                                    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
                                }}>Sign In</Link>
                            )}

                            <button onClick={() => setMobileOpen(!mobileOpen)}
                                className="mobile-menu-btn" aria-label="Open menu"
                                style={{
                                    background: mobileOpen ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.07)',
                                    border: `1px solid ${mobileOpen ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '10px', color: '#f0f9ff',
                                    cursor: 'pointer', padding: '8px 9px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                }}>
                                {mobileOpen
                                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                                }
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {mobileOpen && (
                <>
                    <div onClick={() => setMobileOpen(false)} style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(4,9,15,0.75)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        zIndex: 1001,
                    }} />
                    <div style={{
                        position: 'fixed', top: 0, right: 0, bottom: 0, width: '290px',
                        background: 'rgba(7,18,32,0.97)',
                        backdropFilter: 'blur(48px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(48px) saturate(180%)',
                        borderLeft: '1px solid rgba(255,255,255,0.10)',
                        zIndex: 1002, padding: '78px 12px 28px',
                        overflowY: 'auto',
                        boxShadow: '-16px 0 60px rgba(0,0,0,0.6)',
                    }}>
                        {isLoggedIn && (
                            <div style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px', padding: '14px 16px',
                                marginBottom: '16px',
                                display: 'flex', alignItems: 'center', gap: '12px',
                            }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '10px',
                                    background: `linear-gradient(135deg, ${rc.bg}, ${rc.border})`,
                                    border: `1px solid ${rc.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '16px', fontWeight: '800', color: rc.text, flexShrink: 0,
                                }}>{displayName.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f0f9ff' }}>{displayName}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: rc.text, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{user?.role}</div>
                                </div>
                            </div>
                        )}
                        {[
                            { to: '/', label: '🏠  Home' },
                            { to: '/about', label: '📖  About' },
                            { to: '/contact', label: '✉️  Contact' },
                            { to: '/resources', label: '🏛️  Resources' },
                            ...(isLoggedIn ? [
                                { to: '/bookings', label: '📅  Bookings' },
                                ...((isStudent || isStaff || isAdmin) ? [{ to: '/bookings/new', label: '➕  New Booking' }] : []),
                                ...((isStudent || isStaff) && !isAdmin ? [{ to: '/incidents', label: '🎫  My Tickets' }, { to: '/incidents/new', label: '🔧  Report Issue' }] : []),
                                ...(isTech ? [{ to: '/technician/tickets', label: '🛠️  Ticket Updates' }] : []),
                                ...(isAdmin ? [
                                    { to: '/admin/resources', label: '🗂️  Resource Management' },
                                    { to: '/admin/tickets', label: '🎫  Ticket Management' },
                                    { to: '/admin/users', label: '👥  User Management' },
                                    { to: '/admin/bookings', label: '📅  Booking Approvals' },
                                    { to: '/admin/user-summary', label: '📋  User Overview' },
                                ] : []),
                                { to: '/notifications', label: '🔔  Notifications' },
                            ] : []),
                        ].map(item => (
                            <Link key={item.to} to={item.to}
                                style={{
                                    color: isActive(item.to) ? '#38bdf8' : 'rgba(240,249,255,0.85)',
                                    textDecoration: 'none',
                                    fontSize: '0.92rem', fontWeight: isActive(item.to) ? '700' : '500',
                                    padding: '12px 14px',
                                    display: 'block', borderRadius: '12px',
                                    background: isActive(item.to) ? 'rgba(56,189,248,0.1)' : 'transparent',
                                    border: isActive(item.to) ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
                                    marginBottom: '3px', transition: 'all 0.15s ease',
                                }}
                                onClick={() => setMobileOpen(false)}
                            >{item.label}</Link>
                        ))}
                        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                            {isLoggedIn
                                ? <button onClick={() => { logout(); setMobileOpen(false); }} style={{ width: '100%', padding: '12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.28)', color: '#fca5a5', fontSize: '0.9rem', fontWeight: '600', borderRadius: '12px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>Sign Out</button>
                                : <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: '#fff', fontSize: '0.9rem', fontWeight: '700', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(56,189,248,0.35)' }}>Sign In</Link>
                            }
                        </div>
                    </div>
                </>
            )}
            <style>{`
                @keyframes nbPulse {
                    0%, 100% { box-shadow: 0 2px 12px rgba(239,68,68,0.7); transform: scale(1); }
                    50% { box-shadow: 0 2px 20px rgba(239,68,68,0.95); transform: scale(1.12); }
                }
            `}</style>
        </>
    );
}

export default Navbar;

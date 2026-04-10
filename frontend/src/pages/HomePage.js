import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import campusResourceImg from '../assets/carousel/campus-resource.jpg';
import bookingImg from '../assets/carousel/computerlab.jpg';
import incidentImg from '../assets/carousel/studentarea.jpg';
import notificationImg from '../assets/carousel/library.jpg';

function HomePage() {
    const { user, loading } = useAuth();
    const isLoggedIn = !!user;

    const isAdmin = user?.role === 'ADMIN';
    const isTechnician = user?.role === 'TECHNICIAN';
    const isStaff = user?.role === 'STAFF';
    const isStudent = user?.role === 'STUDENT';

    const [currentSlide, setCurrentSlide] = useState(0);

    const carouselSlides = [
        {
            title: 'Book Campus Resources',
            subtitle: 'Smart access to lecture halls, labs, and meeting rooms with real-time availability.',
            icon: '🏛️',
            image: campusResourceImg,
            features: ['24/7 Availability', 'Instant Confirmation', 'Conflict Checking']
        },
        {
            title: 'Track Every Booking',
            subtitle: 'Monitor approvals, rejections, and schedules in real time from your personalized dashboard.',
            icon: '📅',
            image: bookingImg,
            features: ['Real-time Updates', 'Status Tracking', 'History Logs']
        },
        {
            title: 'Report Incidents Fast',
            subtitle: 'Raise maintenance issues and follow progress with ease through our advanced ticketing system.',
            icon: '🔧',
            image: incidentImg,
            features: ['Priority Levels', 'Photo Upload', 'Live Tracking']
        },
        {
            title: 'Smart Notifications',
            subtitle: 'Get instant alerts for booking approvals, ticket updates, and important campus announcements.',
            icon: '🔔',
            image: notificationImg,
            features: ['Email Alerts', 'In-app Notifications', 'Real-time Updates']
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [carouselSlides.length]);

    const features = [
        {
            icon: '🏛️',
            title: 'Smart Resource Access',
            description: 'Browse lecture halls, labs, meeting rooms, and campus facilities in one place.',
            link: '/resources',
            linkText: 'Browse Resources',
            available: true
        },
        {
            icon: '🗂️',
            title: 'Resource Management',
            description: 'Admins can add, update, and remove lecture halls, labs, rooms, and equipment from the system.',
            link: '/admin/resources',
            linkText: 'Manage Resources',
            available: isAdmin
        },
        {
            icon: '📅',
            title: 'Booking Management',
            description: 'Track your facility bookings, approvals, rejections, and schedules without confusion.',
            link: '/bookings',
            linkText: 'My Bookings',
            available: isLoggedIn
        },
        {
            icon: '➕',
            title: 'Quick Booking',
            description: 'Create a new booking request fast with date, time, resource, purpose, and attendee details.',
            link: '/bookings/new',
            linkText: 'Book Now',
            available: isStudent || isStaff || isAdmin
        },
        {
            icon: '🔧',
            title: 'Incident Reporting',
            description: 'Report campus issues, damaged assets, or maintenance problems and track progress.',
            link: isTechnician ? '/technician/tickets' : '/incidents/new',
            linkText: isTechnician ? 'Ticket Updates' : 'Report Incident',
            available: isLoggedIn
        },
        {
            icon: '🔔',
            title: 'Live Notifications',
            description: 'Stay updated with booking approvals, incident changes, and important campus alerts.',
            link: '/notifications',
            linkText: 'View Notifications',
            available: isLoggedIn
        },
        {
            icon: '🛠️',
            title: 'Technician Workspace',
            description: 'Technicians can manage assigned tickets, update status, and add resolution notes.',
            link: '/technician/tickets',
            linkText: 'Go to Panel',
            available: isTechnician || isAdmin
        },
        {
            icon: '👔',
            title: 'Staff Operations',
            description: 'Staff users can manage operational activities and access their dedicated workspace.',
            link: '/bookings',
            linkText: 'My Bookings',
            available: isStaff
        },
        {
            icon: '⚙️',
            title: 'Admin Control Center',
            description: 'Admins can manage bookings, users, incidents, and approvals from one dashboard.',
            link: '/admin/bookings',
            linkText: 'Go to Panel',
            available: isAdmin
        }
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Student',
            text: 'The booking system has made reserving lab spaces so much easier.',
            initial: 'SJ'
        },
        {
            name: 'Prof. Michael Chen',
            role: 'Faculty',
            text: 'Incident reporting is quick and efficient. Our team responds much faster now.',
            initial: 'MC'
        },
        {
            name: 'Dr. Emily Rodriguez',
            role: 'Campus Director',
            text: 'The admin panel gives me complete control over campus resources.',
            initial: 'ER'
        }
    ];

    // Gradient heading style with animation
    const gradientHeadingStyle = {
        fontSize: '3rem',
        lineHeight: '1.2',
        fontWeight: '800',
        marginBottom: '20px',
        letterSpacing: '-0.02em',
        animation: 'gradientFade 4s ease-in-out infinite',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.07), #1d4ed8, #38bdf8, rgba(255,255,255,0.05))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        backgroundSize: '300% 300%'
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading NovaCampus...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* ===== HERO SECTION — Full-width image background ===== */}
            <div style={styles.heroWrapper}>
                {/* Background images — crossfade between slides */}
                {carouselSlides.map((slide, i) => (
                    <div key={i} style={{
                        position: 'absolute', inset: 0, zIndex: 0,
                        backgroundImage: `url(${slide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: currentSlide === i ? 1 : 0,
                        transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                ))}
                {/* Layered overlay — dark + gradient tint */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(180deg, rgba(4,9,15,0.55) 0%, rgba(4,9,15,0.40) 40%, rgba(4,9,15,0.70) 85%, rgba(4,9,15,0.92) 100%)',
                }} />
                {/* Blue ambient light from top-left */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2,
                    background: 'radial-gradient(ellipse 70% 50% at 20% 20%, rgba(56,189,248,0.18) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />

                {/* ---- Centered hero content ---- */}
                <div style={styles.heroContent}>
                    {/* Badge */}
                    {isLoggedIn ? (
                        <div style={styles.welcomeBadge}>
                            Welcome back, {user?.username}
                        </div>
                    ) : (
                        <div style={styles.welcomeBadge}>
                            ✨ Smart Campus, Better Workflow
                        </div>
                    )}

                    {/* Campus Name — large centered */}
                    <div style={styles.heroLogoWrap}>
                        <svg width="56" height="56" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.7))' }}>
                            <defs>
                                <linearGradient id="heroLogoG" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#0369a1"/><stop offset="50%" stopColor="#0ea5e9"/><stop offset="100%" stopColor="#38bdf8"/>
                                </linearGradient>
                            </defs>
                            <path d="M19 2 L34 10.5 L34 27.5 L19 36 L4 27.5 L4 10.5 Z" fill="url(#heroLogoG)"/>
                            <path d="M19 5 L31 12 L31 26 L19 33 L7 26 L7 12 Z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
                            <path d="M12 26 L12 12 L26 26 L26 12" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                    </div>
                    <h1 style={styles.heroCampusName}>NovaCampus</h1>
                    <p style={styles.heroTagline}>Smart Campus Operations Hub</p>

                    {isLoggedIn ? (
                        <p style={styles.heroDescription}>
                            Manage resources, bookings, incidents and campus workflows from one modern platform.
                        </p>
                    ) : (
                        <p style={styles.heroDescription}>
                            Book facilities, report campus issues, manage workflows, and stay informed with a smooth modern experience.
                        </p>
                    )}

                    <div style={styles.buttonGroup}>
                        <Link to="/resources" style={styles.secondaryButton}>Browse Resources</Link>
                        {isLoggedIn ? (
                            <>
                                {(isStudent || isStaff || isAdmin) && (
                                    <Link to="/bookings/new" style={styles.primaryButton}>Book a Resource →</Link>
                                )}
                                <Link to="/bookings" style={styles.secondaryButton}>My Bookings</Link>
                            </>
                        ) : (
                            <Link to="/login" style={styles.primaryButton}>Get Started →</Link>
                        )}
                    </div>
                </div>

                {/* Slide indicator dots + slide info at bottom */}
                <div style={styles.heroBottom}>
                    <div style={styles.slideInfoCard}>
                        <span style={styles.slideInfoIcon}>{carouselSlides[currentSlide].icon}</span>
                        <div>
                            <div style={styles.slideInfoTitle}>{carouselSlides[currentSlide].title}</div>
                            <div style={styles.slideInfoSub}>{carouselSlides[currentSlide].features.join(' · ')}</div>
                        </div>
                    </div>
                    <div style={styles.heroDots}>
                        {carouselSlides.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} style={{
                                width: currentSlide === i ? '28px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                border: 'none',
                                background: currentSlide === i ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.35s ease',
                                padding: 0,
                            }} />
                        ))}
                    </div>
                </div>
            </div>
            {/* Stats Row */}
            <div style={{ padding: '0 20px 64px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '16px',
                    }}>
                        {[
                            { value: '500+', label: 'Active Users', icon: '👥' },
                            { value: '1,200+', label: 'Bookings Made', icon: '📅' },
                            { value: '95%', label: 'Satisfaction Rate', icon: '⭐' },
                            { value: '24/7', label: 'System Uptime', icon: '🔒' },
                            { value: '60+', label: 'Campus Resources', icon: '🏛️' },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                background: 'transparent',
                                backdropFilter: 'blur(32px) saturate(140%)',
                                WebkitBackdropFilter: 'blur(32px) saturate(140%)',
                                border: '1px solid rgba(255,255,255,0.11)',
                                borderRadius: '16px',
                                padding: '20px',
                                textAlign: 'center',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                            }}>
                                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{stat.icon}</div>
                                <div style={{
                                    fontSize: '1.5rem', fontWeight: '800',
                                    background: 'linear-gradient(120deg, #f0f9ff, #38bdf8)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>{stat.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(240,249,255,0.6)', fontWeight: '500', marginTop: '2px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div style={styles.featuresSection}>
                <div style={styles.container}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionLabel}>What We Offer</div>
                        <h2 style={styles.sectionTitle}>Platform Features</h2>
                        <p style={styles.sectionDescription}>
                            Everything needed for modern campus operations
                        </p>
                    </div>

                    <div style={styles.featuresGrid}>
                        {features.filter(f => f.available).map((feature, index) => (
                            <div key={index} style={styles.featureCard} className="feature-card">
                                <div style={styles.featureIcon}>{feature.icon}</div>
                                <h3 style={styles.featureTitle}>{feature.title}</h3>
                                <p style={styles.featureDescription}>{feature.description}</p>
                                <div style={styles.featureFooter}>
                                    <Link to={feature.link} style={styles.featureLink}>
                                        {feature.linkText} →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonial Section */}
            <div style={styles.testimonialSection}>
                <div style={styles.container}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionLabel}>Testimonials</div>
                        <h2 style={styles.sectionTitle}>What Our Users Say</h2>
                        <p style={styles.sectionDescription}>
                            Trusted by students, faculty, and staff across campus
                        </p>
                    </div>
                    <div style={styles.testimonialsGrid}>
                        {testimonials.map((testimonial, index) => (
                            <div key={index} style={styles.testimonialCard} className="testimonial-card">
                                <div style={styles.quoteIcon}>“</div>
                                <p style={styles.testimonialText}>{testimonial.text}</p>
                                <div style={styles.testimonialDivider}></div>
                                <div style={styles.testimonialAuthor}>
                                    <div style={styles.authorInitial}>{testimonial.initial}</div>
                                    <div>
                                        <div style={styles.testimonialName}>{testimonial.name}</div>
                                        <div style={styles.testimonialRole}>{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            {!isLoggedIn && (
                <div style={styles.ctaSection}>
                    <div style={styles.container}>
                        <div style={styles.ctaContent}>
                            <h2 style={styles.ctaTitle}>Ready to Transform Your Campus Experience?</h2>
                            <p style={styles.ctaDescription}>
                                Join thousands of users already using NovaCampus
                            </p>
                            <Link to="/login" style={styles.ctaButton}>
                                Get Started Now →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0%   { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes floatUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradientFade {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .feature-card:hover {
                    transform: translateY(-5px) !important;
                    border-color: rgba(56,189,248,0.28) !important;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.45), 0 0 24px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.12) !important;
                }
                .testimonial-card:hover {
                    transform: translateY(-4px) !important;
                    border-color: rgba(56,189,248,0.22) !important;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1) !important;
                }
                @media (max-width: 768px) {
                    .hero-inner { flex-direction: column !important; }
                    .carousel-wrapper { margin-top: 30px; }
                }
            `}</style>
        </div>
    );
}

const styles = {
    page: {
        background: 'transparent',
        minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans','Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: 'relative',
        zIndex: 1,
    },

    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        gap: '16px',
    },

    loadingSpinner: {
        width: '48px',
        height: '48px',
        border: '3px solid rgba(56,189,248,0.18)',
        borderTopColor: '#38bdf8',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },

    loadingText: {
        color: 'rgba(240,249,255,0.5)',
        fontSize: '0.875rem'
    },

    heroWrapper: {
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    heroContent: {
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '160px 24px 200px',
        maxWidth: '820px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

    heroLogoWrap: {
        marginBottom: '20px',
        animation: 'floatUp 0.9s cubic-bezier(0.4,0,0.2,1) both',
    },

    heroCampusName: {
        fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: '900',
        letterSpacing: '-0.04em',
        lineHeight: 1,
        marginBottom: '12px',
        background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 30%, #7dd3fc 65%, #38bdf8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: 'none',
        animation: 'floatUp 1s 0.15s cubic-bezier(0.4,0,0.2,1) both',
    },

    heroTagline: {
        fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
        fontWeight: '600',
        color: 'rgba(240,249,255,0.75)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '20px',
        animation: 'floatUp 1s 0.25s cubic-bezier(0.4,0,0.2,1) both',
    },

    heroBottom: {
        position: 'absolute',
        bottom: '36px',
        left: 0, right: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        padding: '0 24px',
        flexWrap: 'wrap',
    },

    slideInfoCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: '14px',
        padding: '10px 18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
    },

    slideInfoIcon: { fontSize: '1.4rem' },

    slideInfoTitle: {
        fontSize: '0.82rem',
        fontWeight: '700',
        color: '#f0f9ff',
        lineHeight: 1.3,
    },

    slideInfoSub: {
        fontSize: '0.7rem',
        color: 'rgba(240,249,255,0.6)',
        fontWeight: '500',
    },

    heroDots: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },

    heroContainer: { maxWidth: '1200px', margin: '0 auto' },
    heroInner: {},
    heroLeft: {},
    heroRight: {},

    welcomeBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(56,189,248,0.15)',
        border: '1px solid rgba(56,189,248,0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '8px 20px',
        borderRadius: '100px',
        fontSize: '0.88rem',
        color: '#7dd3fc',
        marginBottom: '20px',
        fontWeight: '600',
        letterSpacing: '0.02em',
        animation: 'floatUp 0.9s 0.05s cubic-bezier(0.4,0,0.2,1) both',
        boxShadow: '0 4px 20px rgba(56,189,248,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
    },

    heroDescription: {
        color: 'rgba(240,249,255,0.82)',
        fontSize: '1.1rem',
        lineHeight: '1.7',
        marginBottom: '36px',
        maxWidth: '600px',
        animation: 'floatUp 1s 0.35s cubic-bezier(0.4,0,0.2,1) both',
    },

    buttonGroup: {
        display: 'flex',
        gap: '14px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        animation: 'floatUp 1s 0.45s cubic-bezier(0.4,0,0.2,1) both',
    },

    primaryButton: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
        color: '#ffffff',
        padding: '13px 30px',
        fontWeight: '700',
        fontSize: '0.9rem',
        textDecoration: 'none',
        borderRadius: '13px',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'inline-block',
        boxShadow: '0 4px 24px rgba(56,189,248,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
        letterSpacing: '0.01em',
    },

    secondaryButton: {
        background: 'rgba(255,255,255,0.08)',
        color: '#f0f9ff',
        padding: '12px 28px',
        fontWeight: '600',
        fontSize: '0.9rem',
        textDecoration: 'none',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        display: 'inline-block'
    },

    carouselWrapper: {
        position: 'relative',
        height: '400px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)'
    },

    carouselSlide: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transition: 'opacity 0.8s ease-in-out',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '24px'
    },

    slideOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.7))',
        borderRadius: '24px'
    },

    slideContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '30px',
        color: '#f0f9ff'
    },

    slideIcon: {
        fontSize: '2rem',
        marginBottom: '12px'
    },

    slideTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        marginBottom: '8px'
    },

    slideSubtitle: {
        fontSize: '0.85rem',
        opacity: 0.9,
        marginBottom: '16px',
        lineHeight: '1.5'
    },

    slideFeatures: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },

    slideFeature: {
        fontSize: '0.7rem',
        color: '#7dd3fc',
        background: 'rgba(56,189,248,0.18)',
        border: '1px solid rgba(56,189,248,0.3)',
        padding: '4px 12px',
        borderRadius: '20px',
        fontWeight: '600',
    },

    carouselIndicators: {
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 10
    },

    indicator: {
        height: '8px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },

    prevArrow: {
        position: 'absolute',
        left: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'all 0.3s ease',
        zIndex: 10
    },

    nextArrow: {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        cursor: 'pointer',
        fontSize: '18px',
        transition: 'all 0.3s ease',
        zIndex: 10
    },

    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },

    featuresSection: {
        padding: '60px 0 80px',
        background: 'transparent',
        position: 'relative',
        zIndex: 1,
    },

    sectionHeader: {
        textAlign: 'center',
        marginBottom: '48px'
    },

    sectionLabel: {
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#38bdf8',
        marginBottom: '12px'
    },

    sectionTitle: {
        fontSize: '2.1rem',
        fontWeight: '800',
        background: 'linear-gradient(140deg, #f0f9ff 20%, #7dd3fc 55%, #38bdf8 85%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '12px',
        letterSpacing: '-0.025em',
    },

    sectionDescription: {
        color: 'rgba(240,249,255,0.7)',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: '1.7',
        fontSize: '1rem',
    },

    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: '24px'
    },

    featureCard: {
        background: 'transparent',
        backdropFilter: 'blur(32px) saturate(140%)',
        WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        borderRadius: '20px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.11)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    },

    featureIcon: {
        fontSize: '2.5rem',
        marginBottom: '16px'
    },

    featureTitle: {
        fontWeight: '700',
        color: '#f0f9ff',
        marginBottom: '12px',
        fontSize: '1.05rem',
        letterSpacing: '-0.01em',
    },

    featureDescription: {
        color: 'rgba(240,249,255,0.68)',
        fontSize: '0.875rem',
        lineHeight: '1.65',
        flexGrow: 1,
        marginBottom: '20px',
    },

    featureFooter: {
        marginTop: 'auto'
    },

    featureLink: {
        background: 'rgba(56,189,248,0.12)',
        border: '1px solid rgba(56,189,248,0.28)',
        color: '#38bdf8',
        padding: '8px 18px',
        fontSize: '0.8rem',
        fontWeight: '700',
        textDecoration: 'none',
        borderRadius: '10px',
        display: 'inline-block',
        transition: 'all 0.2s ease',
        letterSpacing: '0.01em',
    },

    comingSoonBadge: {
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(240,249,255,0.55)',
        padding: '8px 16px',
        fontSize: '0.8rem',
        fontWeight: '600',
        borderRadius: '10px',
        display: 'inline-block'
    },

    testimonialSection: {
        padding: '60px 0 80px',
        background: 'transparent',
        position: 'relative',
        zIndex: 1,
    },

    testimonialsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
    },

    testimonialCard: {
        background: 'transparent',
        backdropFilter: 'blur(32px) saturate(140%)',
        WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(255,255,255,0.11)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    },

    quoteIcon: {
        fontSize: '3rem',
        color: '#38bdf8',
        lineHeight: '1',
        marginBottom: '16px',
        fontFamily: 'Georgia, serif'
    },

    testimonialText: {
        color: 'rgba(240,249,255,0.75)',
        fontSize: '0.9rem',
        lineHeight: '1.6',
        marginBottom: '20px',
        fontStyle: 'italic'
    },

    testimonialDivider: {
        width: '50px',
        height: '2px',
        background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
        marginBottom: '16px'
    },

    testimonialAuthor: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },

    authorInitial: {
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.3))',
        border: '1px solid rgba(56,189,248,0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7dd3fc',
        fontWeight: '800',
        fontSize: '1rem',
    },

    testimonialName: {
        fontWeight: '700',
        color: '#f0f9ff',
        fontSize: '0.95rem',
        marginBottom: '2px'
    },

    testimonialRole: {
        fontSize: '0.7rem',
        color: 'rgba(240,249,255,0.5)'
    },

    ctaSection: {
        background: 'transparent',
        padding: '80px 20px',
        position: 'relative',
        zIndex: 1,
    },

    ctaContent: {
        textAlign: 'center',
        maxWidth: '700px',
        margin: '0 auto',
        background: 'transparent',
        backdropFilter: 'blur(40px) saturate(160%)',
        WebkitBackdropFilter: 'blur(40px) saturate(160%)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: '28px',
        padding: '60px 48px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    },

    ctaTitle: {
        fontSize: '2.2rem',
        fontWeight: '800',
        background: 'linear-gradient(140deg, #f0f9ff 20%, #7dd3fc 55%, #38bdf8 85%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '16px',
        letterSpacing: '-0.025em',
    },

    ctaDescription: {
        fontSize: '1rem',
        color: 'rgba(240,249,255,0.72)',
        marginBottom: '32px',
        lineHeight: '1.65',
    },

    ctaButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
        color: '#ffffff',
        padding: '14px 36px',
        borderRadius: '14px',
        fontSize: '0.95rem',
        fontWeight: '700',
        textDecoration: 'none',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 24px rgba(56,189,248,0.42), inset 0 1px 0 rgba(255,255,255,0.25)',
        letterSpacing: '0.01em',
    }
};

export default HomePage;

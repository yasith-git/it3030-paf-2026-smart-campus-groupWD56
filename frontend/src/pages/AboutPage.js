import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
    const [activeTab, setActiveTab] = useState('mission');
    const [counters, setCounters] = useState({
        users: 0,
        bookings: 0,
        tickets: 0,
        uptime: 0
    });

    const stats = [
        { id: 'users', label: 'Active Users', value: 1250, icon: '👥', suffix: '+' },
        { id: 'bookings', label: 'Bookings Completed', value: 8450, icon: '📅', suffix: '+' },
        { id: 'tickets', label: 'Issues Resolved', value: 2340, icon: '✅', suffix: '+' },
        { id: 'uptime', label: 'System Uptime', value: 99.9, icon: '⚡', suffix: '%' }
    ];

    useEffect(() => {
        const animateNumbers = () => {
            stats.forEach(stat => {
                let start = 0;
                const end = stat.value;
                const duration = 2000;
                const increment = end / (duration / 16);
                
                const timer = setInterval(() => {
                    start += increment;
                    if (start >= end) {
                        setCounters(prev => ({ ...prev, [stat.id]: end }));
                        clearInterval(timer);
                    } else {
                        setCounters(prev => ({ ...prev, [stat.id]: Math.floor(start) }));
                    }
                }, 16);
            });
        };
        
        animateNumbers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const team = [
        {
            name: 'Dr. Sarah Johnson',
            role: 'Campus Director',
            bio: 'Leading digital transformation at NovaCampus',
            icon: '👩‍💼',
            email: 'sarah.johnson@novacampus.edu'
        },
        {
            name: 'Michael Chen',
            role: 'Lead Developer',
            bio: 'Full-stack architecture specialist for Nova platform',
            icon: '👨‍💻',
            email: 'michael.chen@novacampus.edu'
        },
        {
            name: 'Emma Williams',
            role: 'UX Designer',
            bio: 'Creating intuitive experiences for Nova community',
            icon: '🎨',
            email: 'emma.williams@novacampus.edu'
        },
        {
            name: 'David Kumar',
            role: 'System Analyst',
            bio: 'Optimizing campus workflows at Nova',
            icon: '📊',
            email: 'david.kumar@novacampus.edu'
        }
    ];

    const milestones = [
        { year: '2024', title: 'NovaCampus Launch', description: 'Initial release of NovaCampus platform' },
        { year: '2024', title: 'Mobile App Release', description: 'Access Nova operations on-the-go' },
        { year: '2025', title: 'AI Integration', description: 'Smart scheduling and predictions for Nova' },
        { year: '2025', title: 'Full Campus Coverage', description: 'All Nova departments onboarded' }
    ];

    const technologies = [
        { name: 'React 18', category: 'Frontend', icon: '⚛️' },
        { name: 'Spring Boot', category: 'Backend', icon: '🍃' },
        { name: 'PostgreSQL', category: 'Database', icon: '🐘' },
        { name: 'Redis', category: 'Cache', icon: '⚡' },
        { name: 'Docker', category: 'DevOps', icon: '🐳' },
        { name: 'JWT', category: 'Security', icon: '🔐' }
    ];

    const contactInfo = {
        email: 'support@novacampus.edu',
        phone: '+94 11 754 4801',
        address: 'New Kandy Road, Malabe, Sri Lanka'
    };

    return (
        <div className="about-shell">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-pattern"></div>
                <div className="container">
                    <div className="hero-content">
                        <div className="badge">
                            <span className="badge-icon">✨</span>
                            About NovaCampus
                        </div>
                        <h1 className="hero-title">
                            Transforming Nova
                            <span className="hero-accent"> Campus Operations</span>
                        </h1>
                        <p className="hero-description">
                            NovaCampus is a modern digital platform designed to simplify and enhance 
                            campus operations through innovative technology solutions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-icon">{stat.icon}</div>
                                <div className="stat-value">
                                    {counters[stat.id]}{stat.suffix}
                                </div>
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-bar"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission & Vision Tabs */}
            <div className="mission-section">
                <div className="container">
                    <div className="tabs-container">
                        <button
                            className={`tab-button ${activeTab === 'mission' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mission')}
                        >
                            Our Mission
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'vision' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vision')}
                        >
                            Our Vision
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'values' ? 'active' : ''}`}
                            onClick={() => setActiveTab('values')}
                        >
                            Core Values
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'mission' && (
                            <div className="content-card">
                                <div className="content-icon">🎯</div>
                                <h2 className="content-title">Our Mission at Nova</h2>
                                <p className="content-text">
                                    To revolutionize NovaCampus operations by providing an integrated digital platform 
                                    that streamlines resource management, enhances communication, and improves 
                                    efficiency for students, faculty, and staff across the campus.
                                </p>
                                <div className="mission-points">
                                    <div className="mission-point">
                                        <span>✓</span>
                                        <span>Simplify administrative processes at Nova</span>
                                    </div>
                                    <div className="mission-point">
                                        <span>✓</span>
                                        <span>Enhance user experience for Nova community</span>
                                    </div>
                                    <div className="mission-point">
                                        <span>✓</span>
                                        <span>Drive digital transformation at NovaCampus</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'vision' && (
                            <div className="content-card">
                                <div className="content-icon">👁️</div>
                                <h2 className="content-title">Our Vision for Nova</h2>
                                <p className="content-text">
                                    To position NovaCampus as a model for next-gen campus solutions globally, 
                                    setting new standards for educational institution management through innovation, 
                                    sustainability, and user-centric design.
                                </p>
                                <div className="vision-future">
                                    <div className="future-card">
                                        <span>2026</span>
                                        <span>Nova Excellence</span>
                                    </div>
                                    <div className="future-card">
                                        <span>50+</span>
                                        <span>Partner Institutions</span>
                                    </div>
                                    <div className="future-card">
                                        <span>5K+</span>
                                        <span>Active Users at Nova</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'values' && (
                            <div className="content-card">
                                <div className="content-icon">💎</div>
                                <h2 className="content-title">Nova Core Values</h2>
                                <div className="values-grid">
                                    <div className="value-item">
                                        <span>🔹</span>
                                        <div>
                                            <strong>Innovation First</strong>
                                            <p>Continuously evolving Nova with technology</p>
                                        </div>
                                    </div>
                                    <div className="value-item">
                                        <span>🔹</span>
                                        <div>
                                            <strong>Campus Integrity</strong>
                                            <p>Transparent and ethical practices at Nova</p>
                                        </div>
                                    </div>
                                    <div className="value-item">
                                        <span>🔹</span>
                                        <div>
                                            <strong>Educational Excellence</strong>
                                            <p>Delivering high-quality solutions for Nova</p>
                                        </div>
                                    </div>
                                    <div className="value-item">
                                        <span>🔹</span>
                                        <div>
                                            <strong>Community Collaboration</strong>
                                            <p>Working together for Nova success</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Nova Features</div>
                        <h2 className="section-title">What Makes Nova Different</h2>
                        <p className="section-description">
                            Comprehensive tools designed for modern NovaCampus management
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h3 className="feature-title">Resource Booking</h3>
                            <p className="feature-description">
                                Easy scheduling of Nova facilities, equipment, and spaces with real-time availability
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚠️</div>
                            <h3 className="feature-title">Incident Reporting</h3>
                            <p className="feature-description">
                                Quick issue reporting at Nova with priority levels and tracking system
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔔</div>
                            <h3 className="feature-title">Smart Notifications</h3>
                            <p className="feature-description">
                                Real-time alerts for Nova approvals, updates, and announcements
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3 className="feature-title">Role-Based Access</h3>
                            <p className="feature-description">
                                Secure access for Nova students, staff, and administrators
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="contact-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Get in Touch</div>
                        <h2 className="section-title">Contact Nova Support</h2>
                        <p className="section-description">
                            Reach out to our dedicated team for assistance
                        </p>
                    </div>

                    <div className="contact-grid">
                        <div className="contact-card">
                            <div className="contact-icon">📧</div>
                            <h3 className="contact-title">Email Us</h3>
                            <p className="contact-detail">{contactInfo.email}</p>
                            <p className="contact-note">Response within 24 hours</p>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon">📞</div>
                            <h3 className="contact-title">Call Us</h3>
                            <p className="contact-detail">{contactInfo.phone}</p>
                            <p className="contact-note">Mon-Fri, 9am-5pm</p>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon">📍</div>
                            <h3 className="contact-title">Visit Us</h3>
                            <p className="contact-detail">{contactInfo.address}</p>
                            <p className="contact-note">NovaCampus HQ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technology Stack */}
            <div className="tech-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Nova Tech Stack</div>
                        <h2 className="section-title">Built with Modern Technology</h2>
                        <p className="section-description">
                            Cutting-edge technologies powering NovaCampus platform
                        </p>
                    </div>

                    <div className="tech-grid">
                        {technologies.map((tech, index) => (
                            <div key={index} className="tech-card">
                                <div className="tech-icon">{tech.icon}</div>
                                <div className="tech-name">{tech.name}</div>
                                <div className="tech-category">{tech.category}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="timeline-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Nova Journey</div>
                        <h2 className="section-title">Milestones Achieved</h2>
                        <p className="section-description">
                            Key moments in NovaCampus development
                        </p>
                    </div>

                    <div className="timeline">
                        {milestones.map((milestone, index) => (
                            <div key={index} className="timeline-item">
                                <div className="timeline-year">{milestone.year}</div>
                                <div className="timeline-content">
                                    <h3 className="timeline-title">{milestone.title}</h3>
                                    <p className="timeline-description">{milestone.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="team-section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Nova Team</div>
                        <h2 className="section-title">Meet the Experts Behind Nova</h2>
                        <p className="section-description">
                            Dedicated professionals powering NovaCampus
                        </p>
                    </div>

                    <div className="team-grid">
                        {team.map((member, index) => (
                            <div key={index} className="team-card">
                                <div className="team-icon">{member.icon}</div>
                                <h3 className="team-name">{member.name}</h3>
                                <div className="team-role">{member.role}</div>
                                <p className="team-bio">{member.bio}</p>
                                <div className="team-email">{member.email}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Transform NovaCampus?</h2>
                        <p className="cta-description">
                            Join the growing community at NovaCampus using NovaCampus platform
                        </p>
                        <div className="cta-buttons">
                            <Link to="/login" className="cta-button-primary">
                                Get Started at Nova
                                <span className="cta-arrow">→</span>
                            </Link>
                            <a href="mailto:support@novacampus.edu" className="cta-button-secondary">
                                Email Nova Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .about-shell {
                    min-height: 100vh;
                    background: transparent;
                    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* Hero Section */
                .hero-section {
                    position: relative;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.07) 100%);
                    overflow: hidden;
                }

                .hero-pattern {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
                    animation: pulse 8s ease-in-out infinite;
                }

                .hero-content {
                    position: relative;
                    text-align: center;
                    padding: 100px 0;
                    z-index: 1;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(56,189,248,0.12);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(56,189,248,0.25);
                    padding: 8px 20px;
                    border-radius: 100px;
                    font-size: 0.875rem;
                    color: #38bdf8;
                    margin-bottom: 24px;
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #f0f9ff;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }

                .hero-description {
                    font-size: 1.125rem;
                    color: rgba(240,249,255,0.55);
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                /* Stats Section */
                .stats-section {
                    padding: 60px 0;
                    background: transparent;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                }

                .stat-card {
                    text-align: center;
                    padding: 32px 20px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(32px) saturate(140%);
                    -webkit-backdrop-filter: blur(32px) saturate(140%);
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255,255,255,0.11);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }

                .stat-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(56,189,248,0.25);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                }

                .stat-card:hover .stat-bar {
                    width: 60px;
                }

                .stat-icon {
                    font-size: 2rem;
                    margin-bottom: 12px;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #38bdf8, #7dd3fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 8px;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: rgba(240,249,255,0.6);
                }

                .stat-bar {
                    width: 40px;
                    height: 2px;
                    background: linear-gradient(90deg, #0ea5e9, #38bdf8);
                    margin: 12px auto 0;
                    transition: width 0.3s ease;
                    border-radius: 2px;
                }

                /* Mission Section */
                .mission-section {
                    padding: 60px 0;
                    background: transparent;
                }

                .tabs-container {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 40px;
                }

                .tab-button {
                    padding: 12px 32px;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: rgba(240,249,255,0.65);
                    font-family: inherit;
                }

                .tab-button.active {
                    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
                    color: #ffffff;
                    border-color: transparent;
                    box-shadow: 0 4px 20px rgba(56,189,248,0.4);
                }

                .tab-button:hover {
                    transform: translateY(-2px);
                }

                .tab-content {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .content-card {
                    text-align: center;
                    padding: 40px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(40px) saturate(160%);
                    -webkit-backdrop-filter: blur(40px) saturate(160%);
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.11);
                    box-shadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
                }

                .content-icon {
                    font-size: 3rem;
                    margin-bottom: 20px;
                }

                .content-title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(140deg, #f0f9ff 20%, #7dd3fc 55%, #38bdf8 85%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 16px;
                }

                .content-text {
                    font-size: 1rem;
                    color: rgba(240,249,255,0.65);
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .mission-points {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    align-items: center;
                }

                .mission-point {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.875rem;
                    color: rgba(240,249,255,0.75);
                }

                .mission-point span:first-child {
                    color: #38bdf8;
                    font-weight: bold;
                }

                .vision-future {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin-top: 24px;
                    flex-wrap: wrap;
                }

                .future-card {
                    text-align: center;
                    padding: 20px 24px;
                    background: rgba(56,189,248,0.08);
                    border-radius: 16px;
                    border: 1px solid rgba(56,189,248,0.2);
                    min-width: 130px;
                }

                .future-card span:first-child {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #38bdf8;
                    margin-bottom: 4px;
                }

                .future-card span:last-child {
                    font-size: 0.75rem;
                    color: rgba(240,249,255,0.55);
                }

                .values-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    text-align: left;
                }

                .value-item {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 14px;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: rgba(240,249,255,0.75);
                    font-size: 0.875rem;
                }

                /* Features Section */
                .features-section {
                    padding: 60px 0;
                    background: transparent;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 48px;
                }

                .section-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #38bdf8;
                    margin-bottom: 12px;
                }

                .section-title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(140deg, #f0f9ff 20%, #7dd3fc 55%, #38bdf8 85%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 16px;
                    letter-spacing: -0.02em;
                }

                .section-description {
                    font-size: 1rem;
                    color: rgba(240,249,255,0.5);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                }

                .feature-card {
                    padding: 32px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(24px) saturate(140%);
                    -webkit-backdrop-filter: blur(24px) saturate(140%);
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.11);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                }

                .feature-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(56,189,248,0.25);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                }

                .feature-icon {
                    font-size: 2.5rem;
                    margin-bottom: 16px;
                }

                .feature-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #f0f9ff;
                    margin-bottom: 12px;
                }

                .feature-description {
                    font-size: 0.875rem;
                    color: rgba(240,249,255,0.6);
                    line-height: 1.6;
                }

                /* Contact Section */
                .contact-section {
                    padding: 60px 0;
                    background: transparent;
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin-top: 48px;
                }

                .contact-card {
                    text-align: center;
                    padding: 32px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(24px) saturate(140%);
                    -webkit-backdrop-filter: blur(24px) saturate(140%);
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.11);
                    transition: all 0.3s ease;
                }

                .contact-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(56,189,248,0.25);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                }

                .contact-icon {
                    font-size: 2rem;
                    margin-bottom: 16px;
                }

                .contact-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #f0f9ff;
                    margin-bottom: 12px;
                }

                .contact-detail {
                    font-size: 0.875rem;
                    color: rgba(240,249,255,0.65);
                    margin-bottom: 8px;
                }

                .contact-note {
                    font-size: 0.75rem;
                    color: rgba(240,249,255,0.45);
                }

                /* Tech Section */
                .tech-section {
                    padding: 60px 0;
                    background: transparent;
                }

                .tech-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 20px;
                }

                .tech-card {
                    text-align: center;
                    padding: 24px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(20px) saturate(140%);
                    -webkit-backdrop-filter: blur(20px) saturate(140%);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.11);
                    transition: all 0.3s ease;
                }

                .tech-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(56,189,248,0.25);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
                }

                .tech-icon {
                    font-size: 2rem;
                    margin-bottom: 12px;
                }

                .tech-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #f0f9ff;
                    margin-bottom: 4px;
                }

                .tech-category {
                    font-size: 0.75rem;
                    color: rgba(240,249,255,0.5);
                }

                /* Timeline Section */
                .timeline-section {
                    padding: 80px 0;
                    background: transparent;
                }

                .timeline {
                    max-width: 700px;
                    margin: 0 auto;
                    position: relative;
                }

                .timeline-item {
                    display: flex;
                    gap: 24px;
                    margin-bottom: 32px;
                    position: relative;
                }

                .timeline-year {
                    min-width: 80px;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #38bdf8;
                }

                .timeline-content {
                    flex: 1;
                    padding: 20px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.11);
                }

                .timeline-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #f0f9ff;
                    margin-bottom: 8px;
                }

                .timeline-description {
                    font-size: 0.875rem;
                    color: rgba(240,249,255,0.6);
                }

                /* Team Section */
                .team-section {
                    padding: 60px 0;
                    background: transparent;
                }

                .team-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                }

                .team-card {
                    text-align: center;
                    padding: 32px;
                    background: rgba(255,255,255,0.07);
                    backdrop-filter: blur(24px) saturate(140%);
                    -webkit-backdrop-filter: blur(24px) saturate(140%);
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.11);
                    transition: all 0.3s ease;
                }

                .team-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(56,189,248,0.25);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                }

                .team-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .team-name {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #f0f9ff;
                    margin-bottom: 6px;
                }

                .team-role {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #38bdf8;
                    margin-bottom: 12px;
                }

                .team-bio {
                    font-size: 0.875rem;
                    color: rgba(240,249,255,0.6);
                    margin-bottom: 12px;
                }

                .team-email {
                    font-size: 0.75rem;
                    color: rgba(240,249,255,0.45);
                    word-break: break-all;
                }

                /* CTA Section */
                .cta-section {
                    background: rgba(255,255,255,0.03);
                    padding: 80px 0;
                    border-top: 1px solid rgba(255,255,255,0.07);
                }

                .cta-content {
                    text-align: center;
                }

                .cta-title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(140deg, #f0f9ff 20%, #7dd3fc 55%, #38bdf8 85%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 16px;
                }

                .cta-description {
                    font-size: 1rem;
                    color: rgba(240,249,255,0.55);
                    margin-bottom: 32px;
                }

                .cta-buttons {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .cta-button-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
                    color: #ffffff;
                    padding: 13px 28px;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px rgba(56,189,248,0.35);
                }

                .cta-button-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(56,189,248,0.5);
                }

                .cta-button-secondary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.08);
                    color: #f0f9ff;
                    padding: 13px 28px;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-decoration: none;
                    border: 1px solid rgba(255,255,255,0.14);
                    transition: all 0.3s ease;
                }

                .cta-button-secondary:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.12);
                    border-color: rgba(56,189,248,0.3);
                }

                .cta-arrow {
                    transition: transform 0.2s ease;
                }

                .cta-button-primary:hover .cta-arrow,
                .cta-button-secondary:hover .cta-arrow {
                    transform: translateX(4px);
                }

                /* Animations */
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }
                    
                    .section-title {
                        font-size: 1.75rem;
                    }
                    
                    .values-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .tabs-container {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .timeline-item {
                        flex-direction: column;
                    }
                    
                    .timeline-year {
                        margin-bottom: 8px;
                    }
                }
            `}</style>
        </div>
    );
}

export default AboutPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Folder, FileText, Calendar, MessageCircle,
    Users, Bookmark, LogOut, ChevronRight,
    Activity, BookOpen, Shield, Bell, Search
} from 'lucide-react';
import './Dashboard.css';


// Demo user data (replace with real user context if available)
const demoUser = {
    name: "Parvesh",
    recentActivity: [
        { type: "note", text: "Added new notes to Study Vault", time: "2h ago" },
        { type: "exam", text: "Viewed Exam Archive for 2023", time: "5h ago" },
        { type: "group", text: "Joined Synergy Group: Organic Chem", time: "1d ago" }
    ]
};

const quickActions = [
    { label: "New Note", icon: <FileText size={18} />, onClick: () => alert("New Note action") },
    { label: "Join Group", icon: <Users size={18} />, onClick: () => alert("Join Group action") },
    { label: "Upload File", icon: <Folder size={18} />, onClick: () => alert("Upload File action") }
];

const metrics = [
    {
        label: "Study Streak",
        value: "12 days",
        change: "+3 vs last week",
        tone: "positive"
    },
    {
        label: "Hours This Week",
        value: "18.5h",
        change: "+2.5h above avg",
        tone: "neutral"
    },
    {
        label: "Tasks Completed",
        value: "34 / 40",
        change: "85% completion",
        tone: "positive"
    }
];

const features = [
    { icon: <Folder size={24} />, title: "Study Vault", desc: "Access curated notes, premium assets, and laboratory resources.", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", link: "/study-vault" },
    { icon: <FileText size={24} />, title: "Exam Archive", desc: "Review historic question papers and high-yield assessment materials.", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", link: "/exam-archive" },
    { icon: <Calendar size={24} />, title: "Schedule Manager", desc: "Track class timings and monitor your academic sessions.", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", link: "/schedule" },
    { icon: <MessageCircle size={24} />, title: "Network Hub", desc: "Collaborate and synchronize with your academic peer group in real-time.", color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.15)", link: "/network" },
    { icon: <Users size={24} />, title: "Synergy Groups", desc: "Coordinate advanced study sessions and group projects.", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", link: "/groups" },
    { icon: <Bookmark size={24} />, title: "Task Terminal", desc: "Optimize your workflow with prioritized assignment tracking.", color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", link: "/tasks" }
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [user, setUser] = useState({ name: "Loading...", email: "" });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser({ name: data.email.split('@')[0], email: data.email });
                } else {
                    navigate('/login');
                }
            } catch (e) {
                console.error("Error fetching user:", e);
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
        navigate('/login');
    };

    const handleQuickActionKey = (e, action) => {
        if (e.key === 'Enter' || e.key === ' ') {
            action();
        }
    };

    const filteredFeatures = features.filter(f => {
        const q = search.toLowerCase();
        return (
            f.title.toLowerCase().includes(q) ||
            f.desc.toLowerCase().includes(q)
        );
    });

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-shell">
                <aside className="sidebar" aria-label="Main navigation">
                    <div className="sidebar-top">
                        <div className="sidebar-brand" aria-label="ChemSAGE">
                            <div className="brand-mark">
                                <BookOpen size={18} strokeWidth={3} />
                            </div>
                            <div>
                                <div className="sidebar-title">ChemSAGE</div>
                                <div className="sidebar-tagline">Chemistry workspace</div>
                            </div>
                        </div>
                        <nav className="sidebar-nav">
                            <button
                                type="button"
                                className="sidebar-nav-item sidebar-nav-item--active"
                            >
                                <Activity size={16} />
                                <span>Dashboard</span>
                            </button>
                            {features.map((feature) => (
                                <button
                                    key={feature.title}
                                    type="button"
                                    className="sidebar-nav-item"
                                    onClick={() => navigate(feature.link)}
                                >
                                    {feature.icon}
                                    <span>{feature.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="sidebar-bottom">
                        <button
                            type="button"
                            className="sidebar-logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            <span>Log out</span>
                        </button>
                    </div>
                </aside>

                <main className="shell-main">
                    <header className="shell-topbar">
                        <div>
                            <h1 className="shell-greeting">
                                Welcome back, <span>{user.name}</span>
                            </h1>
                            <p className="shell-subtitle">
                                A calm overview of your chemistry notes, exams, and groups.
                            </p>
                        </div>
                        <div className="shell-top-actions">
                            <div className="top-search">
                                <Search size={14} className="top-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search modules or actions"
                                    aria-label="Search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <button className="icon-btn" aria-label="Notifications">
                                <Bell size={18} />
                                <span className="notification-dot"></span>
                            </button>
                        </div>
                    </header>

                    <section className="shell-stats" aria-label="Study overview">
                        {metrics.map((metric, idx) => (
                            <motion.div
                                key={metric.label}
                                className={`stat-card stat-tone-${metric.tone}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * idx }}
                            >
                                <div className="stat-label">{metric.label}</div>
                                <div className="stat-value">{metric.value}</div>
                                <div className="stat-change">{metric.change}</div>
                            </motion.div>
                        ))}
                    </section>

                    <section className="shell-main-grid">
                        <div className="panel">
                            <header className="panel-header">
                                <div>
                                    <h2 className="panel-title">Modules</h2>
                                    <p className="panel-subtitle">
                                        Quickly jump into the tools you use most.
                                    </p>
                                </div>
                            </header>
                            <div className="modules-grid">
                                {filteredFeatures.length === 0 ? (
                                    <div className="modules-empty">
                                        <span>No modules match your search.</span>
                                    </div>
                                ) : (
                                    filteredFeatures.map((feature, idx) => (
                                        <motion.button
                                            key={feature.title}
                                            type="button"
                                            className="module-card"
                                            style={{
                                                '--theme-color': feature.color,
                                                '--theme-bg': feature.bg
                                            }}
                                            initial={{ opacity: 0, y: 18 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.06 * idx }}
                                            whileHover={{ y: -6 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => navigate(feature.link)}
                                        >
                                            <div className="card-icon-wrapper">
                                                {feature.icon}
                                            </div>
                                            <h3 className="card-title">{feature.title}</h3>
                                            <p className="card-desc">{feature.desc}</p>
                                            <div className="card-footer">
                                                <span className="footer-text">Open module</span>
                                                <div className="arrow-circle">
                                                    <ChevronRight size={14} />
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))
                                )}
                            </div>
                        </div>

                        <aside className="panel panel-side" aria-label="Today at a glance">
                            <header className="panel-header">
                                <div>
                                    <h2 className="panel-title">Today at a glance</h2>
                                    <p className="panel-subtitle">
                                        Quick actions and your latest activity.
                                    </p>
                                </div>
                            </header>

                            <div className="side-section">
                                <div className="side-section-label">Quick actions</div>
                                <div className="quick-actions">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.label}
                                            className="quick-chip"
                                            type="button"
                                            onClick={action.onClick}
                                            onKeyDown={e => handleQuickActionKey(e, action.onClick)}
                                        >
                                            <span className="quick-chip-icon">{action.icon}</span>
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="side-section">
                                <div className="side-section-label">Recent activity</div>
                                <div className="activity-column">
                                    {demoUser.recentActivity.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="activity-row"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * idx }}
                                        >
                                            <div className="activity-dot"></div>
                                            <div className="activity-main">
                                                <span className="activity-text">{item.text}</span>
                                                <span className="activity-time">{item.time}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </section>

                    <footer className="dashboard-footer">
                        <div className="footer-container">
                            <div className="footer-brand">
                                <span>SYSTEM / CHEMSAGE PROTOCOL v2.0.4</span>
                            </div>
                            <div className="footer-links hidden-mobile">
                                <a href="#support">Support</a>
                                <a href="#docs">Docs</a>
                                <a href="#status">Status: Nominal</a>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
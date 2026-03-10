import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Folder, FileText, Calendar, MessageCircle, Users, Bookmark } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
        navigate('/login');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const features = [
        { icon: <Folder size={32} />, title: "Resource Resources", desc: "Access study materials, notes, and resources uploaded by students and faculty." },
        { icon: <FileText size={32} />, title: "Question Papers", desc: "Browse past year question papers for exam preparation." },
        { icon: <Calendar size={32} />, title: "Timetable & Schedule", desc: "View your weekly class schedule and track your self-attendance." },
        { icon: <MessageCircle size={32} />, title: "Course Groups & Chat", desc: "Engage in discussions with your batchmates and communicate directly with peers." },
        { icon: <Users size={32} />, title: "Group Study Planner", desc: "Coordinate study sessions and hangouts to build a better learning environment." },
        { icon: <Bookmark size={32} />, title: "Assignment Tracker", desc: "Keep track of upcoming deadlines and assignment statuses." }
    ];

    return (
        <div className="dashboard-wrapper">
            <nav className="navbar">
                <div className="logo">ChemSAGE</div>
                <div className="nav-links">
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <main className="main-content">
                <motion.div
                    className="welcome-card glass-panel"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>Welcome to Smart Academic Growth Environment!</h1>
                    <p className="subtitle">You have successfully logged in. Select a module below to get started.</p>
                </motion.div>

                <motion.div
                    className="features-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {features.map((feature, idx) => (
                        <motion.div key={idx} variants={itemVariants} className="feature-card glass-panel">
                            <span className="feature-icon">{feature.icon}</span>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-desc">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default Dashboard;

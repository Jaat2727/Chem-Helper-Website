import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Send, X, Shield, Users, 
    ArrowLeft, Search, LogOut, ChevronRight 
} from 'lucide-react';
import './NetworkHub.css';

const NetworkHub = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "User", email: "" });
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState("Global");
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedUser]); // Scroll when switching chats too

    useEffect(() => {
        let isActive = true;

        const connect = (userName) => {
            if (socketRef.current) {
                socketRef.current.close();
            }

            const ws = new WebSocket(`ws://127.0.0.1:5000/ws/chat?user=${encodeURIComponent(userName)}`);
            socketRef.current = ws;

            ws.onopen = () => console.log('Connected to Hub');
            ws.onmessage = (event) => {
                if (!isActive) return;
                const data = JSON.parse(event.data);
                
                if (data.type === 'user_list') {
                    setOnlineUsers(data.users);
                } else {
                    setMessages(prev => {
                        // Strict deduplication by ID
                        if (data.id && prev.some(m => m.id === data.id)) return prev;
                        // Fallback deduplication by content/time if ID is missing (history)
                        if (!data.id && prev.some(m => m.time === data.time && m.text === data.text && m.user === data.user)) return prev;
                        return [...prev, data];
                    });
                }
            };
            ws.onclose = () => console.log('Disconnected from Hub');
        };

        const fetchUser = async () => {
            try {
                const res = await fetch('/api/me');
                if (!isActive) return;
                if (res.ok) {
                    const data = await res.json();
                    const name = data.email.split('@')[0];
                    setUser({ name, email: data.email });
                    connect(name);
                } else {
                    navigate('/login');
                }
            } catch (e) {
                if (isActive) navigate('/login');
            }
        };

        fetchUser();

        return () => {
            isActive = false;
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [navigate]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const ws = socketRef.current;
        const target = selectedUser || "Global";
        if (message.trim()) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                const msgData = {
                    user: user.name,
                    text: message,
                    time: new Date().toISOString(),
                    to: target
                };
                ws.send(JSON.stringify(msgData));
                setMessage("");
            } else {
                console.error("Cannot send message: WebSocket is not open. State:", ws?.readyState);
            }
        }
    };

    const filteredMessages = messages.filter(msg => {
        if (selectedUser === "Global") {
            return !msg.to || msg.to === "Global";
        } else {
            // Private message filter:
            // (From me to selectedUser) OR (From selectedUser to me)
            return (msg.to === selectedUser && msg.user === user.name) ||
                   (msg.to === user.name && msg.user === selectedUser);
        }
    });

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        if (timeStr.includes(':') && timeStr.length < 10) return timeStr;
        try {
            const date = new Date(timeStr);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="network-hub-root">
            {/* Minimal Sidebar for Navigation */}
            <aside className="hub-sidebar">
                <div className="hub-sidebar-header">
                    <div className="hub-logo">
                        <div className="logo-icon"><Shield size={20} /></div>
                        <span>Chem Hub</span>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={18} />
                        <span>Dashboard</span>
                    </button>
                </div>

                <div className="online-section">
                    <div className="section-header">
                        <Users size={16} />
                        <span>Active Chats ({onlineUsers.length})</span>
                    </div>
                    <div className="user-list">
                        <div 
                            className={`user-item global-hub-item ${selectedUser === "Global" ? 'active' : ''}`}
                            onClick={() => setSelectedUser("Global")}
                        >
                            <div className="user-avatar global-avatar">G</div>
                            <span className="user-name">Global Hub</span>
                            <div className="status-indicator online"></div>
                        </div>

                        {onlineUsers.filter(u => u !== user.name).map((u, i) => (
                            <div 
                                key={i} 
                                className={`user-item ${selectedUser === u ? 'active' : ''}`}
                                onClick={() => setSelectedUser(u)}
                            >
                                <div className="user-avatar" style={{ background: `hsl(${i * 45}, 70%, 50%)` }}>
                                    {u.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name">{u}</span>
                                <div className="status-indicator online"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hub-sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar-large">{user.name.charAt(0).toUpperCase()}</div>
                        <div className="user-details">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                <header className="chat-main-header">
                    <div className="header-info">
                        <h1>{selectedUser === "Global" ? "Network Hub" : `Chat with ${selectedUser}`}</h1>
                        <p>{selectedUser === "Global" ? "Real-time collaboration with your peer group." : "Private direct message session."}</p>
                    </div>
                    <div className="header-actions">
                        <div className="security-badge">
                            <Shield size={14} />
                            <span>{selectedUser === "Global" ? "Public" : "Private"} Hub</span>
                        </div>
                    </div>
                </header>

                <div className="chat-view">
                    <div className="messages-display">
                        {filteredMessages.length === 0 && (
                            <div className="welcome-notice">
                                <div className="welcome-icon"><MessageSquare size={32} /></div>
                                <h2>{selectedUser === "Global" ? "Welcome to the Hub" : `Start chatting with ${selectedUser}`}</h2>
                                <p>This is the start of your {selectedUser === "Global" ? "peer collaboration" : "private conversation"}.</p>
                            </div>
                        )}
                        
                        {filteredMessages.map((msg, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                key={msg.id || idx}
                                className={`chat-message-row ${msg.user === user.name ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">
                                    {msg.user !== user.name && selectedUser === "Global" && <div className="msg-user">{msg.user}</div>}
                                    <div className="msg-bubble">
                                        <div className="msg-text">{msg.text}</div>
                                        <div className="msg-meta">
                                            {formatTime(msg.time)}
                                            {msg.to !== "Global" && msg.to && <span className="private-tag">Private</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="hub-input-area" onSubmit={handleSendMessage}>
                        <div className="hub-input-container">
                            <input
                                type="text"
                                placeholder={`Message ${selectedUser === "Global" ? "the hub" : selectedUser}...`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit" className="hub-send-btn" disabled={!message.trim()}>
                                <Send size={18} />
                                <span>Send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default NetworkHub;

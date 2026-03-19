import React, { useState, useRef } from 'react';
import { Mail, Lock, LogIn, UserPlus, EyeOff, Eye, Component } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        setErrorMsg("Connecting to server...");

        const endpoint = isLogin ? '/api/login' : '/api/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                setErrorMsg(data.message);
                if (isLogin) {
                    window.location.href = data.redirect || '/dashboard';
                } else {
                    setIsLogin(true);
                    setEmail('');
                    setPassword('');
                    setErrorMsg("Registration successful! Please sign in.");
                }
            } else {
                setErrorMsg(data.message || "An error occurred.");
            }
        } catch (err) {
            setErrorMsg("Network error. Make sure Python backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    // ═══ Smooth Mouse Parallax ═══
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        // Calculate normalized mouse coordinates (-1 to 1)
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        // Update CSS variables for targeted parallax layers
        containerRef.current.style.setProperty('--mouse-x', x);
        containerRef.current.style.setProperty('--mouse-y', y);
    };

    return (
        <div
            className="login-fullscreen-container"
            ref={containerRef}
            onMouseMove={handleMouseMove}
        >
            {/* Top Left Logo */}
            <div className="login-brand">
                <div className="brand-icon">
                    {/* Component icon replaces Flask to match the Ebolt geometry */}
                    <Component size={18} color="#ffffff" strokeWidth={2.5} />
                </div>
                <h1>ChemSage</h1>
            </div>

            {/* Center Card Container */}
            <div className="auth-card-container">
                <div className="auth-card">
                    <div className="auth-icon-box">
                        {isLogin ? <LogIn size={20} strokeWidth={2.5} /> : <UserPlus size={20} strokeWidth={2.5} />}
                    </div>

                    <h2>{isLogin ? "Sign in with email" : "Join ChemSage"}</h2>
                    <p className="subtitle">
                        {isLogin
                            ? "Make a new doc to bring your words, data, and teams together. For free"
                            : "Create your free account today and start organizing your workspace."}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={16} />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {/* Toggle password visibility */}
                                <div onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <Eye className="input-icon-right" size={16} />
                                    ) : (
                                        <EyeOff className="input-icon-right" size={16} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {isLogin && (
                            <button type="button" className="forgot-password">
                                Forgot password?
                            </button>
                        )}

                        {!isLogin && <div style={{ marginBottom: "20px" }} />}

                        {errorMsg && (
                            <div className={`message-solid ${(errorMsg.includes('successful') || errorMsg.includes('Connecting')) ? 'success' : 'error'}`}>
                                {errorMsg}
                            </div>
                        )}

                        <button type="submit" className="btn-black" disabled={isLoading}>
                            {isLoading ? "Processing..." : "Get Started"}
                        </button>



                        <div className="auth-switch-box">
                            {isLogin ? "New to ChemSage?" : "Already have an account?"}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsLogin(!isLogin);
                                    setErrorMsg('');
                                }}
                                type="button"
                            >
                                {isLogin ? "Sign up" : "Sign in"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import { FlaskConical, Mail, Lock } from 'lucide-react';
import MolecularBackground from './MolecularBackground'; 
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    return (
        <div className="login-fullscreen-container">
            
            {/* The interactive canvas stays in the background */}
            <MolecularBackground />

            {/* Centered stage for the main UI */}
            <div className="center-stage">
                
                {/* The new unified glass interface window */}
                <div className="premium-glass-window">
                    
                    {/* Left Side: Branding & Welcome */}
                    <div className="window-left">
                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            ChemSAGE Network Live
                        </div>

                        <div className="hero-brand">
                            <div className="icon-glow">
                                <FlaskConical size={32} color="#60a5fa" strokeWidth={2.5} />
                            </div>
                            <h1>ChemSAGE</h1>
                        </div>

                        <h2 className="hero-title">
                            Master your<br />chemistry<br />journey.
                        </h2>

                        <p className="hero-description">
                            Access resources, track assignments, and collaborate seamlessly in one intelligent environment.
                        </p>
                    </div>

                    {/* Right Side: The Form Panel */}
                    <div className="window-right">
                        <div className="form-panel">
                            <div className="panel-header">
                                <h3>{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
                                <p>{isLogin ? 'Sign in to your dashboard' : 'Join the platform today'}</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@university.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={18} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {isLogin && (
                                    <div className="form-options">
                                        <label className="remember-me">
                                            <input type="checkbox" />
                                            <span>Remember me</span>
                                        </label>
                                        <button type="button" className="forgot-password">
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className={`message-solid ${errorMsg.includes('successful') ? 'success' : 'error'}`}>
                                        {errorMsg}
                                    </div>
                                )}

                                <button type="submit" className="btn-primary" disabled={isLoading}>
                                    {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                                </button>

                                <div className="divider">
                                    <span>or continue with</span>
                                </div>

                                <button type="button" className="btn-google">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" width="18" height="18" />
                                    Sign in with Google
                                </button>

                                <div className="auth-switch">
                                    {isLogin ? "New to ChemSAGE?" : "Already have an account?"}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsLogin(!isLogin);
                                            setErrorMsg('');
                                        }}
                                        type="button"
                                    >
                                        {isLogin ? "Create an account" : "Log in"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
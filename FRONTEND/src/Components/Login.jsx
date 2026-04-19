import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, AlertCircle, Eye, EyeOff, User, Hash, BookOpen } from 'lucide-react';
import { apiService } from '../api/service';
import './Login.css';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('teacher'); // default to teacher
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rollNo: '', // For student only
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (isLogin) {
                const data = await apiService.login(formData.email, formData.password);
                onLogin(data, rememberMe);
            } else {
                // Registration
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: 'teacher'
                };
                const res = await apiService.register(payload);
                setSuccessMsg(res.message || 'Registration successful! You can now sign in.');
                setIsLogin(true); // Switch to login view
            }
        } catch (err) {
            setError(err.message || (isLogin ? 'Invalid credentials' : 'Registration failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-header-top">
                <div className="logo-circle">
                    <GraduationCap size={40} color="#ffffff" />
                </div>
                <h1>Student Attendance</h1>
                <p className="subtitle">Unified Analytics Platform</p>
            </div>

            <div className="login-card">
                <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>


                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    )}


                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                id="email"
                                placeholder={isLogin ? "user@example.com" : "teacher@school.com"}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="success-message" style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '6px', marginBottom: '15px' }}>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading 
                            ? (isLogin ? 'Signing In...' : 'Registering...') 
                            : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                    
                    <div className="toggle-mode-container" style={{ textAlign: 'center', marginTop: '15px' }}>
                        <span style={{ color: '#6b7280' }}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button type="button" className="text-btn" onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '500', cursor: 'pointer' }}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="login-footer">
                <p>&copy; 2026 Student Attendance Analytics System</p>
            </div>
        </div>
    );
};

export default Login;

import React from 'react';
import './Navbar.css';
import { LayoutDashboard, Users, ClipboardCheck, FileText, LogOut, GraduationCap } from 'lucide-react';

const Navbar = ({ activeTab, onTabChange, onLogout, user }) => {
    const getUserInitials = () => {
        if (!user || !user.name) return '??';
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const tabs = [
        { id: 'dashboard', label: user?.role === 'parent' ? "Child's Attendance" : 'Dashboard', icon: LayoutDashboard, roles: ['teacher', 'admin', 'student', 'parent'] },
        { id: 'students', label: 'Students', icon: Users, roles: ['teacher', 'admin'] },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['teacher', 'admin'] },
        { id: 'reports', label: 'Reports', icon: FileText, roles: ['teacher', 'admin'] },
        { id: 'leave', label: 'Leave Requests', icon: FileText, roles: ['teacher', 'admin', 'student'] },
    ];

    const filteredTabs = tabs.filter(tab => tab.roles.includes(user?.role || 'teacher'));

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="brand-logo-container">
                    <GraduationCap size={22} strokeWidth={2.5} />
                </div>
                <div className="brand-text">
                    <span className="brand-title">EduAttend</span>
                    <span className="brand-subtitle">Analytics Platform</span>
                </div>
            </div>

            <ul className="navbar-nav">
                {filteredTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <li key={tab.id} className="nav-item">
                            <button
                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => onTabChange(tab.id)}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="navbar-profile">
                <div className="user-info">
                    <span className="user-name">{user?.name || 'User'}</span>
                    <span className="user-role">{user?.role || 'Staff'}</span>
                </div>
                <div className="avatar">{getUserInitials()}</div>
                <button className="logout-btn" title="Logout" onClick={onLogout}>
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

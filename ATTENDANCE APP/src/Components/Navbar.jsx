import React from 'react';
import './Navbar.css';
import { LayoutDashboard, Users, ClipboardCheck, FileText, LogOut, GraduationCap } from 'lucide-react';

const Navbar = ({ activeTab, onTabChange, onLogout }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'reports', label: 'Reports', icon: FileText },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="brand-logo-container">
                    <GraduationCap size={20} />
                </div>
                <span>Attendance Analytics</span>
            </div>

            <ul className="navbar-nav">
                {tabs.map((tab) => {
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
                    <span className="user-name">Mr. John Smith</span>
                    <span className="user-role">Teacher</span>
                </div>
                <div className="avatar">JS</div>
                <button className="logout-btn" title="Logout" onClick={onLogout}>
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

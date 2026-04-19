import React, { useState, useEffect } from 'react';
import { User, Calendar, BookOpen, Clock, Activity, Target } from 'lucide-react';
import { apiService } from '../api/service';
import './StudentDashboard.css';

const StudentDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyStatus, setDailyStatus] = useState('Loading...');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        fetchDailyStatus();
    }, [selectedDate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [statsData, announcementsData] = await Promise.all([
                apiService.getMyStats().catch(() => null),
                apiService.getAnnouncements().catch(() => [])
            ]);
            
            if (statsData && !statsData.message) {
                setStats(statsData);
            }
            setAnnouncements(announcementsData);
        } catch (error) {
            console.error("Error loading student data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDailyStatus = async () => {
        try {
            setDailyStatus('Checking...');
            const data = await apiService.getMyAttendanceStatus(selectedDate);
            setDailyStatus(data.status);
        } catch (error) {
            setDailyStatus('Error');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present': return <Target className="text-success" size={24} />;
            case 'Absent': return <Activity className="text-danger" size={24} />;
            case 'No Record': return <Calendar className="text-muted" size={24} />;
            default: return <Clock size={24} />;
        }
    };

    const getStatusClass = (status) => {
        if (status === 'Present') return 'status-present';
        if (status === 'Absent') return 'status-absent';
        return 'status-none';
    };

    if (isLoading) {
        return <div className="student-dashboard loading">Loading your reports...</div>;
    }

    return (
        <div className="student-dashboard">
            <header className="dashboard-header">
                <div className="welcome-section">
                    <h1>Welcome back, {user?.name.split(' ')[0]}!</h1>
                    <p>Here is your attendance summary and latest school updates.</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Stats Section */}
                <div className="stats-card glass-panel">
                    <div className="card-header-with-action">
                        <h2>Attendance Overview</h2>
                        <div className="date-picker-mini">
                            <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mini-date-input"
                            />
                        </div>
                    </div>
                    
                    {/* Daily Status Highlight */}
                    <div className={`daily-status-banner ${getStatusClass(dailyStatus)}`}>
                        <div className="status-info">
                            <span className="status-label">Status for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="status-text">{dailyStatus}</span>
                        </div>
                        <div className="status-icon-wrapper">
                            {getStatusIcon(dailyStatus)}
                        </div>
                    </div>

                    {stats ? (
                        <div className="stats-content">
                            <div className="percentage-circle">
                                <div className="circle-inner">
                                    <span className="percentage-value">{stats.percentage}%</span>
                                    <span className="percentage-label">Overall</span>
                                </div>
                            </div>
                            <div className="stats-details">
                                <div className="stat-item positive">
                                    <Target size={20}/>
                                    <div>
                                        <span className="stat-val">{stats.presentDays}</span>
                                        <span className="stat-name">Days Present</span>
                                    </div>
                                </div>
                                <div className="stat-item negative">
                                    <Activity size={20}/>
                                    <div>
                                        <span className="stat-val">{stats.absentDays}</span>
                                        <span className="stat-name">Days Absent</span>
                                    </div>
                                </div>
                                <div className="stat-item neutral">
                                    <Clock size={20}/>
                                    <div>
                                        <span className="stat-val">{stats.totalDays}</span>
                                        <span className="stat-name">Total Working Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-data">
                            <Calendar size={40} />
                            <p>No attendance records found yet.</p>
                        </div>
                    )}
                </div>

                {/* Announcements Section */}
                <div className="announcements-card glass-panel">
                    <h2>Recent Announcements</h2>
                    <div className="announcements-list">
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <div key={announcement._id} className="announcement-item">
                                    <div className="announcement-header">
                                        <h3>{announcement.title}</h3>
                                        <span className="date">{new Date(announcement.postedOn).toLocaleDateString()}</span>
                                    </div>
                                    <p className="content">{announcement.content}</p>
                                    <div className="author">
                                        <User size={14} /> {announcement.author?.name || 'Teacher'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">
                                <BookOpen size={40} />
                                <p>No new announcements.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

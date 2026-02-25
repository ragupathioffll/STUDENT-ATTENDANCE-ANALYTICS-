import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { apiService } from '../api/service';

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        averageAttendance: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats(selectedDate);
    }, [selectedDate]);

    const fetchStats = async (date) => {
        setLoading(true);
        try {
            const stats = await apiService.getDashboardStats(date);
            setMetrics(stats);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    if (loading && !metrics.totalStudents) return <div className="dashboard-loading">Loading metrics...</div>;

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">Attendance overview for {selectedDate}</p>
            </div>

            <div className="dashboard-content">
                {/* 1. Date Selector */}
                <div className="dashboard-date-section">
                    <label htmlFor="dashboard-date" className="date-label">Date:</label>
                    <input
                        type="date"
                        id="dashboard-date"
                        className="date-input"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                </div>

                {error && <div className="dashboard-error" style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

                {/* 2. Metrics Grid - 2x2 Layout */}
                <div className="metrics-grid">
                    {/* Total Students */}
                    <div className="metric-card total">
                        <div className="metric-info">
                            <span className="metric-label">Total Students</span>
                            <div className="metric-value">{metrics.totalStudents}</div>
                        </div>
                        <div className="metric-icon">
                            <Users size={24} />
                        </div>
                    </div>

                    {/* Present Today */}
                    <div className="metric-card present">
                        <div className="metric-info">
                            <span className="metric-label">Present</span>
                            <div className="metric-value">{metrics.presentToday}</div>
                        </div>
                        <div className="metric-icon">
                            <UserCheck size={24} />
                        </div>
                    </div>

                    {/* Absent */}
                    <div className="metric-card absent">
                        <div className="metric-info">
                            <span className="metric-label">Absent</span>
                            <div className="metric-value">{metrics.absentToday}</div>
                        </div>
                        <div className="metric-icon">
                            <UserX size={24} />
                        </div>
                    </div>

                    {/* Average Attendance */}
                    <div className="metric-card average">
                        <div className="metric-info">
                            <span className="metric-label">Average Attendance</span>
                            <div className="metric-value">{metrics.averageAttendance}%</div>
                        </div>
                        <div className="metric-icon">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

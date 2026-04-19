import React, { useState, useEffect } from 'react';
import { Target, Activity, Clock, Calendar, ChevronRight } from 'lucide-react';
import { apiService } from '../api/service';
import './ParentDashboard.css';

const ParentDashboard = ({ user }) => {
    const [report, setReport] = useState(null);
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
            const data = await apiService.getParentReport();
            setReport(data);
        } catch (error) {
            console.error("Error loading parent report:", error);
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
        return <div className="parent-dashboard loading">Loading child's attendance report...</div>;
    }

    if (!report) {
        return <div className="parent-dashboard error">Could not load report. Please try again later.</div>;
    }

    const { student, summary, history } = report;

    return (
        <div className="parent-dashboard slide-up">
            <header className="dashboard-header">
                <div className="welcome-section">
                    <h1>Child's Progress: {student.name}</h1>
                    <p>Roll No: #{student.rollNo} | Class: {student.className}</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Stats Section */}
                <div className="stats-card glass-panel">
                    <div className="card-header-with-action">
                        <h2>Overall Performance</h2>
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

                    <div className="stats-content">
                        <div className="percentage-display">
                            <span className="perc-value">{summary.percentage}%</span>
                            <span className="perc-label">Attendance Score</span>
                        </div>
                        
                        <div className="stats-row">
                            <div className="mini-stat positive">
                                <span className="val">{summary.presentDays}</span>
                                <span className="lbl">Present</span>
                            </div>
                            <div className="mini-stat negative">
                                <span className="val">{summary.absentDays}</span>
                                <span className="lbl">Absent</span>
                            </div>
                            <div className="mini-stat neutral">
                                <span className="val">{summary.totalDays}</span>
                                <span className="lbl">Total Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="history-card glass-panel">
                    <h2>Attendance History</h2>
                    <div className="history-table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>STATUS</th>
                                    <th>REASON FOR ABSENCE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map((record, index) => (
                                    <tr key={index} className={record.status.toLowerCase()}>
                                        <td className="date-cell">
                                            <Calendar size={14} className="mr-2" />
                                            {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <span className={`status-pill ${record.status.toLowerCase()}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="reason-cell">
                                            {record.status === 'Absent' ? (
                                                <span className="reason-text">{record.reason || 'No reason provided'}</span>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="no-data">No attendance records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;

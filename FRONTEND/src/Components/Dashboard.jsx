import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Users, UserCheck, UserX, TrendingUp, CheckSquare, ChevronRight, Activity, AlertTriangle, UserPlus, Download } from 'lucide-react';
import { apiService } from '../api/service';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ students = [], onNavigate }) => {
    // Current date formatted
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const todayFormatted = new Date().toLocaleDateString('en-US', dateOptions);
    const currentDateISO = new Date().toISOString().split('T')[0];

    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        averageAttendance: 0,
        chartData: []
    });
    
    const [extendedData, setExtendedData] = useState({
        classPerformance: [],
        atRiskStudents: [],
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats(currentDateISO, 'All');
        fetchExtendedData();
    }, []);

    const fetchExtendedData = async () => {
        try {
            // Fetch 30 day report for class performance & at-risk
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const from = thirtyDaysAgo.toISOString().split('T')[0];
            const to = currentDateISO;
            
            const report = await apiService.getAttendanceReport(from, to);
            
            const classAverages = {};
            report.forEach(s => {
                const cls = s.className || 'Unassigned';
                if (!classAverages[cls]) classAverages[cls] = { total: 0, count: 0 };
                classAverages[cls].total += Number(s.percentage);
                classAverages[cls].count += 1;
            });
            const classPerf = Object.keys(classAverages).map(cls => ({
                name: cls,
                value: Math.round(classAverages[cls].total / classAverages[cls].count)
            }));
            
            const atRisk = report.filter(s => Number(s.percentage) < 85).map((s, idx) => {
                const colors = ['#3b82f6', '#a855f7', '#22c55e', '#eab308', '#ef4444'];
                return {
                    name: s.name,
                    class: s.className || '-',
                    perc: `${Math.round(Number(s.percentage))}%`,
                    initials: s.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
                    color: colors[idx % colors.length]
                }
            }).slice(0, 4);

            setExtendedData(prev => ({
                ...prev,
                classPerformance: classPerf,
                atRiskStudents: atRisk
            }));
        } catch (err) {
            console.error('Error fetching extended data:', err);
        }
    };

    const fetchStats = async (date, className) => {
        setLoading(true);
        try {
            const stats = await apiService.getDashboardStats(date, className);
            setMetrics(stats);
            
            // Build recent activities dynamically from the chartData
            if (stats.chartData && stats.chartData.length > 0) {
                 const activities = stats.chartData.slice(-3).reverse().map((c, i) => {
                     return {
                         type: 'attendance',
                         title: 'Attendance Saved',
                         desc: `System logged ${c.percentage}% average attendance for this day`,
                         time: c.date === stats.today ? 'Today' : c.date
                     }
                 });
                 // Add a mock new student event
                 if (students && students.length > 0) {
                     const newest = students[students.length - 1];
                     activities.splice(1, 0, {
                         type: 'student',
                         title: 'New Student Added',
                         desc: `${newest.name} joined ${newest.className}`,
                         time: 'Recently'
                     });
                 }
                 setExtendedData(prev => ({ ...prev, recentActivity: activities.slice(0, 4) }));
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };
    
    // Dynamic donut chart data based on real metrics
    const pieData = metrics.presentToday > 0 || metrics.absentToday > 0 ? [
        { name: 'Present', value: metrics.presentToday, color: '#10b981' },
        { name: 'Absent', value: metrics.absentToday, color: '#ef4444' }
    ] : [];

    // Map the chartData from backend into what recharts bar chart expects. 
    const dynamicBarData = metrics.chartData && metrics.chartData.length > 0 
        ? metrics.chartData.map(c => {
            // Ensure we handle date parsing properly
            const d = new Date(c.date);
            // Check if date is valid
            const isValid = !isNaN(d.getTime());
            return {
                name: isValid ? d.toLocaleDateString('en-US', { weekday: 'short' }) : '?',
                value: c.percentage || 0
            }
        }) : [];

    // Improved fallback: If there is no data, generate the actual last 5 weekdays dynamically
    const getFallbackData = () => {
        const fallback = [];
        const today = new Date();
        for (let i = 4; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            fallback.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                value: 0
            });
        }
        return fallback;
    };

    const barData = dynamicBarData.length > 0 ? dynamicBarData : getFallbackData();

    // Class Performance, At Risk, and Recent Activity from extendedData
    const classPerformance = extendedData.classPerformance.length > 0 ? extendedData.classPerformance : [];

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header-modern">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div className="dashboard-date-display">
                        <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>{todayFormatted}</span>
                    </div>
                </div>
                <button className="mark-attendance-btn" onClick={() => onNavigate && onNavigate('attendance')}>
                    <CheckSquare size={18} />
                    Mark Today's Attendance
                </button>
            </div>

            <div className="dashboard-content-modern">
                {/* Metrics Grid */}
                <div className="metrics-cards-row">
                    {/* Total Students */}
                    <div className="metric-box box-blue">
                        <div className="metric-box-content">
                            <div>
                                <div className="metric-title">Total Students</div>
                                <div className="metric-value">{metrics.totalStudents}</div>
                                <div className="metric-trend trend-up">↗ +3 vs yesterday</div>
                            </div>
                            <div className="metric-icon-bg icon-bg-blue">
                                <Users size={24} color="#3b82f6" />
                            </div>
                        </div>
                    </div>

                    {/* Present */}
                    <div className="metric-box box-green">
                        <div className="metric-box-content">
                            <div>
                                <div className="metric-title">Present Today</div>
                                <div className="metric-value">{metrics.presentToday}</div>
                                <div className="metric-trend trend-up">↗ +5 vs yesterday</div>
                            </div>
                            <div className="metric-icon-bg icon-bg-green">
                                <UserCheck size={24} color="#10b981" />
                            </div>
                        </div>
                    </div>

                    {/* Absent */}
                    <div className="metric-box box-red">
                        <div className="metric-box-content">
                            <div>
                                <div className="metric-title">Absent Today</div>
                                <div className="metric-value">{metrics.absentToday}</div>
                                <div className="metric-trend trend-down">↘ -5 vs yesterday</div>
                            </div>
                            <div className="metric-icon-bg icon-bg-red">
                                <UserX size={24} color="#ef4444" />
                            </div>
                        </div>
                    </div>

                    {/* Average */}
                    <div className="metric-box box-purple">
                        <div className="metric-box-content">
                            <div>
                                <div className="metric-title">Avg. Attendance</div>
                                <div className="metric-value">{metrics.averageAttendance}%</div>
                                <div className="metric-trend trend-up">↗ +2% vs yesterday</div>
                            </div>
                            <div className="metric-icon-bg icon-bg-purple">
                                <TrendingUp size={24} color="#8b5cf6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="charts-row">
                    {/* Left Chart (Donut) */}
                    <div className="chart-card donut-chart-card">
                        <div className="chart-header">
                            <h3>Today's Overview</h3>
                            <p>Present vs Absent ratio</p>
                        </div>
                        <div className="donut-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-legend">
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                                    <span>Present: <strong>{metrics.presentToday}</strong></span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                                    <span>Absent: <strong>{metrics.absentToday}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Chart (Bar) */}
                    <div className="chart-card bar-chart-card">
                        <div className="chart-header flex-between">
                            <div>
                                <h3>Attendance Trend</h3>
                                <p>Student presence over time</p>
                            </div>
                            <div className="toggle-group">
                                <button className="toggle-btn active">Week</button>
                                <button className="toggle-btn">Monthly</button>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 250, marginTop: '20px' }}>
                            <ResponsiveContainer>
                                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={35}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} domain={[0, 100]} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Section (3 Columns) */}
                <div className="bottom-row-grid">
                    {/* Column 1: Class Performance */}
                    <div className="bottom-card">
                        <div className="chart-header">
                            <h3>Class Performance</h3>
                            <p>Attendance % by class</p>
                        </div>
                        <div className="progress-list">
                            {classPerformance.map((cls, idx) => (
                                <div key={idx} className="progress-item">
                                    <div className="progress-label-row">
                                        <span className="class-name">{cls.name}</span>
                                        <span className={`class-perc ${cls.value >= 90 ? 'text-green' : 'text-yellow'}`}>{cls.value}%</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className={`progress-fill ${cls.value >= 90 ? 'bg-green' : 'bg-yellow'}`} style={{ width: `${cls.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: At-Risk Students */}
                    <div className="bottom-card">
                        <div className="chart-header flex-between mb-4">
                            <div>
                                <h3>At-Risk Students</h3>
                                <p>Below 85% attendance</p>
                            </div>
                            <span className="badge-red-soft">3</span>
                        </div>
                        <div className="at-risk-list">
                            {extendedData.atRiskStudents.length > 0 ? extendedData.atRiskStudents.map((student, idx) => (
                                <div key={idx} className="student-risk-item">
                                    <div className="student-risk-info">
                                        <div className="student-avatar" style={{ backgroundColor: student.color }}>{student.initials}</div>
                                        <div>
                                            <div className="student-name">{student.name}</div>
                                            <div className="student-class">{student.class}</div>
                                        </div>
                                    </div>
                                    <div className="student-risk-perc">
                                        {student.perc} <span className="arrow-down">↘</span>
                                    </div>
                                </div>
                            )) : <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '10px' }}>No at-risk students found.</div>}
                        </div>
                        <div className="view-all-link">
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('reports'); }}>View full report <ChevronRight size={14} /></a>
                        </div>
                    </div>

                    {/* Column 3: Recent Activity */}
                    <div className="bottom-card">
                        <div className="chart-header">
                            <h3>Recent Activity</h3>
                            <p>Latest system events</p>
                        </div>
                        <div className="activity-list">
                            {extendedData.recentActivity.map((activity, idx) => (
                                <div key={idx} className="activity-item">
                                    <div className={`activity-icon ${activity.type === 'attendance' ? 'bg-green-soft' : 'bg-blue-soft'}`}>
                                        {activity.type === 'attendance' ? <CheckSquare size={16} color="#10b981" /> : <UserPlus size={16} color="#3b82f6" />}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">{activity.title}</div>
                                        <div className="activity-desc">{activity.desc}</div>
                                        <div className="activity-time">{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                            {extendedData.recentActivity.length === 0 && (
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No recent activity.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

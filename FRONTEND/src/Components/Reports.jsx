import React, { useState, useEffect } from 'react';
import { Filter, Search, BarChart2 } from 'lucide-react';
import { apiService } from '../api/service';
import './Reports.css';

const Reports = () => {
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const data = await apiService.getAttendanceReport(dateRange.from, dateRange.to);
            setReportData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching report:', err);
            setError('Failed to load attendance report');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const getStatusInfo = (percentage) => {
        if (percentage >= 90) return { label: 'Excellent', color: 'green' };
        if (percentage >= 75) return { label: 'Average', color: 'yellow' };
        return { label: 'At Risk', color: 'red' };
    };

    const uniqueClasses = [...new Set(reportData.map(s => s.className))].filter(Boolean);

    let filteredReportData = reportData.filter(student => 
        (selectedClass === 'All' || student.className === selectedClass) &&
        (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         (student.rollNo && student.rollNo.toString().toLowerCase().includes(searchQuery.toLowerCase())))
    );

    if (statusFilter !== 'All') {
        filteredReportData = filteredReportData.filter(s => getStatusInfo(s.percentage).label === statusFilter);
    }

    // Summary calculations
    const avgAttendance = filteredReportData.length > 0 
        ? Math.round(filteredReportData.reduce((acc, curr) => acc + Number(curr.percentage), 0) / filteredReportData.length)
        : 0;
        
    let highestAttendance = { percentage: 0, names: '-', count: 0 };
    let lowestAttendance = { percentage: 100, names: '-', count: 0 };

    if (filteredReportData.length > 0) {
        // Find max value
        const maxVal = Math.max(...filteredReportData.map(s => Number(s.percentage)));
        const topStudents = filteredReportData.filter(s => Number(s.percentage) === maxVal);
        highestAttendance = {
            percentage: maxVal,
            names: topStudents.map(s => s.name).join(', '),
            count: topStudents.length
        };

        // Find min value
        const minVal = Math.min(...filteredReportData.map(s => Number(s.percentage)));
        const bottomStudents = filteredReportData.filter(s => Number(s.percentage) === minVal);
        lowestAttendance = {
            percentage: minVal,
            names: bottomStudents.map(s => s.name).join(', '),
            count: bottomStudents.length
        };
    }

    return (
        <div className="reports-container-modern">
            {/* Filter Section */}
            <div className="reports-filters-card">
                <div className="filters-header">
                    <Filter size={16} /> Filters
                </div>
                <div className="filters-row">
                    <div className="search-filter-box">
                        <Search size={16} className="text-gray" />
                        <input 
                            type="text" 
                            placeholder="Search student..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select 
                        className="class-filter-select"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="All">All Classes</option>
                        {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                    
                    <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} className="date-filter-picker" />
                    <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} className="date-filter-picker" />

                    <div className="status-toggles">
                        {['All', 'Excellent', 'Average', 'At Risk'].map(status => (
                            <button
                                key={status}
                                className={`toggle-pill ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="reports-table-card">
                <div className="table-header flex-between">
                    <h2>Student Attendance Summary</h2>
                    <span className="student-count">{filteredReportData.length} students</span>
                </div>
                
                {loading ? (
                    <div className="p-4 text-center">Loading...</div>
                ) : error ? (
                    <div className="p-4 text-center text-red">{error}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="modern-report-table">
                            <thead>
                                <tr>
                                    <th>STUDENT</th>
                                    <th>CLASS</th>
                                    <th>TOTAL DAYS</th>
                                    <th>PRESENT</th>
                                    <th>ABSENT</th>
                                    <th>ATTENDANCE</th>
                                    <th>STATUS</th>
                                    <th>TREND</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReportData.map((student) => {
                                    const statusInfo = getStatusInfo(student.percentage);

                                    return (
                                        <tr key={student._id}>
                                            <td>
                                                <div className="student-name-block">
                                                    <span className="s-name">{student.name}</span>
                                                    <span className="s-id">#{student.rollNo}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="class-pill">{student.className}</span>
                                            </td>
                                            <td className="text-blue-number" style={{fontWeight: '600', color: '#3b82f6'}}>{student.totalDays}</td>
                                            <td className="text-green-number">{student.presentDays}</td>
                                            <td className="text-red-number">{student.absentDays}</td>
                                            <td>
                                                <div className="att-progress-cell">
                                                    <div className="att-progress-bar">
                                                        <div className={`att-progress-fill bg-${statusInfo.color}`} style={{ width: `${student.percentage}%` }}></div>
                                                    </div>
                                                    <span className="att-perc-value">{student.percentage}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill status-${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td>
                                                {student.percentage >= 90 ? (
                                                    <span className="trend-icon text-green">↗</span>
                                                ) : student.percentage >= 75 ? (
                                                    <span className="trend-icon text-gray">—</span>
                                                ) : (
                                                    <span className="trend-icon text-red">↘</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredReportData.length === 0 && (
                                    <tr><td colSpan="8" style={{textAlign: 'center', padding: '24px', color: '#9ca3af'}}>No data found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bottom Summary Cards */}
            <div className="summary-cards-row">
                <div className="summary-card">
                    <div className="summary-info">
                        <span className="sum-label">Average Attendance</span>
                        <span className="sum-value text-blue">{avgAttendance}%</span>
                        <span className="sum-sub">Across filtered students</span>
                    </div>
                    <div className="sum-icon bg-blue-soft">
                        <BarChart2 size={20} color="#3b82f6" />
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-info">
                        <span className="sum-label">Highest Attendance</span>
                        <span className="sum-value text-green">{highestAttendance.percentage}%</span>
                        <span className="sum-sub">{highestAttendance.names}</span>
                    </div>
                    <div className="sum-icon bg-green-soft">
                        <BarChart2 size={20} color="#10b981" />
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-info">
                        <span className="sum-label">Lowest Attendance</span>
                        <span className="sum-value text-red">{lowestAttendance.percentage}%</span>
                        <span className="sum-sub">{lowestAttendance.names}</span>
                    </div>
                    <div className="sum-icon bg-red-soft">
                        <BarChart2 size={20} color="#ef4444" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

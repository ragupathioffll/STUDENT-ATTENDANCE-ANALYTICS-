import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { apiService } from '../api/service';
import './Reports.css';

const Reports = () => {
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Default last 30 days
        to: new Date().toISOString().split('T')[0]
    });

    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleExport = () => {
        alert("Export functionality would download a CSV file here.");
    };

    const getPercentageClass = (percentage) => {
        if (percentage >= 75) return 'percentage-high';
        if (percentage >= 50) return 'percentage-medium';
        return 'percentage-low';
    };

    return (
        <div className="reports-container">
            {/* Controls */}
            <div className="report-controls">
                <div className="date-range-selector">
                    <div className="date-group">
                        <label htmlFor="from-date">From:</label>
                        <input
                            type="date"
                            id="from-date"
                            name="from"
                            className="date-input"
                            value={dateRange.from}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className="date-group">
                        <label htmlFor="to-date">To:</label>
                        <input
                            type="date"
                            id="to-date"
                            name="to"
                            className="date-input"
                            value={dateRange.to}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Report Table */}
            <div className="report-table-card">
                <h3>Attendance Report</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading report data...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
                ) : (
                    <table className="table student-table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Total Days</th>
                                <th>Present Days</th>
                                <th>Absent Days</th>
                                <th>Attendance %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length > 0 ? (
                                reportData.map((student) => (
                                    <tr key={student._id}>
                                        <td>{student.rollNo}</td>
                                        <td>{student.name}</td>
                                        <td>{student.className}</td>
                                        <td>{student.totalDays}</td>
                                        <td>{student.presentDays}</td>
                                        <td>{student.absentDays}</td>
                                        <td>
                                            <span className={`percentage-badge ${getPercentageClass(student.percentage)}`}>
                                                {student.percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#777' }}>
                                        No data available for selected range.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Reports;

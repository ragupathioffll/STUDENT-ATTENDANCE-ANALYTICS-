import React, { useState, useEffect } from 'react';
import { apiService } from '../api/service';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import './LeaveRequests.css';

const LeaveRequests = ({ user }) => {
    const isStudent = user?.role === 'student';
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form state (for students)
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Sick',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getLeaveRequests();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching leave requests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiService.applyLeave(formData);
            setShowForm(false);
            setFormData({ type: 'Sick', startDate: '', endDate: '', reason: '' });
            loadRequests(); // Refresh list
        } catch (error) {
            alert('Error applying for leave: ' + error.message);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await apiService.updateLeaveStatus(id, { status });
            loadRequests(); // Refresh list
        } catch (error) {
            alert('Error updating status: ' + error.message);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={18} color="#10b981" />;
            case 'Rejected': return <XCircle size={18} color="#ef4444" />;
            default: return <Clock size={18} color="#f59e0b" />;
        }
    };

    return (
        <div className="leave-requests-container">
            <div className="leave-header">
                <div>
                    <h1>Leave Management</h1>
                    <p>{isStudent ? 'Apply for leave and track status' : 'Review student leave applications'}</p>
                </div>
                {isStudent && (
                    <button className="btn-apply-leave" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Apply for Leave'}
                    </button>
                )}
            </div>

            {isStudent && showForm && (
                <div className="glass-panel form-panel">
                    <h2>New Leave Application</h2>
                    <form onSubmit={handleSubmit} className="leave-form">
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Leave Type</label>
                                <select name="type" value={formData.type} onChange={handleInputChange} required>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Personal">Personal Reason</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Reason</label>
                            <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows="3" required placeholder="Please provide details..."></textarea>
                        </div>
                        <button type="submit" className="btn-submit">Submit Application</button>
                    </form>
                </div>
            )}

            <div className="glass-panel list-panel">
                <h2>{isStudent ? 'Your Applications' : 'Pending Requests'}</h2>
                
                {isLoading ? (
                    <div className="loading-state">Loading records...</div>
                ) : requests.length > 0 ? (
                    <div className="requests-grid">
                        {requests.map(req => (
                            <div key={req._id} className="request-card">
                                <div className="req-header">
                                    <div className="req-type-status">
                                        <span className="req-type">{req.type}</span>
                                        <span className={`status-badge ${req.status.toLowerCase()}`}>
                                            {getStatusIcon(req.status)} {req.status}
                                        </span>
                                    </div>
                                    <div className="req-dates">
                                        <Calendar size={14}/> {req.startDate} to {req.endDate}
                                    </div>
                                </div>
                                
                                {!isStudent && req.studentId && (
                                    <div className="student-info-bar">
                                        <strong>{req.studentId.name}</strong> (Roll: {req.studentId.rollNo}, Class: {req.studentId.className})
                                    </div>
                                )}

                                <div className="req-reason">
                                    {req.reason}
                                </div>

                                {!isStudent && req.status === 'Pending' && (
                                    <div className="teacher-actions">
                                        <button onClick={() => handleStatusUpdate(req._id, 'Approved')} className="btn-approve">Approve</button>
                                        <button onClick={() => handleStatusUpdate(req._id, 'Rejected')} className="btn-reject">Reject</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-data">
                        <Calendar size={40} />
                        <p>No leave requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveRequests;

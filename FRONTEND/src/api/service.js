const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const getHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
    };
};

export const apiService = {
    // Auth
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    register: async (userData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        return data;
    },

    // Students
    getStudents: async () => {
        const response = await fetch(`${API_URL}/students`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch students');
        return data;
    },

    addStudent: async (studentData) => {
        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(studentData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add student');
        return data;
    },

    updateStudent: async (id, studentData) => {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(studentData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update student');
        return data;
    },

    deleteStudent: async (id) => {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete student');
        return data;
    },

    // Attendance
    getAttendance: async (date) => {
        const response = await fetch(`${API_URL}/attendance/${date}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (response.status === 404) return null; // No records for this date yet
        if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance');
        return data;
    },

    saveAttendance: async (date, records) => {
        const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ date, records })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to save attendance');
        return data;
    },

    // Dashboard
    getDashboardStats: async (date, className = 'All') => {
        let url = `${API_URL}/dashboard/stats?className=${encodeURIComponent(className)}`;
        if (date) url += `&date=${date}`;
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard stats');
        return data;
    },

    // Reports
    getAttendanceReport: async (startDate, endDate) => {
        const response = await fetch(`${API_URL}/reports/attendance-summary?startDate=${startDate}&endDate=${endDate}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance report');
        return data;
    },

    getMyStats: async () => {
        const response = await fetch(`${API_URL}/reports/my-stats`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch your stats');
        return data;
    },

    getMyAttendanceStatus: async (date) => {
        const response = await fetch(`${API_URL}/attendance/my-status/${date}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance status');
        return data;
    },

    getParentReport: async () => {
        const response = await fetch(`${API_URL}/reports/parent/my-child`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch parent report');
        return data;
    },

    // Leave Requests
    getLeaveRequests: async () => {
        const response = await fetch(`${API_URL}/leave-requests`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch leave requests');
        return data;
    },

    applyLeave: async (leaveData) => {
        const response = await fetch(`${API_URL}/leave-requests`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(leaveData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to apply for leave');
        return data;
    },

    updateLeaveStatus: async (id, statusData) => {
        const response = await fetch(`${API_URL}/leave-requests/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(statusData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update leave status');
        return data;
    },

    // Announcements
    getAnnouncements: async () => {
        const response = await fetch(`${API_URL}/announcements`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch announcements');
        return data;
    },

    postAnnouncement: async (announcementData) => {
        const response = await fetch(`${API_URL}/announcements`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(announcementData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to post announcement');
        return data;
    },

    deleteAnnouncement: async (id) => {
        const response = await fetch(`${API_URL}/announcements/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete announcement');
        return data;
    }
};

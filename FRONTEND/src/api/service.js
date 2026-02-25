const API_URL = 'http://localhost:5001/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
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
    getDashboardStats: async (date) => {
        const url = date ? `${API_URL}/dashboard/stats?date=${date}` : `${API_URL}/dashboard/stats`;
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
    }
};

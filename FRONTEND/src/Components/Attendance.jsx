import React, { useState, useEffect } from 'react';
import './Attendance.css';
import { Check, X, Save } from 'lucide-react';
import { apiService } from '../api/service';

const Attendance = ({ students, attendanceData, setAttendanceData }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentAttendance, setCurrentAttendance] = useState({});

    // Load attendance data for selected date
    useEffect(() => {
        const fetchDateAttendance = async () => {
            try {
                const data = await apiService.getAttendance(selectedDate);
                if (data) {
                    const formattedRecords = data.records.reduce((acc, rec) => ({
                        ...acc,
                        [rec.studentId._id || rec.studentId]: rec.status
                    }), {});
                    setCurrentAttendance(formattedRecords);
                } else {
                    setCurrentAttendance({});
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
                setCurrentAttendance({});
            }
        };

        fetchDateAttendance();
    }, [selectedDate]);

    const handleStatusChange = (studentId, status) => {
        setCurrentAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        try {
            const formattedRecords = Object.entries(currentAttendance).map(([studentId, status]) => ({
                studentId,
                status
            }));
            await apiService.saveAttendance(selectedDate, formattedRecords);

            // Update global state in App.jsx if needed (though useEffect handles it on reload)
            setAttendanceData(prev => ({
                ...prev,
                [selectedDate]: currentAttendance
            }));

            alert('Attendance saved successfully!');
        } catch (error) {
            alert('Error saving attendance: ' + error.message);
        }
    };

    // Calculate stats for the header
    const presentCount = Object.values(currentAttendance).filter(status => status === 'Present').length;
    const absentCount = Object.values(currentAttendance).filter(status => status === 'Absent').length;

    return (
        <div className="attendance-container">
            {/* Header Card: Date, Stats, Save */}
            <div className="attendance-header-card">
                <div className="header-left">
                    <div className="date-input-wrapper">
                        <input
                            type="date"
                            className="header-date-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="stats-container">
                        <span className="stat-badge present">
                            <span className="dot green"></span> Present: {presentCount}
                        </span>
                        <span className="stat-badge absent">
                            <span className="dot red"></span> Absent: {absentCount}
                        </span>
                    </div>
                </div>
                <button className="btn-save" onClick={handleSave}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    Save Attendance
                </button>
            </div>

            

            {/* Student List - Cards */}
            <div className="student-list">
                {students.map((student) => (
                    <div className="student-card" key={student._id}>
                        <div className="student-info-section">
                            <div className="student-avatar">
                                {student.rollNo}
                            </div>
                            <div className="student-details">
                                <h4 className="student-name">{student.name}</h4>
                                <span className="student-class">{student.className}</span>
                            </div>
                        </div>

                        <div className="attendance-actions">
                            <button
                                className={`attendance-toggle present ${currentAttendance[student._id] === 'Present' ? 'active' : ''}`}
                                onClick={() => handleStatusChange(student._id, 'Present')}
                            >
                                <Check size={18} />
                                <span>Present</span>
                            </button>
                            <button
                                className={`attendance-toggle absent ${currentAttendance[student._id] === 'Absent' ? 'active' : ''}`}
                                onClick={() => handleStatusChange(student._id, 'Absent')}
                            >
                                <X size={18} />
                                <span>Absent</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Attendance;

import React, { useState, useEffect } from 'react';
import './Attendance.css';
import { Check, X, Save } from 'lucide-react';
import { apiService } from '../api/service';

const Attendance = ({ students, attendanceData, setAttendanceData }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentAttendance, setCurrentAttendance] = useState({});
    const [currentReasons, setCurrentReasons] = useState({});
    const [selectedClass, setSelectedClass] = useState('');

    // Extract unique classes
    const uniqueClasses = Array.isArray(students) 
        ? [...new Set(students.map(s => s.className))].filter(Boolean)
        : [];

    // Set default selected class once students load
    useEffect(() => {
        if (!selectedClass && uniqueClasses.length > 0) {
            setSelectedClass(uniqueClasses[0]);
        }
    }, [uniqueClasses, selectedClass]);

    // Filter students by selected class
    const classStudents = Array.isArray(students) 
        ? students.filter(s => s.className === selectedClass)
        : [];

    // Load attendance data for selected date
    useEffect(() => {
        const fetchDateAttendance = async () => {
            try {
                const data = await apiService.getAttendance(selectedDate);
                if (data && data.records) {
                    const formattedRecords = {};
                    const formattedReasons = {};
                    
                    data.records.forEach(rec => {
                        const sid = rec.studentId._id || rec.studentId;
                        formattedRecords[sid] = rec.status;
                        formattedReasons[sid] = rec.reason || '';
                    });

                    setCurrentAttendance(formattedRecords);
                    setCurrentReasons(formattedReasons);
                } else {
                    setCurrentAttendance({});
                    setCurrentReasons({});
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
                setCurrentAttendance({});
                setCurrentReasons({});
            }
        };

        fetchDateAttendance();
    }, [selectedDate]);

    const handleStatusChange = (studentId, status) => {
        setCurrentAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
        
        // Clear reason if student is marked present
        if (status === 'Present') {
            setCurrentReasons(prev => ({
                ...prev,
                [studentId]: ''
            }));
        }
    };

    const handleReasonChange = (studentId, reason) => {
        setCurrentReasons(prev => ({
            ...prev,
            [studentId]: reason
        }));
    };

    const handleSave = async () => {
        if (!selectedClass) {
            alert('Please select a class first.');
            return;
        }

        try {
            // Fetch latest DB records for today to avoid overwriting other classes
            let existingRecords = [];
            try {
                const dbData = await apiService.getAttendance(selectedDate);
                if (dbData && dbData.records) existingRecords = dbData.records;
            } catch (e) {}

            const existingMap = existingRecords.reduce((acc, rec) => ({
                ...acc, [rec.studentId._id || rec.studentId]: { status: rec.status, reason: rec.reason || '' }
            }), {});

            // Merge current class updates into existing map
            classStudents.forEach(student => {
                if (currentAttendance[student._id]) {
                    existingMap[student._id] = {
                        status: currentAttendance[student._id],
                        reason: currentReasons[student._id] || ''
                    };
                }
            });

            const formattedRecords = Object.entries(existingMap).map(([studentId, data]) => ({
                studentId,
                status: data.status,
                reason: data.reason
            }));
            
            await apiService.saveAttendance(selectedDate, formattedRecords);

            alert(`Attendance saved successfully for ${selectedClass}!`);
        } catch (error) {
            alert('Error saving attendance: ' + error.message);
        }
    };

    // Calculate stats for the header based ONLY on the currently selected class
    const presentCount = classStudents.filter(s => currentAttendance[s._id] === 'Present').length;
    const absentCount = classStudents.filter(s => currentAttendance[s._id] === 'Absent').length;

    return (
        <div className="attendance-container">
            {/* Header Card: Date, Class, Stats, Save */}
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
                    <div className="class-input-wrapper">
                         <select
                            className="header-class-select"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', marginLeft: '10px' }}
                        >
                            <option value="" disabled>Select Class</option>
                            {uniqueClasses.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
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
                <button className="btn-save" onClick={handleSave} disabled={!selectedClass}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    Save Attendance
                </button>
            </div>

            {/* Student List - Cards */}
            <div className="student-list">
                {classStudents.length === 0 ? (
                    <div className="no-students-message" style={{ padding: '40px', textAlign: 'center', color: '#6b7280', width: '100%' }}>
                        Please select a class to mark attendance.
                    </div>
                ) : (
                    classStudents.map((student) => (
                        <div className={`student-card ${currentAttendance[student._id] === 'Absent' ? 'absent-mode' : ''}`} key={student._id}>
                            <div className="student-main-row">
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
                            
                            {currentAttendance[student._id] === 'Absent' && (
                                <div className="reason-input-section animate-slide-down">
                                    <input 
                                        type="text" 
                                        placeholder="Reason for absence (e.g. Sick, Family event)..." 
                                        value={currentReasons[student._id] || ''}
                                        onChange={(e) => handleReasonChange(student._id, e.target.value)}
                                        className="reason-box"
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Attendance;

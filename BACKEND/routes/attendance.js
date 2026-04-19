import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import DailyStats from '../models/DailyStats.js';
import StudentSummary from '../models/StudentSummary.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/attendance/:date
// @desc    Get attendance for a specific date
router.get('/:date', auth, async (req, res) => {
    try {
        const attendance = await Attendance.findOne({ date: req.params.date }).populate('records.studentId');
        if (!attendance) return res.status(404).json({ message: 'No attendance records found for this date' });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/attendance
// @desc    Mark or update attendance for a date
router.post('/', auth, async (req, res) => {
    try {
        const { date, records } = req.body;
        let attendance = await Attendance.findOne({ date });

        if (attendance) {
            attendance.records = records;
            await attendance.save();
        } else {
            attendance = new Attendance({ date, records });
            await attendance.save();
        }
        res.json(attendance);

        // Update Stats in background
        updateStoredStats(date);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Helper function to update stored statistics
async function updateStoredStats(date) {
    try {
        const students = await Student.find();
        const attendance = await Attendance.findOne({ date });

        if (!attendance) return;

        let presentCount = 0;
        let absentCount = 0;

        attendance.records.forEach(record => {
            if (record.status === 'Present') presentCount++;
            else if (record.status === 'Absent') absentCount++;
        });

        const totalStudents = students.length;
        const attendancePercentage = totalStudents > 0
            ? ((presentCount / totalStudents) * 100)
            : 0;

        // Update DailyStats
        await DailyStats.findOneAndUpdate(
            { date },
            {
                totalStudents,
                presentCount,
                absentCount,
                attendancePercentage
            },
            { upsert: true, new: true }
        );

        // Update StudentSummary for each student in this record
        for (const record of attendance.records) {
            const studentId = record.studentId;

            // Get all attendance records for this student
            const allAttendance = await Attendance.find({ "records.studentId": studentId });

            let totalPresent = 0;
            let totalAbsent = 0;
            let totalDays = 0;

            allAttendance.forEach(att => {
                const rec = att.records.find(r => r.studentId.toString() === studentId.toString());
                if (rec) {
                    if (rec.status === 'Present') {
                        totalPresent++;
                        totalDays++;
                    } else if (rec.status === 'Absent') {
                        totalAbsent++;
                        totalDays++;
                    }
                }
            });

            await StudentSummary.findOneAndUpdate(
                { studentId },
                {
                    totalPresent,
                    totalAbsent,
                    totalDays,
                    overallPercentage: totalDays > 0 ? (totalPresent / totalDays) * 100 : 0
                },
                { upsert: true }
            );
        }
    } catch (err) {
        console.error('Error updating stored stats:', err);
    }
}

// @route   GET api/attendance/my-status/:date
// @desc    Get attendance status for the logged-in student for a specific date
router.get('/my-status/:date', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student' && req.user.role !== 'parent') {
            return res.status(403).json({ message: 'Access denied. Only students and parents can access this endpoint.' });
        }

        // The token contains req.user.id which is the User's _id
        const user = await (await import('../models/User.js')).default.findById(req.user.id);
        
        if (!user || !user.studentId) {
             return res.status(404).json({ message: 'Student profile not linked to this account.' });
        }

        const attendance = await Attendance.findOne({ 
            date: req.params.date,
            "records.studentId": user.studentId 
        });

        if (!attendance) {
            return res.json({ status: 'No Record' });
        }

        const record = attendance.records.find(r => r.studentId.toString() === user.studentId.toString());
        res.json({ status: record ? record.status : 'No Record' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

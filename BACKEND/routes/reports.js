import express from 'express';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import StudentSummary from '../models/StudentSummary.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/reports/attendance-summary
// @desc    Get attendance summary (from stored data)
router.get('/attendance-summary', auth, async (req, res) => {
    try {
        const summaries = await StudentSummary.find().populate('studentId');

        const reportData = summaries
            .filter(summary => summary.studentId != null) // Avoid crashes if a student was deleted
            .map(summary => ({
                _id: summary.studentId._id,
                rollNo: summary.studentId.rollNo,
                name: summary.studentId.name,
                className: summary.studentId.className,
                presentDays: summary.totalPresent,
                absentDays: summary.totalAbsent,
                totalDays: summary.totalDays,
                percentage: summary.overallPercentage.toFixed(1)
            }));

        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET api/reports/my-stats
// @desc    Get attendance summary for logged-in student
router.get('/my-stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can view this.' });
        }

        // We stored the generic user _id in token, but we need the studentId. 
        // Let's look up the user first to get the studentId.
        const user = await User.findById(req.user.id);
        
        if (!user || !user.studentId) {
             return res.status(404).json({ message: 'Student profile not linked to this account.' });
        }

        const summary = await StudentSummary.findOne({ studentId: user.studentId }).populate('studentId');

        if (!summary) {
            return res.json({ message: 'No attendance data found yet.' });
        }

        const reportData = {
            _id: summary.studentId._id,
            rollNo: summary.studentId.rollNo,
            name: summary.studentId.name,
            className: summary.studentId.className,
            presentDays: summary.totalPresent,
            absentDays: summary.totalAbsent,
            totalDays: summary.totalDays,
            percentage: summary.overallPercentage.toFixed(1)
        };

        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET api/reports/parent/my-child
// @desc    Get attendance history with reasons for the parent's linked student
router.get('/parent/my-child', auth, async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ message: 'Access denied. Only parents can access this report.' });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.studentId) {
            return res.status(404).json({ message: 'Child profile not linked to this account.' });
        }

        const student = await Student.findById(user.studentId);
        const summary = await StudentSummary.findOne({ studentId: user.studentId });
        
        // Fetch last 100 attendance records to keep the dashboard responsive
        const attendanceRecords = await Attendance.find({ "records.studentId": user.studentId })
            .sort({ date: -1 })
            .limit(100);

        const history = attendanceRecords.map(att => {
            const rec = att.records.find(r => r.studentId.toString() === user.studentId.toString());
            return {
                date: att.date,
                status: rec.status,
                reason: rec.reason || ''
            };
        });

        res.json({
            student: {
                name: student.name,
                rollNo: student.rollNo,
                className: student.className
            },
            summary: summary ? {
                totalDays: summary.totalDays,
                presentDays: summary.totalPresent,
                absentDays: summary.totalAbsent,
                percentage: summary.overallPercentage.toFixed(1)
            } : {
                totalDays: 0,
                presentDays: 0,
                absentDays: 0,
                percentage: 0
            },
            history
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

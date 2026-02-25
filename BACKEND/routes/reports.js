import express from 'express';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import StudentSummary from '../models/StudentSummary.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/reports/attendance-summary
// @desc    Get attendance summary (from stored data)
router.get('/attendance-summary', auth, async (req, res) => {
    try {
        const summaries = await StudentSummary.find().populate('studentId');

        const reportData = summaries.map(summary => ({
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

export default router;

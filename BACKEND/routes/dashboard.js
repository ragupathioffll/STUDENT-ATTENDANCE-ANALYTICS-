import express from 'express';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import DailyStats from '../models/DailyStats.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        let stats = await DailyStats.findOne({ date: targetDate });

        if (!stats) {
            // Fallback to calculation if not found
            const totalStudents = await Student.countDocuments();
            const targetAttendance = await Attendance.findOne({ date: targetDate });

            let presentCount = 0;
            let absentCount = 0;

            if (targetAttendance) {
                targetAttendance.records.forEach(record => {
                    if (record.status === 'Present') presentCount++;
                    else if (record.status === 'Absent') absentCount++;
                });
            }

            const allAttendance = await Attendance.find();
            let totalPresent = 0;
            let totalRecords = 0;

            allAttendance.forEach(day => {
                day.records.forEach(record => {
                    if (record.status === 'Present' || record.status === 'Absent') {
                        totalRecords++;
                        if (record.status === 'Present') totalPresent++;
                    }
                });
            });

            stats = {
                totalStudents,
                presentCount,
                absentCount,
                attendancePercentage: totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0
            };
        }

        res.json({
            totalStudents: stats.totalStudents,
            presentToday: stats.presentCount,
            absentToday: stats.absentCount,
            averageAttendance: parseInt(stats.attendancePercentage || 0),
            today: targetDate
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

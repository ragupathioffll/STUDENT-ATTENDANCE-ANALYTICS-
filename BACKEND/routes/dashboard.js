import express from 'express';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const { date, className } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        let totalStudents = 0, presentCount = 0, absentCount = 0, averageAttendance = 0;
        let chartData = []; // To hold last 7 days of data

        // 1. Get filtered students
        let studentQuery = {};
        if (className && className !== 'All') {
            studentQuery = { className };
        }
        const filteredStudents = await Student.find(studentQuery).select('_id');
        const studentIds = filteredStudents.map(s => s._id.toString());
        totalStudents = studentIds.length;

        // 2. Get past 7 dates including targetDate
        const dates = [];
        const targetDateObj = new Date(targetDate);
        for (let i = 6; i >= 0; i--) {
            const d = new Date(targetDateObj);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        // 3. Fetch attendance for these 7 days
        const attendances = await Attendance.find({ date: { $in: dates } });

        // Calculate chart data and today's stats
        dates.forEach(d => {
            const dayAttendance = attendances.find(a => a.date === d);
            let dayTotal = 0;
            let dayPresent = 0;

            if (dayAttendance) {
                dayAttendance.records.forEach(rec => {
                    if (studentIds.includes(rec.studentId.toString())) {
                        if (rec.status === 'Present' || rec.status === 'Absent') {
                            dayTotal++;
                            if (rec.status === 'Present') dayPresent++;
                        }
                        
                        // If this is the target date, update today's counters
                        if (d === targetDate) {
                            if (rec.status === 'Present') presentCount++;
                            if (rec.status === 'Absent') absentCount++;
                        }
                    }
                });
            }

            const dayPercentage = dayTotal > 0 ? Math.round((dayPresent / dayTotal) * 100) : 0;
            
            // Format date string for chart (e.g. "Apr 15")
            const dateObj = new Date(d);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            chartData.push({
                date: d,
                percentage: dayPercentage
            });
        });

        // 4. Calculate average attendance for targetDate
        averageAttendance = (presentCount + absentCount) > 0 
            ? Math.round((presentCount / (presentCount + absentCount)) * 100) 
            : 0;

        res.json({
            totalStudents,
            presentToday: presentCount,
            absentToday: absentCount,
            averageAttendance,
            today: targetDate,
            chartData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

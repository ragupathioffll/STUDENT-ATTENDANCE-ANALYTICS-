import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Attendance from './models/Attendance.js';
import DailyStats from './models/DailyStats.js';
import StudentSummary from './models/StudentSummary.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const students = await Student.find();
        const attendanceRecords = await Attendance.find();

        console.log(`Processing ${attendanceRecords.length} attendance days...`);

        // 1. Process DailyStats
        for (const day of attendanceRecords) {
            let presentCount = 0;
            let absentCount = 0;

            day.records.forEach(record => {
                if (record.status === 'Present') presentCount++;
                else if (record.status === 'Absent') absentCount++;
            });

            const totalStudents = students.length;
            const attendancePercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

            await DailyStats.findOneAndUpdate(
                { date: day.date },
                {
                    totalStudents,
                    presentCount,
                    absentCount,
                    attendancePercentage
                },
                { upsert: true }
            );
        }
        console.log('DailyStats migrated.');

        // 2. Process StudentSummary
        console.log(`Processing ${students.length} students...`);
        for (const student of students) {
            let totalPresent = 0;
            let totalAbsent = 0;
            let totalDays = 0;

            attendanceRecords.forEach(day => {
                const record = day.records.find(r => r.studentId.toString() === student._id.toString());
                if (record) {
                    if (record.status === 'Present') {
                        totalPresent++;
                        totalDays++;
                    } else if (record.status === 'Absent') {
                        totalAbsent++;
                        totalDays++;
                    }
                }
            });

            await StudentSummary.findOneAndUpdate(
                { studentId: student._id },
                {
                    totalPresent,
                    totalAbsent,
                    totalDays,
                    overallPercentage: totalDays > 0 ? (totalPresent / totalDays) * 100 : 0
                },
                { upsert: true }
            );
        }
        console.log('StudentSummary migrated.');

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

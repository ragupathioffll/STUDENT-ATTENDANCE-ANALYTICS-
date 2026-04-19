import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Student from './models/Student.js';
import Attendance from './models/Attendance.js';
import LeaveRequest from './models/LeaveRequest.js';
import Announcement from './models/Announcement.js';
import StudentSummary from './models/StudentSummary.js';
import DailyStats from './models/DailyStats.js';

dotenv.config();

const seedData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Error: MONGODB_URI is not defined in .env file');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas...');

        // 1. Clear ALL existing data for a fresh start
        await User.deleteMany({});
        await Student.deleteMany({});
        await Attendance.deleteMany({});
        await LeaveRequest.deleteMany({});
        await Announcement.deleteMany({});
        await StudentSummary.deleteMany({});
        await DailyStats.deleteMany({});
        console.log('Cleared existing data...');

        // 2. Create Sample Admin User
        const adminUser = new User({
            name: 'Admin Teacher',
            email: 'admin@school.com',
            password: 'admin123',
            role: 'teacher'
        });
        await adminUser.save();
        console.log('Admin user created successfully!');

        // 3. Create 5 Sample Students
        const sampleStudents = [
            { name: 'John Doe', rollNo: '101', className: '10th Grade' },
            { name: 'Jane Smith', rollNo: '102', className: '10th Grade' },
            { name: 'Alex Johnson', rollNo: '103', className: '10th Grade' },
            { name: 'Emma Wilson', rollNo: '104', className: '10th Grade' },
            { name: 'David Brown', rollNo: '105', className: '10th Grade' }
        ];
        const insertedStudents = await Student.insertMany(sampleStudents);
        console.log(`${insertedStudents.length} sample students added!`);

        // 4. Create Sample Attendance for Today
        const today = new Date().toISOString().split('T')[0];
        const attendanceRecords = insertedStudents.map((student, index) => ({
            studentId: student._id,
            status: index % 3 === 0 ? 'Absent' : 'Present'
        }));

        const sampleAttendance = new Attendance({
            date: today,
            records: attendanceRecords
        });
        await sampleAttendance.save();
        console.log(`Sample attendance for ${today} added!`);

        // 5. Create users for ALL sample students using the automatic logic
        for (const student of insertedStudents) {
            const formattedName = student.name.replace(/\s+/g, '').toLowerCase();
            const studentUser = new User({
                name: student.name,
                email: `${formattedName}@gmail.com`,
                password: formattedName,
                role: 'student',
                studentId: student._id
            });
            await studentUser.save();
        }
        console.log('Sample student users created!');

        // 6. Recalculate Stats and Summaries (Migration Logic)
        console.log('Recalculating statistics...');
        const studentsList = await Student.find();
        const allAttendance = await Attendance.find();

        for (const day of allAttendance) {
            let pCount = 0;
            let aCount = 0;
            day.records.forEach(r => {
                if (r.status === 'Present') pCount++;
                else if (r.status === 'Absent') aCount++;
            });
            await DailyStats.findOneAndUpdate(
                { date: day.date },
                {
                    totalStudents: studentsList.length,
                    presentCount: pCount,
                    absentCount: aCount,
                    attendancePercentage: studentsList.length > 0 ? (pCount / studentsList.length) * 100 : 0
                },
                { upsert: true }
            );
        }

        for (const student of studentsList) {
            let totalPresent = 0;
            let totalAbsent = 0;
            let totalDays = 0;

            allAttendance.forEach(day => {
                const record = day.records.find(r => r.studentId.toString() === student._id.toString());
                if (record) {
                    if (record.status === 'Present') { totalPresent++; totalDays++; }
                    else if (record.status === 'Absent') { totalAbsent++; totalDays++; }
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
        console.log('Statistics and summaries updated!');

        console.log('--- SEEDING COMPLETE ---');
        console.log('Teacher Login -> Email: admin@school.com | Pass: admin123');
        console.log('Student Login Pattern -> Email: [name]@gmail.com | Pass: [name]');
        console.log('Example (John Doe) -> Email: johndoe@gmail.com | Pass: johndoe');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
};

seedData();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Attendance from './models/Attendance.js';
import Student from './models/Student.js';

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // 1. Find any student user
        const user = await User.findOne({ role: 'student' });
        if (!user) {
            console.error('No student user found. Please re-seed.');
            process.exit(1);
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log(`Verifying for Student: ${user.name}`);
        
        // 2. Test status for today (seeded date)
        const today = new Date().toISOString().split('T')[0];
        console.log(`\n--- CHECKING STATUS FOR: ${today} ---`);
        
        // Simulating the behavior of the route logic
        const attendance = await Attendance.findOne({ 
            date: today,
            "records.studentId": user.studentId 
        });

        if (!attendance) {
            console.log('Status: No Record');
        } else {
            const record = attendance.records.find(r => r.studentId.toString() === user.studentId.toString());
            console.log(`Status: ${record ? record.status : 'No Record'}`);
        }

        // 3. Test status for a future date
        const futureDate = '2099-01-01';
        console.log(`\n--- CHECKING STATUS FOR: ${futureDate} ---`);
        const attendanceFuture = await Attendance.findOne({ 
            date: futureDate,
            "records.studentId": user.studentId 
        });
        console.log(`Status: ${attendanceFuture ? 'Error (Found)' : 'No Record'}`);

        await mongoose.disconnect();
        console.log('\nVerification complete.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();

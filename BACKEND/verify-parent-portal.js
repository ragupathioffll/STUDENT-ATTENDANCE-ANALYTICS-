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

        // 1. Check if a parent user exists (e.g., for John Doe)
        const parent = await User.findOne({ email: 'johndoe@parents.com' });
        if (!parent) {
             // Try any parent
             const anyParent = await User.findOne({ role: 'parent' });
             if (!anyParent) {
                 console.error('No parent user found! Migration failed?');
                 process.exit(1);
             }
             console.log(`Found parent: ${anyParent.name} (${anyParent.email})`);
        } else {
             console.log(`Found John Doe parent: ${parent.name}`);
        }

        const testParent = parent || await User.findOne({ role: 'parent' });

        // 2. Simulate marking attendance with reason
        const today = new Date().toISOString().split('T')[0];
        const student = await Student.findById(testParent.studentId);
        
        console.log(`\n--- SIMULATING ABSENCE REASON FOR ${student.name} ---`);
        const records = [
            { studentId: student._id, status: 'Absent', reason: 'Fever and cold' }
        ];
        
        await Attendance.findOneAndUpdate(
            { date: today },
            { records },
            { upsert: true }
        );
        console.log('Saved attendance with reason.');

        // 3. Test the parent report logic
        const attendanceRecords = await Attendance.find({ "records.studentId": student._id }).sort({ date: -1 });
        const record = attendanceRecords[0].records.find(r => r.studentId.toString() === student._id.toString());
        
        console.log(`\n--- VERIFYING RETRIEVAL ---`);
        console.log(`Date: ${attendanceRecords[0].date}`);
        console.log(`Status: ${record.status}`);
        console.log(`Reason: ${record.reason}`);

        if (record.reason === 'Fever and cold') {
            console.log('\nSUCCESS: Reason correctly saved and retrieved!');
        } else {
            console.error('\nFAILURE: Reason mismatch.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();

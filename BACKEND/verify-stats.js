import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudentSummary from './models/StudentSummary.js';
import Student from './models/Student.js';

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const summaries = await StudentSummary.find().populate('studentId');
        console.log('--- STUDENT SUMMARIES ---');
        summaries.forEach(s => {
            if (s.studentId) {
                console.log(`Name: ${s.studentId.name} | Present: ${s.totalPresent} | Absent: ${s.totalAbsent} | %: ${s.overallPercentage.toFixed(1)}%`);
            }
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

verify();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import User from './models/User.js';

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // 1. Find a test student
        const student = await Student.findOne({ name: 'John Doe' });
        if (!student) {
            console.error('John Doe not found. Please re-seed.');
            process.exit(1);
        }

        console.log('--- BEFORE UPDATE ---');
        const userBefore = await User.findOne({ studentId: student._id });
        console.log(`Student Email: ${student.email}`);
        console.log(`User Email: ${userBefore?.email}`);

        // 2. Perform Update (Simulating the PUT request logic)
        console.log('\n--- SIMULATING UPDATE (John Doe -> Johnny Doe, new email) ---');
        const newName = 'Johnny Doe';
        const newEmail = 'johnny@gmail.com';
        
        // This is the logic I added to the route:
        const oldStudent = await Student.findById(student._id);
        const updatedStudent = await Student.findByIdAndUpdate(student._id, { name: newName, email: newEmail }, { new: true });
        
        const user = await User.findOne({ studentId: student._id });
        if (user) {
            if (newName !== oldStudent.name) {
                user.name = newName;
                user.password = newName.replace(/\s+/g, '').toLowerCase();
            }
            if (newEmail !== oldStudent.email) {
                user.email = newEmail;
            }
            await user.save();
        }

        console.log('--- AFTER UPDATE ---');
        const userAfter = await User.findOne({ studentId: student._id });
        console.log(`Updated Student Name: ${updatedStudent.name} | Email: ${updatedStudent.email}`);
        console.log(`Updated User Name: ${userAfter?.name} | Email: ${userAfter?.email}`);
        
        // 3. Perform Delete (Simulating the DELETE request logic)
        console.log('\n--- SIMULATING DELETE ---');
        await Student.findByIdAndDelete(student._id);
        await User.findOneAndDelete({ studentId: student._id });
        
        const studentCheck = await Student.findById(student._id);
        const userCheck = await User.findOne({ studentId: student._id });
        
        console.log(`Student still exists?: ${!!studentCheck}`);
        console.log(`User still exists?: ${!!userCheck}`);

        await mongoose.disconnect();
        console.log('\nVerification complete. Please re-seed the DB after this test.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();

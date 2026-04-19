import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import User from './models/User.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const students = await Student.find();
        
        for (const student of students) {
            const formattedName = student.name.replace(/\s+/g, '').toLowerCase();
            const email = `${formattedName}@gmail.com`;
            
            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [
                    { studentId: student._id },
                    { email: email }
                ]
            });
            
            if (!existingUser) {
                const newUser = new User({
                    name: student.name,
                    email: email,
                    password: formattedName,
                    role: 'student',
                    studentId: student._id
                });
                await newUser.save();
                console.log(`Created account for ${student.name}: ${email}`);
            } else {
                console.log(`Account already exists for ${student.name}`);
            }
        }
        
        await mongoose.disconnect();
        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();

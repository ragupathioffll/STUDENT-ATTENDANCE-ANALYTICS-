import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Student from './models/Student.js';

dotenv.config();

const migrateParents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for parent account migration...');

        const students = await Student.find();
        console.log(`Found ${students.length} students. Checking for parent accounts...`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const student of students) {
            const formattedName = student.name.replace(/\s+/g, '').toLowerCase();
            const parentEmail = `${formattedName}@parents.com`;
            
            const existingParent = await User.findOne({ email: parentEmail });
            
            if (!existingParent) {
                const parentUser = new User({
                    name: `${student.name} (Parent)`,
                    email: parentEmail,
                    password: formattedName, // Default to student's name
                    role: 'parent',
                    studentId: student._id
                });
                await parentUser.save();
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`Migration complete! Created: ${createdCount}, Skipped: ${skippedCount}`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateParents();

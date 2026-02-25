import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Error: MONGODB_URI is not defined in .env file');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const existingUser = await User.findOne({ email: 'admin@school.com' });
        if (existingUser) {
            console.log('Admin user already exists. No action taken.');
            await mongoose.disconnect();
            process.exit(0);
        }

        const adminUser = new User({
            name: 'Admin Teacher',
            email: 'admin@school.com',
            password: 'admin123',
            role: 'teacher'
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@school.com');
        console.log('Password: admin123');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
};

seedAdmin();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();

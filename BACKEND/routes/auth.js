import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user (with student whitelist check)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, rollNo } = req.body;
        
        // 1. Check if user already exists
        let userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        let studentId = null;

        // 2. If student, verify they are in the whitelist
        if (role === 'student') {
            const studentRecord = await Student.findOne({ 
                $or: [{ email: email }, { rollNo: rollNo }] 
            });

            if (!studentRecord) {
                return res.status(400).json({ 
                    message: 'Your details are not in the official student list. Please contact your teacher.' 
                });
            }
            
            // Check if this student record is already linked to another user
            const studentLinked = await User.findOne({ studentId: studentRecord._id });
            if (studentLinked) {
                return res.status(400).json({ message: 'This student record is already registered.' });
            }

            studentId = studentRecord._id;
            
            // Optionally update student email if it wasn't set
            if (!studentRecord.email) {
                studentRecord.email = email;
                await studentRecord.save();
            }
        }

        // 3. Create new user
        const newUser = new User({ 
            name, 
            email, 
            password, 
            role: role || 'teacher',
            studentId 
        });
        
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

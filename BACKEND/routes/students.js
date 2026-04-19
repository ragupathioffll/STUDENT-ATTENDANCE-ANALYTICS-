import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/students
// @desc    Get all students with attendance stats
router.get('/', auth, async (req, res) => {
    try {
        const students = await Student.aggregate([
            {
                $lookup: {
                    from: 'studentsummaries',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'stats'
                }
            },
            {
                $unwind: {
                    path: '$stats',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    name: 1,
                    rollNo: 1,
                    className: 1,
                    email: 1,
                    attendancePercentage: { $ifNull: ['$stats.overallPercentage', 0] },
                    totalDays: { $ifNull: ['$stats.totalDays', 0] },
                    presentDays: { $ifNull: ['$stats.totalPresent', 0] }
                }
            }
        ]);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST api/students
// @desc    Add a new student and auto-create user account
router.post('/', auth, async (req, res) => {
    try {
        const { name, rollNo, className, email } = req.body;
        
        // Password is the name (sanitized: lowercase, no spaces)
        const formattedName = name.replace(/\s+/g, '').toLowerCase();
        const password = formattedName;

        // Use the email provided by the teacher
        const finalEmail = email || `${formattedName}@gmail.com`;

        // Check if email already exists to prevent duplicate key errors
        const existingUser = await User.findOne({ email: finalEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const newStudent = new Student({ name, rollNo, className, email: finalEmail });
        await newStudent.save();

        // 1. Generate Student User Account
        const studentUser = new User({
            name: name,
            email: finalEmail,
            password: password,
            role: 'student',
            studentId: newStudent._id
        });
        await studentUser.save();

        // 2. Generate Parent User Account
        const parentEmail = `${formattedName}@parents.com`;
        const parentUser = new User({
            name: `${name} (Parent)`,
            email: parentEmail,
            password: password, // Same as student by default
            role: 'parent',
            studentId: newStudent._id
        });
        await parentUser.save();

        // Send back generated credentials wrapped in the student object
        res.json({
            ...newStudent.toObject(),
            generatedEmail: finalEmail,
            generatedPassword: password,
            parentEmail: parentEmail
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT api/students/:id
// @desc    Update a student and sync with user account
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const oldStudent = await Student.findById(req.params.id);
        if (!oldStudent) return res.status(404).json({ message: 'Student not found' });

        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Synchronize changes with both Student and Parent accounts
        const users = await User.find({ studentId: req.params.id });
        for (const user of users) {
            let userModified = false;

            if (name && name !== oldStudent.name) {
                user.name = user.role === 'parent' ? `${name} (Parent)` : name;
                // Automatically update password to match new name (lowercase, no spaces)
                user.password = name.replace(/\s+/g, '').toLowerCase();
                
                // If it's a parent, also update the email based on the new name
                if (user.role === 'parent') {
                    user.email = `${name.replace(/\s+/g, '').toLowerCase()}@parents.com`;
                }
                userModified = true;
            }

            // Student-specific email update (if provided)
            if (user.role === 'student' && email && email !== oldStudent.email) {
                user.email = email;
                userModified = true;
            }

            if (userModified) {
                await user.save(); // Triggers bcrypt hashing via pre-save hook
            }
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE api/students/:id
// @desc    Delete a student and their user account
router.delete('/:id', auth, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        // Remove associated student AND parent accounts to prevent orphaned logins
        await User.deleteMany({ studentId: req.params.id });
        res.json({ message: 'Student and associated accounts deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

import express from 'express';
import Student from '../models/Student.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/students
// @desc    Get all students
router.get('/', auth, async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/students
// @desc    Add a new student
router.post('/', auth, async (req, res) => {
    try {
        const { name, rollNo, className } = req.body;
        const newStudent = new Student({ name, rollNo, className });
        await newStudent.save();
        res.json(newStudent);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT api/students/:id
// @desc    Update a student
router.put('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE api/students/:id
// @desc    Delete a student
router.delete('/:id', auth, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

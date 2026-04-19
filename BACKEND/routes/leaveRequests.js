import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/leave-requests
// @desc    Get leave requests (Teacher gets all, Student gets only theirs)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'student') {
            const user = await User.findById(req.user.id);
            if (!user.studentId) return res.status(400).json({ message: 'No student profile linked' });
            
            const requests = await LeaveRequest.find({ studentId: user.studentId }).sort({ createdAt: -1 });
            return res.json(requests);
        } else {
            // Teachers/Admins see all pending and recent requests
            const requests = await LeaveRequest.find().populate('studentId', 'name rollNo className').sort({ createdAt: -1 });
            return res.json(requests);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST api/leave-requests
// @desc    Apply for leave (Student only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can apply for leave' });
        }

        const user = await User.findById(req.user.id);
        if (!user.studentId) return res.status(400).json({ message: 'No student profile linked' });

        const { reason, startDate, endDate, type } = req.body;

        const leaveRequest = new LeaveRequest({
            studentId: user.studentId,
            reason,
            startDate,
            endDate,
            type
        });

        await leaveRequest.save();
        res.status(201).json(leaveRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT api/leave-requests/:id/status
// @desc    Approve/Reject leave request (Teacher only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status, comments } = req.body;
        
        const request = await LeaveRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Leave request not found' });

        request.status = status;
        if (comments) request.comments = comments;

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

import express from 'express';
import Announcement from '../models/Announcement.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/announcements
// @desc    Get all announcements
router.get('/', auth, async (req, res) => {
    try {
        // Both teachers and students can view announcements
        const announcements = await Announcement.find()
            .populate('author', 'name role')
            .sort({ postedOn: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST api/announcements
// @desc    Create an announcement (Teacher only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Only teachers can post announcements' });
        }

        const { title, content, targetClass } = req.body;

        const announcement = new Announcement({
            title,
            content,
            targetClass,
            author: req.user.id
        });

        await announcement.save();
        
        const populatedAnnouncement = await Announcement.findById(announcement._id).populate('author', 'name role');
        res.status(201).json(populatedAnnouncement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE api/announcements/:id
// @desc    Delete an announcement (Teacher only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

        // Optionally check if the teacher deleting is the one who posted it
        // if (announcement.author.toString() !== req.user.id) { ... }

        await announcement.deleteOne();
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

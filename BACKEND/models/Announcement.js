import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Teacher/Admin
    targetClass: { type: String, default: 'All' }, // Optionally target specific class
    postedOn: { type: Date, default: Date.now }
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;

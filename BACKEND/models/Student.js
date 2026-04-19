import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    email: { type: String, required: false }, // Added for optional linking/whitelist
    className: { type: String, required: true }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;

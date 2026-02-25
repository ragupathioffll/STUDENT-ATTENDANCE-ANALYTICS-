import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    records: [
        {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
            status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
        }
    ]
}, { timestamps: true });

// Ensure unique attendance entry per date
attendanceSchema.index({ date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

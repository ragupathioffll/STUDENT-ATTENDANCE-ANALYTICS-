import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['Sick', 'Casual', 'Personal', 'Others'], default: 'Casual' },
    reason: { type: String, required: true },
    startDate: { type: String, required: true }, // Format: YYYY-MM-DD
    endDate: { type: String, required: true },   // Format: YYYY-MM-DD
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    comments: { type: String }, // Teacher's feedback
    appliedOn: { type: Date, default: Date.now }
}, { timestamps: true });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;

import mongoose from 'mongoose';

const studentSummarySchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    totalPresent: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
    overallPercentage: { type: Number, default: 0 }
}, { timestamps: true });

const StudentSummary = mongoose.model('StudentSummary', studentSummarySchema);
export default StudentSummary;

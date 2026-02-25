import mongoose from 'mongoose';

const dailyStatsSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
    totalStudents: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 }
}, { timestamps: true });

const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);
export default DailyStats;

import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  score: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Grade', gradeSchema);

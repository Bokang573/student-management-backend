import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Student', studentSchema);

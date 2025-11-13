import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Student from './models/Student.js';
import Course from './models/Course.js';
import Grade from './models/Grade.js';

dotenv.config();

const app = express();
const frontend_url = process.env.FRONTEND_URL || 'https://chimerical-pothos-5de83a.netlify.app';

app.use(cors({ origin: frontend_url }));
app.use(express.json());

// ---------------- MongoDB Connection ----------------
const uri = process.env.MONGO_URI; // full Atlas URI in .env

mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB connection established successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ---------------- Health ----------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 });
});

// ---------------- Root ----------------
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    usingDb: mongoose.connection.readyState === 1,
    frontend: frontend_url,
    endpoints: {
      students: '/students',
      courses: '/courses',
      grades: '/grades',
      health: '/health'
    }
  });
});

// ---------------- Students ----------------
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find().populate('course_id', 'name');
    const formatted = students.map(s => ({
      id: s._id,
      name: s.name,
      email: s.email,
      course_id: s.course_id?._id || null,
      course_name: s.course_id?.name || null,
      created_at: s.created_at
    }));
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching students:", err.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/students', async (req, res) => {
  const { name, email, course_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const student = await Student.create({ name, email, course_id });
    const populated = await Student.findById(student._id).populate('course_id', 'name');
    res.status(201).json({
      id: populated._id,
      name: populated.name,
      email: populated.email,
      course_id: populated.course_id?._id || null,
      course_name: populated.course_id?.name || null,
      created_at: populated.created_at
    });
  } catch (err) {
    console.error("❌ Error creating student:", err.message);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// ---------------- Courses ----------------
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    const formatted = courses.map(c => ({
      id: c._id,
      name: c.name
    }));
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching courses:", err.message);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/courses', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const course = await Course.create({ name });
    res.status(201).json({ id: course._id, name: course.name });
  } catch (err) {
    console.error("❌ Error creating course:", err.message);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// ---------------- Grades ----------------
app.get('/grades', async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate('student_id', 'name')
      .populate('course_id', 'name');

    const formatted = grades.map(g => ({
      id: g._id,
      student_id: g.student_id?._id || null,
      student_name: g.student_id?.name || null,
      course_id: g.course_id?._id || null,
      course_name: g.course_id?.name || null,
      score: g.score,
      created_at: g.created_at
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching grades:", err.message);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

app.post('/grades', async (req, res) => {
  const { student_id, course_id, score } = req.body;
  if (!student_id || !course_id || score == null) {
    return res.status(400).json({ error: 'student_id, course_id, and score are required' });
  }

  try {
    const grade = await Grade.create({ student_id, course_id, score });
    const populated = await Grade.findById(grade._id)
      .populate('student_id', 'name')
      .populate('course_id', 'name');

    res.status(201).json({
      id: populated._id,
      student_id: populated.student_id?._id || null,
      student_name: populated.student_id?.name || null,
      course_id: populated.course_id?._id || null,
      course_name: populated.course_id?.name || null,
      score: populated.score,
      created_at: populated.created_at
    });
  } catch (err) {
    console.error("❌ Error creating grade:", err.message);
    res.status(500).json({ error: 'Failed to create grade' });
  }
});

// ---------------- 404 ----------------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------------- Server ----------------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

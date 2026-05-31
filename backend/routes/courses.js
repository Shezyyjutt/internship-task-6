const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Lesson = require('../models/lesson');
const auth = require('../middleware/auth_middleware');
const role = require('../middleware/roll_middleware');
const multer = require('multer');
const path = require('path');


// simple disk storage for uploaded videos (demo only)
const storage = multer.diskStorage({
destination: function (req, file, cb) { cb(null, 'uploads/'); },
filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });


// add course (instructor)
router.post('/', auth, role('instructor'), async (req,res)=>{
const { title, description, category } = req.body;
try{
if(!title || !description || !category) return res.status(400).json({msg:'Title, description, and category are required'});
const course = await Course.create({ title, description, category, instructor: req.user._id });
await course.populate('instructor','name email');
res.status(201).json(course);
}catch(err){res.status(500).json({msg:err.message})}
});


// upload lesson video
router.post('/:id/lessons', auth, role('instructor'), upload.single('video'), async (req,res)=>{
const { title, duration } = req.body;
const courseId = req.params.id;
try{
if(!req.file) return res.status(400).json({msg:'Video file is required'});
const lesson = await Lesson.create({ course: courseId, title, videoUrl: `/uploads/${req.file.filename}`, duration });
res.json(lesson);
}catch(err){res.status(500).json({msg:err.message})}
});


// list courses
router.get('/', async (req,res)=>{
const courses = await Course.find().populate('instructor','name email');
res.json(courses);
});


// instructor's own courses
router.get('/mine', auth, role('instructor'), async (req,res)=>{
const courses = await Course.find({ instructor: req.user._id }).populate('instructor','name email');
res.json(courses);
});


// single course with lessons
router.get('/:id', async (req,res)=>{
const course = await Course.findById(req.params.id).populate('instructor','name');
const lessons = await Lesson.find({ course: req.params.id });
res.json({ course, lessons });
});


// edit/delete (instructor owns)
router.put('/:id', auth, role('instructor'), async (req,res)=>{
const course = await Course.findById(req.params.id);
if(!course) return res.status(404).json({msg:'Not found'});
if(!course.instructor.equals(req.user._id)) return res.status(403).json({msg:'Not owner'});
Object.assign(course, req.body);
await course.save();
res.json(course);
});


router.delete('/:id', auth, role('instructor'), async (req,res)=>{
const course = await Course.findById(req.params.id);
if(!course) return res.status(404).json({msg:'Not found'});
if(!course.instructor.equals(req.user._id)) return res.status(403).json({msg:'Not owner'});
await Course.deleteOne({ _id: req.params.id });
res.json({ msg: 'Deleted' });
});


module.exports = router;

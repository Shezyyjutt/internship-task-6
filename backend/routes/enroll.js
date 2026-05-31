const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth_middleware');
const role = require('../middleware/roll_middleware');


router.post('/:id', auth, role('student'), async (req,res)=>{
const courseId = req.params.id;
try{
const exists = await Enrollment.findOne({ course: courseId, student: req.user._id });
if(exists) return res.status(400).json({ msg: 'Already enrolled' });
const enrollment = await Enrollment.create({ course: courseId, student: req.user._id });
res.json(enrollment);
}catch(err){res.status(500).json({msg:err.message})}
});


router.get('/my-courses', auth, role('student'), async (req,res)=>{
const list = await Enrollment.find({ student: req.user._id }).populate({ path: 'course', populate: { path: 'instructor', select: 'name' } });
res.json(list);
});


// update progress
router.patch('/:id/progress', auth, role('student'), async (req,res)=>{
const enrollment = await Enrollment.findOne({ course: req.params.id, student: req.user._id });
if(!enrollment) return res.status(404).json({ msg: 'Not enrolled' });
enrollment.progress = req.body.progress;
await enrollment.save();
res.json(enrollment);
});


module.exports = router;

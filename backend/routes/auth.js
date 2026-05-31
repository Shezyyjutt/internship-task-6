const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth_middleware');

const publicUser = (user) => ({
id: user._id,
name: user.name,
email: user.email,
role: user.role,
bio: user.bio || '',
skills: user.skills || [],
profileImage: user.profileImage || ''
});


// register
router.post('/register', async (req,res)=>{
const { name,email,password,role } = req.body;
try{
if(!name || !email || !password) return res.status(400).json({msg:'Name, email, and password are required'});
const cleanEmail = email.toLowerCase().trim();
const cleanRole = ['student', 'instructor'].includes(role) ? role : 'student';
if(await User.findOne({email: cleanEmail})) return res.status(400).json({msg:'Email exists'});
const hashed = await bcrypt.hash(password,10);
const user = await User.create({ name, email: cleanEmail, password: hashed, role: cleanRole });
res.status(201).json({ msg: 'Account created successfully. Please login.', user: publicUser(user) });
}catch(err){res.status(500).json({msg:err.message})}
});


// login
router.post('/login', async (req,res)=>{
const { email,password } = req.body;
try{
if(!email || !password) return res.status(400).json({ msg: 'Email and password are required' });
const user = await User.findOne({ email: email.toLowerCase().trim() });
if(!user) return res.status(400).json({ msg: 'Invalid creds' });
const match = await bcrypt.compare(password, user.password);
if(!match) return res.status(400).json({ msg: 'Invalid creds' });
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ token, user: publicUser(user) });
}catch(err){res.status(500).json({msg:err.message})}
});


router.get('/me', auth, async (req,res)=>{
res.json({ user: publicUser(req.user) });
});


router.put('/me', auth, async (req,res)=>{
const { name, email, role, bio, skills, profileImage } = req.body;
try{
if(!name || !email) return res.status(400).json({ msg: 'Name and email are required' });
const cleanEmail = email.toLowerCase().trim();
const existing = await User.findOne({ email: cleanEmail, _id: { $ne: req.user._id } });
if(existing) return res.status(400).json({ msg: 'Email already in use' });
const cleanRole = ['student', 'instructor'].includes(role) ? role : req.user.role;
const cleanSkills = Array.isArray(skills)
? skills.map((skill) => String(skill).trim()).filter(Boolean)
: String(skills || '').split(',').map((skill) => skill.trim()).filter(Boolean);

const user = await User.findByIdAndUpdate(
req.user._id,
{
name: name.trim(),
email: cleanEmail,
role: cleanRole,
bio: bio || '',
skills: cleanSkills,
profileImage: profileImage || ''
},
{ new: true, runValidators: true }
).select('-password');

res.json({ user: publicUser(user) });
}catch(err){res.status(500).json({msg:err.message})}
});


module.exports = router;

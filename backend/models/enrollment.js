const mongoose = require('mongoose');
const EnrollmentSchema = new mongoose.Schema({
course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
progress: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Enrollment', EnrollmentSchema);
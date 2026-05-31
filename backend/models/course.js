const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
title: String,
description: String,
category: String,
instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
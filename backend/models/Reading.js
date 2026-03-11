const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    glucoseLevel: {
        type: Number,
        required: true
    },
    measurementType: {
        type: String,
        enum: ['Fasting', 'Before Meal', 'After Meal', 'Bedtime', 'Random'],
        required: true
    },
    notes: {
        type: String
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Reading', ReadingSchema);

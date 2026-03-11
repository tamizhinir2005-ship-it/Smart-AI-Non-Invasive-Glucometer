const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    age: {
        type: Number,
        // Can be derived from DOB but storing for quick access/legacy request match
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    phone: {
        type: String
    },
    diabetesType: {
        type: String,
        enum: ['Type 1', 'Type 2', 'Gestational', 'Pre-diabetes'],
        required: true
    },
    // Additional configurable fields
    targetGlucoseRange: {
        min: { type: Number, default: 70 },
        max: { type: Number, default: 140 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);

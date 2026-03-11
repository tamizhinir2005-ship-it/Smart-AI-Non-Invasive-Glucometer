const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, dob, gender, age, bloodGroup, phone, diabetesType } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (name) profileFields.name = name;
    if (dob) profileFields.dob = dob; // Ensure frontend sends ISO string or YYYY-MM-DD
    if (gender) profileFields.gender = gender;
    if (age) profileFields.age = age;
    if (bloodGroup) profileFields.bloodGroup = bloodGroup;
    if (phone) profileFields.phone = phone;
    if (diabetesType) profileFields.diabetesType = diabetesType;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();

        // Update User to set isProfileComplete = true
        await User.findByIdAndUpdate(req.user.id, { isProfileComplete: true });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['email']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

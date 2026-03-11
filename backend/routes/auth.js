const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const nodemailer = require('nodemailer');

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    console.log('Register request received:', email);
    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists');
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password });
        await user.save();
        console.log('User saved');

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            console.log('Token generated');
            res.json({ token, isProfileComplete: user.isProfileComplete });
        });
    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Generate JWT
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) {
                    console.error('JWT Sign Error:', err.message);
                    return res.status(500).send('Server Error');
                }
                res.json({ token, isProfileComplete: user.isProfileComplete });

                // Send Login Success Email (Async, don't wait for it to respond to user)
                sendEmail({
                    email: user.email,
                    subject: 'Login Successful - GlucoTrack',
                    message: `Hello, you have successfully logged into your GlucoTrack account at ${new Date().toLocaleString()}.`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #0F8A7D;">Login Successful</h2>
                            <p>Hello,</p>
                            <p>You have successfully logged into your <strong>GlucoTrack</strong> account.</p>
                            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                            <p style="color: #666; font-size: 0.9em;">If this wasn't you, please reset your password immediately.</p>
                        </div>
                    `
                }).catch(err => console.error('Silent Login Email Error:', err.message));
            }
        );
    } catch (err) {
        console.error('Login Route Error:', err.message);
        res.status(500).send('Server error');
    }
});


// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate Reset Token
        const resetToken = Math.random().toString(36).substring(2, 15);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `http://127.0.0.1:5173/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html: `<p>You requested a password reset</p><a href="${resetUrl}">${resetUrl}</a>`
            });
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error('Forgot Password Email Error:', err.message);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ msg: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Reset Password
router.put('/reset-password/:resettoken', async (req, res) => {
    const resetToken = req.params.resettoken;
    try {
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, data: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

const auth = require('../middleware/auth');

// Get User
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Fallback: Check if there's data in the separate Profile collection
        const Profile = require('../models/Profile');
        const profile = await Profile.findOne({ user: req.user.id }).lean();

        // Data from User collection (primary) or Profile collection (backup/sync)
        const combinedData = {
            ...user,
            fullName: user.fullName || (profile ? profile.name : '') || '',
            dob: user.dob || (profile ? profile.dob : '') || '',
            gender: user.gender || (profile ? profile.gender : '') || '',
            age: user.age || (profile ? profile.age : '') || '',
            bloodGroup: user.bloodGroup || (profile ? profile.bloodGroup : '') || '',
            phone: user.phone || (profile ? profile.phone : '') || '',
            diabeticType: user.diabeticType || (profile ? profile.diabetesType : 'Type 2')
        };

        // Ensure consistency for frontend keys if needed
        combinedData.name = combinedData.fullName;
        combinedData.diabetesType = combinedData.diabeticType;

        res.json(combinedData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    const { fullName, name, dob, age, gender, phone, bloodGroup, diabeticType, diabetesType } = req.body;

    // Build profile object
    const profileFields = {};

    // Support both fullName (schema) and name (frontend legacy/alternative)
    const finalFullName = fullName || name;
    if (finalFullName) profileFields.fullName = finalFullName;

    if (dob) profileFields.dob = dob;
    if (age) profileFields.age = age;
    if (gender) profileFields.gender = gender;
    if (phone) profileFields.phone = phone;
    if (bloodGroup) profileFields.bloodGroup = bloodGroup;

    // Support both diabeticType (schema) and diabetesType (frontend legacy/alternative)
    const finalDiabeticType = diabeticType || diabetesType;
    if (finalDiabeticType) profileFields.diabeticType = finalDiabeticType;

    // Check if profile is complete
    if (finalFullName && dob && age && gender && phone && bloodGroup && finalDiabeticType) {
        profileFields.isProfileComplete = true;
    }

    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update User collection
        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        // Update/Create in separate Profile collection
        const Profile = require('../models/Profile');
        await Profile.findOneAndUpdate(
            { user: req.user.id },
            {
                $set: {
                    name: finalFullName,
                    dob: dob,
                    gender: gender,
                    age: age,
                    bloodGroup: bloodGroup,
                    phone: phone,
                    diabetesType: finalDiabeticType
                }
            },
            { upsert: true, new: true }
        );

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

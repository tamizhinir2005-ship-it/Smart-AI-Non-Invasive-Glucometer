const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reading = require('../models/Reading');
const { spawn } = require('child_process');
const path = require('path');

// @route   POST api/readings
// @desc    Add a glucose reading
// @access  Private
router.post('/', auth, async (req, res) => {
    const { glucoseLevel, measurementType, notes, recordedAt } = req.body;

    try {
        const newReading = new Reading({
            user: req.user.id,
            glucoseLevel,
            measurementType,
            notes,
            recordedAt: recordedAt || Date.now()
        });

        const reading = await newReading.save();

        // Trigger background incremental update
        const pythonScriptPath = path.join(__dirname, '..', 'ml', 'update_lstm.py');
        const pythonProcess = spawn('python', [pythonScriptPath, req.user.id]);

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Background LSTM update exited with code ${code}`);
            } else {
                console.log(`LSTM incrementally updated for user ${req.user.id}`);
            }
        });

        res.json(reading);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/readings
// @desc    Get all readings for user (sorted by date desc)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const readings = await Reading.find({ user: req.user.id }).sort({ recordedAt: -1 });
        res.json(readings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/readings/stats
// @desc    Get stats (avg, count, etc.)
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const readings = await Reading.find({ user: req.user.id });

        // Calculate Logic here or Aggregation pipeline
        // For simplicity:
        const count = readings.length;

        // Let's use aggregation for 7-day avg in memory (for small dataset)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentReadings = readings.filter(r => new Date(r.recordedAt) >= sevenDaysAgo);
        const avg = recentReadings.length > 0 ? (recentReadings.reduce((acc, curr) => acc + curr.glucoseLevel, 0) / recentReadings.length).toFixed(1) : 0;

        // Last reading logic - Need to sort if not sorted?
        // But above I fetched all without sort. Let's findOne with sort for efficiency if needed, but here I have all.
        // Sort in memory to be safe data-wise
        readings.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
        const lastReading = readings.length > 0 ? readings[0] : null;

        res.json({
            count,
            average: avg,
            current: lastReading ? lastReading.glucoseLevel : 0,
            lastRecorded: lastReading ? lastReading.recordedAt : null
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/readings/:id
// @desc    Delete a reading
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const reading = await Reading.findById(req.params.id);

        if (!reading) {
            return res.status(404).json({ msg: 'Reading not found' });
        }

        // Check user
        if (reading.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Reading.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Reading removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Reading not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST api/readings/train-model
// @desc    Train initial LSTM model
// @access  Private
router.post('/train-model', auth, async (req, res) => {
    try {
        const pythonScriptPath = path.join(__dirname, '..', 'ml', 'train_lstm.py');
        const pythonProcess = spawn('python', [pythonScriptPath, req.user.id]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python error:', errorData);
                return res.status(500).json({ msg: 'Error training model', details: errorData });
            }
            res.json({ msg: 'Model training completed successfully.', output: outputData });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/readings/predict-next
// @desc    Predict next glucose reading using LSTM model
// @access  Private
router.get('/predict-next', auth, async (req, res) => {
    try {
        const pythonScriptPath = path.join(__dirname, '..', 'ml', 'predict_lstm.py');
        const pythonProcess = spawn('python', [pythonScriptPath, req.user.id]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python error:', errorData);
                try {
                    const parsedError = JSON.parse(outputData || errorData);
                    return res.status(400).json(parsedError);
                } catch (e) {
                    return res.status(500).json({ msg: 'Error making prediction', details: errorData || outputData });
                }
            }
            try {
                const result = JSON.parse(outputData);
                res.json(result);
            } catch (err) {
                res.status(500).json({ msg: 'Error parsing prediction result', details: outputData });
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

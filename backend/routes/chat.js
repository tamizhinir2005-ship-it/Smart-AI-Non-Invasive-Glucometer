const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Profile = require('../models/Profile');
const Reading = require('../models/Reading');

// @route   POST api/chat
// @desc    Interaction with Gemini AI
// @access  Private
router.post('/', auth, async (req, res) => {
    const { message } = req.body;

    try {
        // Fetch user profile and recent readings for context
        const profile = await Profile.findOne({ user: req.user.id });
        const recentReadings = await Reading.find({ user: req.user.id }).sort({ recordedAt: -1 }).limit(10);

        // Construct context-rich system prompt
        const userContext = `
            PATIENT PROFILE:
            - Name: ${profile ? profile.name : 'User'}
            - Diabetes Type: ${profile ? profile.diabetesType : 'Not specified'}
            - Age: ${profile ? profile.age : 'Not specified'}
            - Gender: ${profile ? profile.gender : 'Not specified'}
            - Blood Group: ${profile ? profile.bloodGroup : 'Not specified'}
            
            RECENT GLUCOSE READINGS:
            ${recentReadings.length > 0
                ? recentReadings.map(r => `- ${r.glucoseLevel} mg/dL (${r.measurementType}) on ${new Date(r.recordedAt).toLocaleString()}`).join('\n')
                : 'No recent readings available.'}
        `;

        const systemInstruction = `
            You are "GlucoBot", a professional, empathetic, and highly knowledgeable AI Diabetes Assistant. 
            Detailed Context: ${userContext}

            YOUR MISSION:
            1. Provide actionable, evidence-based advice on diabetes management, diet, exercise, and lifestyle.
            2. Analyze user's glucose patterns if readings are provided.
            3. Be supportive and professional, using a warm but clinical tone.
            4. Use Markdown formatting (bold, lists, headers) to make your answers easy to read.

            SAFETY GUIDELINES:
            - ALWAYS include a disclaimer that you are an AI, not a doctor.
            - If levels are dangerously high (>300 mg/dL) or low (<70 mg/dL), strongly advise medical consultation.
            - Never suggest changing medication dosages.

            Keep responses extremely short, brief, and crisp. Provide rapid answers without unnecessary filler. Use bullet points where possible for maximum readability. Focus on the user's specific diabetes type and recent data.
        `;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            console.log('NOTICE: Gemini API Key missing. Using simulated response.');
            return res.json({
                reply: `### Welcome, ${profile?.name || 'Friend'}! 
                
I am **GlucoBot**, your AI companion. Currently, my "brain" (API Key) is not fully connected, but I can still offer general advice:

*   **Diet**: Emphasize non-starchy vegetables and lean proteins.
*   **Activity**: Regular walking helps stabilize glucose levels.
*   **Monitoring**: Your last reading was ${recentReadings[0]?.glucoseLevel || 'not found'} mg/dL.

*Please ask your administrator to provide a valid Gemini API Key for full professional assistance.*`
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // List of models to try in order of preference (Verified from account model list)
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ];
        let result;
        let success = false;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting to use model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent([
                    systemInstruction,
                    `User Question: ${message}`
                ]);
                success = true;
                console.log(`Successfully connected to model: ${modelName}`);
                break; // Exit loop if successful
            } catch (err) {
                console.error(`Error with model ${modelName}:`, err.message);
                lastError = err;
            }
        }

        if (!success) {
            throw new Error(`All models failed. Last error: ${lastError?.message}`);
        }

        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (err) {
        console.error('Gemini Execution Error:', err.message);
        res.status(500).json({
            reply: "I'm having trouble connecting to my AI models. Please check if your API key has 'Gemini 1.5 Flash' enabled in Google AI Studio."
        });
    }
});

module.exports = router;

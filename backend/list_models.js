const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.log('Error: GEMINI_API_KEY is not set correctly in .env');
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log('Models list saved to models_list.json');
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();

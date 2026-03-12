const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));
app.use(express.json());

// Status route for diagnostic
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
        version: '1.2.1',
        env: {
            MONGO_URI: process.env.MONGO_URI ? 'SET' : 'MISSING',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING'
        }
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/chat', require('./routes/chat'));

// Database Connection
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        // Clean URI: remove spaces and accidental :27017 which is not allowed in +srv
        const cleanUri = process.env.MONGO_URI.trim().replace(':27017', '');
        
        await mongoose.connect(cleanUri, {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

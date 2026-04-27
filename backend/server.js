require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { pool } = require('./config/db');
const { globalLimiter, authLimiter } = require('./middleware/rateLimit');
const { sessions, SESSION_EXPIRY_MS, loadSessions, saveSessions } = require('./middleware/session');

const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const recordRoutes = require('./routes/records');
const preparationRoutes = require('./routes/preparations');
const materialRoutes = require('./routes/materials');
const recipeRoutes = require('./routes/recipes');
const lookupRoutes = require('./routes/lookups');
const userRoutes = require('./routes/users');
const workClockRoutes = require('./routes/workClock');
const productRoutes = require('./routes/products');

const app = express();
app.use(helmet());
app.use(cookieParser());

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use('/api/', globalLimiter);

app.use(healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/preparations', preparationRoutes);
app.use(materialRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api', lookupRoutes);
app.use('/api', workClockRoutes);
app.use('/api', productRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

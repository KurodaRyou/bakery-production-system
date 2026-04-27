require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { pool } = require('./config/db');
const { globalLimiter, authLimiter } = require('./middleware/rateLimit');
const { sessions, SESSION_EXPIRY_MS, loadSessions, saveSessions } = require('./middleware/session');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { csrfProtection } = require('./middleware/csrf');

const { RegisterRoutes } = require('./generated/routes');
const healthRoutes = require('./routes/health');
// const recordRoutes = require('./routes/records'); // Migrated to TypeScript + tsoa
// const preparationRoutes = require('./routes/preparations'); // Migrated to TypeScript + tsoa
// const materialRoutes = require('./routes/materials'); // Migrated to TypeScript + tsoa
// const recipeRoutes = require('./routes/recipes'); // Migrated to TypeScript + tsoa
// const lookupRoutes = require('./routes/lookups'); // Migrated to TypeScript + tsoa
// const userRoutes = require('./routes/users'); // Migrated to TypeScript + tsoa
// const workClockRoutes = require('./routes/workClock'); // Migrated to TypeScript + tsoa
// const productRoutes = require('./routes/products'); // Migrated to TypeScript + tsoa

const app = express();
app.use(helmet());
app.use(cookieParser());

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use('/api/', globalLimiter);

app.use(healthRoutes);

app.use('/api', csrfProtection);

RegisterRoutes(app);
// app.use('/api/records', recordRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes
    // app.use('/api/preparations', preparationRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes
// app.use(materialRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes
// app.use('/api/recipes', recipeRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes
// app.use('/api/users', userRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes
// app.use('/api', lookupRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes
// app.use('/api', workClockRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes
// app.use('/api', productRoutes); // Migrated to TypeScript + tsoa in RegisterRoutes

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

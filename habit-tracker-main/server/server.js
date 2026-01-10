const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow frontend to call backend
app.use(express.json()); // Parse JSON bodies

// Debug logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`, req.body);
    next();
});

// Routes
app.use('/api/habits', require('./routes/habits'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

//load environment variables from .env
require('dotenv').config(); 
const express = require('express'); //Express framework to create server/handle routing
const mongoose = require('mongoose'); //Mongoose to interact with MongoDB in an object-oriented way

//Create express application instance
const app = express(); 

//handle static files
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Use port from env or 5000
const PORT = process.env.PORT || 5000;

//Body parser for JSON
app.use(express.json());

//Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/messages', messageRoutes);

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected successfully!'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
})

//Route for GET requests defined in root URL '/'
// When root is visited message will send
app.get('/api', (req, res) => {
    res.send('Server is running!');
});

//Start the express server listening on PORT 5000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
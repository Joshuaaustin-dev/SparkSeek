//load environment variables from .env
require('dotenv').config(); 
const express = require('express'); //Express framework to create server/handle routing
const mongoose = require('mongoose'); //Mongoose to interact with MongoDB in an object-oriented way
const cors = require('cors'); //CORS middleware to allow cross-origin requests
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

//Create express application instance
const app = express(); 

//handle static files
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Use port from env or 5000
const PORT = process.env.PORT || 5000;

//Body parser for JSON
app.use(express.json());

//enable CORS for all origins
app.use(cors());

//Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const inspirationalVideosRoutes = require('./routes/inspirationalVideos');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/inspiration', inspirationalVideosRoutes);

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

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Socket auth using JWT provided as handshake auth.token
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    next();
  } catch (e) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
  }

  socket.on('disconnect', () => {
    // cleanup if needed
  });
});

// Make io available in routes
app.set('io', io);

//Start the express server listening
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
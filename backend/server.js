require('dotenv').config(); //load environment variables from .env
const express = require('express'); //Express framework to create server/handle routing
const mongoose = require('mongoose'); //Mongoose to interact with MongoDB in an object-oriented way
const cors = require('cors'); //CORS middleware to allow cross-origin requests
const http = require('http'); //HTTP module to create server
const socketIO = require('socket.io'); //Socket.IO for real-time communication
const jwt = require('jsonwebtoken'); //JWT for authentication

//Create express application instance
const app = express(); 
const server = http.createServer(app); 

// Socket.IO setup with CORS
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Allow all origins in development
    methods: ["GET", "POST"]
  }
});

//handle static files
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Use port from env or 5000
const PORT = process.env.PORT || 5000;

//Body parser for JSON
app.use(express.json());

//enable CORS for all origins
app.use(cors());

// Store connected users
const connectedUsers = new Map();

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Store user connection
  connectedUsers.set(socket.userId, socket.id);
  
  // Join user to their own room for receiving messages
  socket.join(socket.userId);

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const { recipientId, content, conversationId } = data;
      
      // Emit to recipient if they're online
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientId).emit('newMessage', {
          sender: socket.userId,
          content,
          conversationId,
          timestamp: new Date()
        });
      }
      
      // Confirm message sent to sender
      socket.emit('messageSent', { success: true });
      
    } catch (error) {
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { recipientId, conversationId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientId).emit('userTyping', {
        userId: socket.userId,
        conversationId
      });
    }
  });

  socket.on('stopTyping', (data) => {
    const { recipientId, conversationId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientId).emit('userStoppedTyping', {
        userId: socket.userId,
        conversationId
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    connectedUsers.delete(socket.userId);
  });
});

// Make io accessible to routes
app.set('io', io);

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

// === PRODUCTION SETUP FOR VITE BUILD ===
if (process.env.NODE_ENV === 'production') {
  // Serve static files from Vite build (dist folder)
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle React Router - send all non-API requests to React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // Development route
  app.get('/api', (req, res) => {
    res.send('Server is running in development mode!');
  });
}

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected successfully!'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
})

//Start the express server listening on PORT 5000
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
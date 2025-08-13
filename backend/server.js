require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');

// Create express app & HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body parser & CORS
app.use(express.json());
app.use(cors());

// Socket.IO connected users
const connectedUsers = new Map();

// Socket.IO authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  connectedUsers.set(socket.userId, socket.id);
  socket.join(socket.userId);

  socket.on('sendMessage', async (data) => {
    const { recipientId, content, conversationId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientId).emit('newMessage', {
        sender: socket.userId,
        content,
        conversationId,
        timestamp: new Date()
      });
    }
    socket.emit('messageSent', { success: true });
  });

  socket.on('typing', (data) => {
    const { recipientId, conversationId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientId).emit('userTyping', { userId: socket.userId, conversationId });
    }
  });

  socket.on('stopTyping', (data) => {
    const { recipientId, conversationId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientId).emit('userStoppedTyping', { userId: socket.userId, conversationId });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    connectedUsers.delete(socket.userId);
  });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const inspirationalVideosRoutes = require('./routes/inspirationalVideos');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/inspiration', inspirationalVideosRoutes);

// Development route
if (process.env.NODE_ENV !== 'production') {
  app.get('/api', (req, res) => {
    res.send('Server is running in development mode!');
  });
} else {
  console.log("Backend running in production; frontend should be deployed separately.");
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

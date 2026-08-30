const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config(); // Fallback to cwd if present
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const apiRoutes = require('./routes');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitizeInput = require('./middleware/sanitize');

// Security HTTP Headers (configured for cross-origin PDF/image delivery)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Stricter Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(morgan('dev'));

// Apply rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api', apiRoutes);

// Socket.IO connection handling & Real-Time Synchronization
const passportViewers = {}; // { passportId: Set(socketIds) }

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Generalized room joiner
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);

    if (room.startsWith('passport_')) {
      const pid = room.replace('passport_', '').toUpperCase();
      if (!passportViewers[pid]) passportViewers[pid] = new Set();
      passportViewers[pid].add(socket.id);

      const count = passportViewers[pid].size;
      io.to(room).emit('passportViewersUpdated', { passportId: pid, count });
    }
  });

  socket.on('join_student_room', (studentId) => {
    const room = `student_${studentId}`;
    socket.join(room);
    console.log(`[Socket.IO] Socket ${socket.id} joined student room: ${room}`);
  });

  socket.on('join_passport_room', (passportId) => {
    const room = `passport_${passportId.toUpperCase()}`;
    socket.join(room);
    console.log(`[Socket.IO] Socket ${socket.id} joined passport room: ${room}`);

    const pid = passportId.toUpperCase();
    if (!passportViewers[pid]) passportViewers[pid] = new Set();
    passportViewers[pid].add(socket.id);

    const count = passportViewers[pid].size;
    io.to(room).emit('passportViewersUpdated', { passportId: pid, count });
  });

  socket.on('leave_passport_room', (passportId) => {
    const pid = passportId.toUpperCase();
    const room = `passport_${pid}`;
    socket.leave(room);

    if (passportViewers[pid]) {
      passportViewers[pid].delete(socket.id);
      const count = passportViewers[pid].size;
      io.to(room).emit('passportViewersUpdated', { passportId: pid, count });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    // Clean up any passport rooms
    Object.keys(passportViewers).forEach((pid) => {
      if (passportViewers[pid].has(socket.id)) {
        passportViewers[pid].delete(socket.id);
        const count = passportViewers[pid].size;
        io.to(`passport_${pid}`).emit('passportViewersUpdated', { passportId: pid, count });
      }
    });
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const { autoSeed } = require('./services/seed');

const startServer = async () => {
  try {
    await connectDB();
    await autoSeed();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Digital Skill Passport Backend listening on 0.0.0.0:${PORT}`);
      console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to launch server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, io, startServer };

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import mindmapRoutes from './routes/mindmaps.js';
import nodeRoutes from './routes/nodes.js';
import connectionRoutes from './routes/connections.js';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/mindmaps', mindmapRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/connections', connectionRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join mindmap room
  socket.on('join-mindmap', (mindmapId: string) => {
    socket.join(`mindmap-${mindmapId}`);
    console.log(`User ${socket.id} joined mindmap ${mindmapId}`);
  });

  // Leave mindmap room
  socket.on('leave-mindmap', (mindmapId: string) => {
    socket.leave(`mindmap-${mindmapId}`);
    console.log(`User ${socket.id} left mindmap ${mindmapId}`);
  });

  // Handle real-time node updates
  socket.on('node-update', (data) => {
    socket.to(`mindmap-${data.mindmapId}`).emit('node-updated', data);
  });

  // Handle real-time connection updates
  socket.on('connection-update', (data) => {
    socket.to(`mindmap-${data.mindmapId}`).emit('connection-updated', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
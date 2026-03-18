import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from "dotenv";


import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = createServer(app);
dotenv.config();

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);


const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for a specific user
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ✅ Make io available in controllers
app.set('io', io);

// ✅ Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

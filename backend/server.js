import 'dotenv/config';
import { Server } from 'socket.io';
import http from 'http';
import app from './app.js';
import jwt from 'jsonwebtoken';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error: Invalid token'));
        }

        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error('Authentication error: ' + error.message));
    }
});

// Store active users and their socket connections
const activeUsers = new Map();

io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.email || socket.user._id}`);

    // Store user's socket connection
    activeUsers.set(socket.user._id, socket.id);

    // Emit online status to all users
    io.emit('user-online', { userId: socket.user._id });

    // Join a project room
    socket.on('join-project', (projectId) => {
        socket.join(projectId);
        console.log(`👥 User ${socket.user.email} joined project: ${projectId}`);

        // Notify others in the project
        socket.to(projectId).emit('user-joined-project', {
            userId: socket.user._id,
            email: socket.user.email,
            projectId
        });
    });

    // Leave a project room
    socket.on('leave-project', (projectId) => {
        socket.leave(projectId);
        console.log(`👋 User ${socket.user.email} left project: ${projectId}`);

        socket.to(projectId).emit('user-left-project', {
            userId: socket.user._id,
            email: socket.user.email,
            projectId
        });
    });

    // Handle project messages
    socket.on('project-message', (data) => {
        const { projectId, message } = data;

        // Broadcast message to all users in the project room
        io.to(projectId).emit('project-message', {
            message,
            sender: {
                _id: socket.user._id,
                email: socket.user.email
            },
            projectId,
            timestamp: new Date()
        });

        console.log(`💬 Message in project ${projectId} from ${socket.user.email}`);
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { projectId, isTyping } = data;

        socket.to(projectId).emit('user-typing', {
            userId: socket.user._id,
            email: socket.user.email,
            projectId,
            isTyping
        });
    });

    // Handle AI message requests
    socket.on('ai-message', (data) => {
        const { projectId, message } = data;

        // Emit to the specific project room
        io.to(projectId).emit('ai-message', {
            message,
            projectId,
            timestamp: new Date()
        });

        console.log(`🤖 AI message in project ${projectId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.user.email || socket.user._id}`);

        // Remove from active users
        activeUsers.delete(socket.user._id);

        // Notify all users that this user is offline
        io.emit('user-offline', { userId: socket.user._id });
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Export io for use in other files if needed
export { io };

server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`🔌 Socket.IO is ready for connections`);
});
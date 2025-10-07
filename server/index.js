import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import authRouter from './routes/auth.routes.js'
import friendRoute from './routes/friend.routes.js'
// import { setupSocket } from './sockets/socket.js'
import messageRouter from './routes/message.routes.js'
import uploadRouter from './routes/upload.routes.js'
import callRouter from './routes/call.routes.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
export const io = new Server(server, {
    cors: {
        origin: 'https://chat-app-frontend-31e6.onrender.com',
        credentials: true,
    }
})

// add middlewere from app
app.use(cors({ origin: 'https://chat-app-frontend-31e6.onrender.com', credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// setup socket here
// --- server/socket.js (CLEANED + UPDATED VERSION) ---

export const userSocketMap = {};
const busyUsers = new Set();

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
        socket.userId = userId;
        console.log("✅ User connected:", userId);
    }

    socket.emit("me", socket.id);
    io.emit("getOnlineUser", Object.keys(userSocketMap));

    socket.on("join", ({ id, name }) => {
        console.log("👤 Joined:", name, id);
        userSocketMap[id] = socket.id;
        io.emit("online-users", Object.keys(userSocketMap));
    });

    // 📞 Call initiated
    socket.on("callToUser", ({ callToUserId, signalData, from, name, email, profilepic }) => {
        const receiverSocket = userSocketMap[callToUserId];

        if (!receiverSocket) {
            return socket.emit("userUnavailable", { message: "User is offline." });
        }

        if (busyUsers.has(callToUserId)) {
            return socket.emit("userBusy", { message: "User is already in another call." });
        }

        // Mark as busy
        busyUsers.add(from);
        busyUsers.add(callToUserId);

        io.to(receiverSocket).emit("callToUser", {
            signal: signalData,
            from,
            name,
            email,
            profilepic,
        });
    });

    // ✅ Call answered
    socket.on("answeredCall", ({ signal, from, to }) => {
        const callerSocket = userSocketMap[to];
        if (callerSocket) {
            io.to(callerSocket).emit("callAccepted", { signal, from });
        }
    });

    // ❌ Call rejected
    socket.on("reject-call", ({ to, name, profilepic }) => {
        const callerSocket = userSocketMap[to];
        if (callerSocket) {
            io.to(callerSocket).emit("callRejected", { name, profilepic });
        }
        busyUsers.delete(to);
        busyUsers.delete(socket.userId);
    });

    // 📴 Call ended
    socket.on("call-ended", ({ to, name }) => {
        const receiverSocket = userSocketMap[to];
        if (receiverSocket) {
            io.to(receiverSocket).emit("callEnded", { name });
        }
        busyUsers.delete(to);
        busyUsers.delete(socket.userId);
    });

    // ❄️ Handle ICE candidate relay
    socket.on("ice-candidate", ({ to, candidate }) => {
        const receiverSocket = userSocketMap[to];
        if (receiverSocket) {
            io.to(receiverSocket).emit("ice-candidate", { candidate });
        }
    });

    // 🔌 Handle disconnect
    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.userId);
        delete userSocketMap[socket.userId];
        busyUsers.delete(socket.userId);
        io.emit("online-users", Object.keys(userSocketMap));
    });
});





// get welcome route 
app.get('/', (req, res) => {
    res.json({ message: "jai shree krisna...." })
})

// router here
app.use('/api/auth', authRouter)
app.use('/api/friends', friendRoute)
app.use('/api/messages', messageRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/calls', callRouter)

// socket setup here
// setupSocket(io)

// databse connect here 
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDb connected.')
        server.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    }).catch((err) => console.log(err))

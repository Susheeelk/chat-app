import Chat from "../models/Chat.js"
import Message from "../models/Message.js"


let onlineUsers = {}

export const setupSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('user-online', (userId) => {
            onlineUsers[userId] = socket.id
        })

        // handle sending message here
        socket.on('send-message', async (data) => {
            const { senderId, receiverId, text, media } = data
            let chat = await Chat.findOne({ members: { $all: [senderId, receiverId] } })
            if (!chat) chat = await Chat.create({ members: [senderId, receiverId] })

            const message = await Message.create({ chatId: chat._id, sender: senderId, receiver: receiverId, text, media })

            // emit to reciveer
            const receiverSocket = onlineUsers[receiverId]
            if (receiverSocket) {
                io.to(receiverSocket).emit('new-message', message)
            }
        })

        // call send offer
        socket.on('call-user', ({ from, to, offer }) => {
            const toSocketId = onlineUsers[to]
            if (toSocketId) {
                io.to(toSocketId).emit('incoming-call', { from, offer })
            }
        })

        // WebRTC: Send answer
        socket.on('answer-call', ({ to, answer }) => {
            const toSocketId = onlineUsers[to]
            if (toSocketId) {
                io.to(toSocketId).emit('call-answered', { answer })
            }
        })

        // WebRTC: ICE Candidate
        socket.on('ice-candidate', ({ to, candidate }) => {
            const toSocketId = onlineUsers[to]
            if (toSocketId) {
                io.to(toSocketId).emit('ice-candidate', { candidate })
            }
        })

        // Call rejected / ended
        socket.on('end-call', ({ to }) => {
            const toSocketId = onlineUsers[to]
            if (toSocketId) {
                io.to(toSocketId).emit('call-ended')
            }
        })

        // media disconnect here
        socket.on('disconnect', () => {
            for (const userId in onlineUsers) {
                if (onlineUsers[userId] === socket.id) {
                    delete onlineUsers[userId]
                    break
                }
            }
        })

    })
}
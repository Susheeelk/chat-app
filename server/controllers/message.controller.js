import { io, userSocketMap } from "../index.js"
import Chat from "../models/Chat.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../utils/cloudinary.js"


// helper to check if user are friend
const areFriend = async (userId1, userId2) => {
    const user = await User.findById(userId1)
    return user.friends.includes(userId2)
}

// send message here
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id
        const { text, image } = req.body
        const receiverId = req.params.id

        // check your friend or not
        const allow = await areFriend(senderId, receiverId)
        if (!allow) {
            return res.status(403).json({ success: false, message: "You are not friends with this user" })
        }

        // if user block not send message

        const sender = await User.findById(req.user._id);
        const receiver = await User.findById(receiverId);

        if (receiver.blockedUsers.includes(sender._id)) {
            return res.status(403).json({ message: "You are blocked by this user." });
        }

        if (sender.blockedUsers.includes(receiver._id)) {
            return res.status(403).json({ message: "You have blocked this user." });
        }

        // pahle chat check karenge yadi chat nhi h to chat create karenge

        let imageUrl
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            text,
            image: imageUrl
        })

        // emit new message 
        const receiverSocketId = userSocketMap[receiverId]
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }
        res.status(201).json({ success: true, newMessage })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get messages in a chat
export const getMessages = async (req, res) => {
    try {
        const { friendId } = req.params
        const userId = req.user._id

        const chat = await Chat.findOne({ members: { $all: [userId, friendId] } })


        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        })
        await Message.updateMany({ sender: friendId, receiver: userId }, { seen: true })
        // console.log(messages)
        res.status(200).json({
            success: true,
            messages
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// mark as seen message here
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({
            success: true
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// 
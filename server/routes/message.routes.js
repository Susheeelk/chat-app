import express from "express";
import { getMessages, markMessageAsSeen, sendMessage } from "../controllers/message.controller.js";
import { protect } from "../middlewere/authMiddlewere.js";

const messageRouter = express.Router()



messageRouter.post('/send/:id', protect, sendMessage)
messageRouter.get('/:friendId', protect, getMessages)
messageRouter.get('/mark/:id', protect, markMessageAsSeen)

export default messageRouter
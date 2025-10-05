import express from "express";
import { acceptRequest, cancelRequest, getMyRequests, getOutgoingFriendReqs, getRecommendedUsers, rejectRequest, sendRequest } from "../controllers/friend.controller.js";
import { protect } from "../middlewere/authMiddlewere.js";

const friendRoute = express.Router()

friendRoute.use(protect)

friendRoute.post('/send/:id', sendRequest)
friendRoute.post('/accept/:id', acceptRequest)
friendRoute.post('/reject/:id', rejectRequest)
friendRoute.post('/cancel/:id', cancelRequest)
friendRoute.get('/request', getMyRequests)
friendRoute.get('/all-user', protect, getRecommendedUsers)
friendRoute.get('/outgoing-friend', protect, getOutgoingFriendReqs)

export default friendRoute
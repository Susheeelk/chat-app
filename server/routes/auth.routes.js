import express from 'express'
import { blockUser, checkAuth, getMyFriends, getRecommendedUsers, login, register, unblockUser, updateProfile } from '../controllers/auth.controller.js'
import { protect } from '../middlewere/authMiddlewere.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/check', protect, checkAuth)
authRouter.post('/update-profile', protect, updateProfile)
authRouter.get("/", protect, getRecommendedUsers);
authRouter.get("/friends", protect, getMyFriends);
authRouter.put('/block/:id', protect, blockUser);
authRouter.put('/unblock/:id', protect, unblockUser);



export default authRouter
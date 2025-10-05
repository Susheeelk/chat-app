import express from 'express'

import { protect } from '../middlewere/authMiddlewere.js'
import { canCallUser } from '../controllers/call.controller.js'


const router = express.Router()
router.get('/can-call/:friendId', protect, canCallUser)

export default router
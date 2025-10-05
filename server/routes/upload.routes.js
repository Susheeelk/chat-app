import express from 'express'
import { protect } from '../middlewere/authMiddlewere.js'
import { fileUploader, uploadFile } from '../controllers/upload.controller.js'

const router = express.Router()

router.post('/file', protect, fileUploader, uploadFile)

export default router
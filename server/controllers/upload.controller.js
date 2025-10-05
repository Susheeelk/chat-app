import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from '../utils/cloudinary.js'



const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'mern-chat-app',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'mp4', 'webm'],
        resource_type: 'auto',
    }
})

const upload = multer({ storage })

export const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' })
    }
    res.status(200).json({
        url: req.file.path,
        type: req.file.mimetype.startWith('image') ? 'image'
            : req.file.mimetype.startWith('video') ? 'video'
                : 'file'
    })
}

export const fileUploader = upload.single('file')
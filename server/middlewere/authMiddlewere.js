import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.token
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, token failed' })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decode.userId).select('-password')
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' })
    }
}


// check auth here
import User from "../models/User.js"


export const canCallUser = async (req, res) => {
    const { friendId } = req.params

    const user = await User.findById(req.user._id)
    const isFriend = user.friends.includes(friendId)
    if (!isFriend) {
        return res.status(403).json({ message: "You are not friends with this user" })
    }
    res.status(200).json({ message: "You can call this user" })
}
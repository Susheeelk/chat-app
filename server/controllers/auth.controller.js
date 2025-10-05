import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../utils/cloudinary.js"
import { generateToken } from "../utils/generateToken.js"



// register controller here
export const register = async (req, res) => {
    const { fullName, email, password, bio } = req.body
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "User already exist.Please login now."
            })
        }
        const user = await User.create({
            fullName,
            email,
            password,
            bio
        })

        // console.log(existing._id)
        const token = generateToken(user._id)
        res.status(201).json({
            success: true,
            user,
            token,
            message: "Account created successfully."
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

// login controller here
export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }
        const user = await User.findOne({ email })
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = generateToken(user._id)
        res.status(200).json({
            success: true,
            message: "Login successfully",
            user,
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// logout controller here
// export const logout = async (req, res) => {
//     res.clearCookie('token')
//     res.status(200).json({ message: "Logged out successfully." })
// }

// check auth page
export const checkAuth = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    })
}


// update profile here controller here
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body
        const userId = req.user._id
        let updateProfile
        if (!profilePic) {
            updateProfile = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic)
            updateProfile = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, fullName, bio }, { new: true })
        }
        res.json({
            success: true,
            user: updateProfile,
            message: "Updated successfully."
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// recomded uder here controller
export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, //exclude current user
                { _id: { $nin: currentUser.friends } }, // exclude current user's friends
            ],
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// friend message here
export async function getMyFriends(req, res) {
    try {
        const userId = req.user._id;

        // Get user's friends
        const user = await User.findById(userId)
            .select("friends")
            .populate("friends", "fullName profilePic");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get unseen messages from all other users
        const allOtherUsers = await User.find({ _id: { $ne: userId } }).select('-password');
        let unseenMessage = {};

        const promise = allOtherUsers.map(async (otherUser) => {
            const messages = await Message.find({
                sender: otherUser._id,
                receiver: userId,
                seen: false,
            });
            if (messages.length > 0) {
                unseenMessage[otherUser._id] = messages.length;
            }
        });

        await Promise.all(promise);

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                friends: user.friends,
            },
            unseenMessage,
        });

    } catch (error) {
        console.error("Error in getMyFriends:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}


// block user or not
// Block a user
export const blockUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const blockId = req.params.id;

        if (userId.toString() === blockId) {
            return res.status(400).json({ message: "You cannot block yourself." });
        }

        const user = await User.findById(userId);
        if (!user.blockedUsers.includes(blockId)) {
            user.blockedUsers.push(blockId);
            await user.save();
        }

        res.status(200).json({ message: "User blocked successfully." });
    } catch (error) {
        console.log(error.message)
    }
};

// Unblock a user
export const unblockUser = async (req, res) => {
    const userId = req.user._id;
    const unblockId = req.params.id;

    const user = await User.findById(userId);
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== unblockId);
    await user.save();

    res.status(200).json({ message: "User unblocked successfully." });
};

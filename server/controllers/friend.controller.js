import FriendRequiest from "../models/FriendRequiest.js"
import User from "../models/User.js"


// craete request here
export const sendRequest = async (req, res) => {
    const senderId = req.user._id
    // jisko request bhejenge uska id h
    const recipientId = req.params.id
    if (senderId === recipientId) {
        res.status(400).json({ success: false, message: "Can't send request to yourself." })
    }

    const recipient = await User.findById(senderId);


    // check if user is already friends
    if (recipient.friends.includes(senderId)) {
        return res.status(400).json({ success: false, message: "You are already friends with this user" });
    }



    const existing = await FriendRequiest.findOne({
        $or: [
            { sender: senderId, recipient: recipientId },
            { sender: recipientId, recipient: senderId },
        ],
    })
    if (existing) {
        return res.status(400).json({ success: false, message: "Request already sent." })
    }
    await FriendRequiest.create({
        sender: senderId,
        recipient: recipientId
    })
    res.status(201).json({ success: true, message: 'Friend request sent' })
}

// accept request here
export const acceptRequest = async (req, res) => {
    const request = await FriendRequiest.findById(req.params.id)

    // check request fount or not OR user id match the recepitient id
    if (!request || request.recipient.toString() !== req.user._id.toString()) {
        return res.status(404).json({ success: false, message: 'Request not found' })
    }
    request.status = "accepted"
    await request.save()

    // add id to user model in friend section 
    await User.findByIdAndUpdate(request.sender, {
        $push: { friends: request.recipient }
    })
    await User.findByIdAndUpdate(request.recipient, {
        $push: { friends: request.sender }
    })

    res.status(200).json({ success: true, message: 'Friend request accepted' })
}

// Reject request
export const rejectRequest = async (req, res) => {
    const request = await FriendRequiest.findById(req.params.id)
    if (!request || request.recipient.toString() !== req.user._id.toString()) {
        return res.status(404).json({ success: false, message: 'Request not found' })
    }

    await FriendRequiest.findByIdAndDelete(request._id)

    res.status(200).json({ success: true, message: 'Friend request rejected' })
}

// Cancel sent request
export const cancelRequest = async (req, res) => {
    const senderId = req.user._id
    const request = await FriendRequiest.findOneAndDelete({
        sender: senderId,
        recipient: req.params.id,
        status: 'pending'
    })
    // console.log(request)

    if (!request) return res.status(404).json({ success: false, message: 'No pending request found' })

    res.status(200).json({ success: true, message: 'Friend request cancelled' })
}

// Get all incoming requests
export const getMyRequests = async (req, res) => {
    // console.log(req.user.id)
    const requests = await FriendRequiest.find({
        recipient: req.user.id,
        status: 'pending'
    }).populate('sender', 'fullName email profilePic')

    res.status(200).json({ success: true, requests })
}

// this controller which send by me friend request
export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingRequests = await FriendRequiest.find({
            sender: req.user._id,
            status: "pending",
        })

        res.status(200).json({ success: true, outgoingRequests });
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

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
        res.status(200).json({ success: true, recommendedUsers });
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

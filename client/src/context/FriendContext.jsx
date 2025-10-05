import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";



export const FriendContext = createContext()

export const FriendProvider = ({ children }) => {

    const [allUser, setAllUser] = useState([])
    const [friend, setFriend] = useState([])
    const [isRequest, setIsRequest] = useState([])
    const { axios } = useContext(AuthContext)

    // feth all friends here
    const allFriend = async () => {
        try {
            const { data } = await axios.get('/api/friends/all-user')
            if (data.success) {
                setAllUser(data.recommendedUsers)
            }

        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    // all request here
    const allRequest = async () => {
        try {
            const { data } = await axios.get('api/friends/request')
            if (data.success) {
                setFriend(data.requests)
            }

        } catch (error) {
            toast.error(error.response.data.message)
        }

    }


    // all request here
    const outGoingRequest = async () => {
        try {
            const { data } = await axios.get('api/friends/outgoing-friend')
            if (data.success) {
                setIsRequest(data.outgoingRequests)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }

    }



    // total out going request here
    // const outGoingRequest = async () => {
    //     try {
    //         const { data } = axios.get('api/friends/outgoing-friend')
    //         if (data.success) {
    //             setFriendRequest(data.outgoingRequests)
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         toast.error(error.message)
    //     }
    // }

    // send request here
    const sendRequest = async (userId) => {
        try {
            console.log(userId)
            const { data } = await axios.post(`/api/friends/send/${userId}`)
            if (data.success) {
                toast.success(data.message)

            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    // accept function here
    const acceptRequest = async (userId) => {
        try {
            const { data } = await axios.post(`/api/friends/accept/${userId}`)
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    // rejectt function here
    const rejectRequest = async (userId) => {
        try {
            const { data } = await axios.post(`/api/friends/reject/${userId}`)
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    // cancel function here
    const calcelRequest = async (userId) => {
        try {
            const { data } = await axios.post(`/api/friends/cancel/${userId}`)
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    const value = {
        allUser, allFriend, allRequest, sendRequest, acceptRequest,
        rejectRequest, calcelRequest, friend, isRequest, outGoingRequest
    }
    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    )
}
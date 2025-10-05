import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";


export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {



    const [message, setMessage] = useState([])
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessage, setUnseenMessage] = useState({})

    const { socket, axios } = useContext(AuthContext)

    // console.log(selectedUser)

    const getUsers = async () => {
        try {
            const { data } = await axios.get('api/auth/friends')
            // console.log(data.user.friends)
            if (data?.success) {
                setUsers(data?.user?.friends)
                // console.log(data)
                setUnseenMessage(data.unseenMessage)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    // get message for selected user
    const getMessagees = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`)
            console.log(data)
            if (data?.success) {
                setMessage(data?.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to send mes(sage to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if (data.success) {
                setMessage((prevMessage) => [...prevMessage, data.newMessage])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message || error.message)
        }
    }

    // function to get instance message
    const subscribeToMessage = async () => {
        if (!socket) return
        socket.on('newMessage', (newMessage) => {
            if (selectedUser && newMessage.sender === selectedUser._id) {
                newMessage.seen = true
                setMessage((prevMessage) => [...prevMessage, newMessage])
                axios.put(`/api/message/mark/${newMessage._id}`)
            } else {
                setUnseenMessage((preUnseenMessage) => ({
                    ...preUnseenMessage, [newMessage.sender]:
                        preUnseenMessage[newMessage.sender] ? preUnseenMessage[newMessage.sender] + 1 : 1
                }))
            }
        })
    }

    // function to unscscribe message
    const unsubscribeFromMessage = () => {
        if (socket) socket.off("newMessage")
    }

    useEffect(() => {
        subscribeToMessage();
        return () => unsubscribeFromMessage()
    }, [socket, selectedUser])


    const value = {
        message,
        users,
        selectedUser, getUsers, setMessage, sendMessage, setSelectedUser, unseenMessage, setUnseenMessage, getMessagees

    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}
import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from 'socket.io-client'


// backend url 
const backendurl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendurl

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUser, setOnlineUser] = useState([])
    const [socket, setSocket] = useState(null)

    // check user auth or not
    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check')
            if (data?.success) {
                setAuthUser(data?.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // login function
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)
            if (data?.success) {
                setAuthUser(data?.user)
                // console.log(data)
                connectSocket(data.user)
                axios.defaults.headers.common['token'] = data.token
                setToken(data.token)
                localStorage.setItem('token', data.token)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error)
        }
    }


    // logout here
    const logout = async () => {
        localStorage.removeItem('token')
        setToken(null)
        setAuthUser(null)
        setOnlineUser([])
        axios.defaults.headers.common['token'] = null
        toast.success('Logged out successfully')
        socket.disconnect();
    }

    // update profile here
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.post('/api/auth/update-profile', body)
            if (data.success) {
                setAuthUser(data.user)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    // socket connection and user get update 
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return
        const newSocket = io(backendurl, {
            query: {
                userId: userData._id
            }
        })
        newSocket.connect()
        setSocket(newSocket)

        newSocket.on("getOnlineUser", (userIds) => {
            setOnlineUser(userIds)
        })
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token
            checkAuth()
        }

        // console.log(authUser)
    }, [])
    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile,
        checkAuth

    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
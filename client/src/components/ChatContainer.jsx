import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import useWebRTC from "../hooks/useWebRTC";
import assets from "../assets/assets";
import toast from "react-hot-toast";
import { formatMessageTime } from "../lib/utils";
import {
    FaFileVideo,
    FaMicroblog,
    FaPhoneFlip,
    FaVideo,
    FaVideoSlash,
    FaX,
    FaMicrochip,
    FaPhone,
    FaRegCircleQuestion,
} from "react-icons/fa6";

const ChatContainer = () => {
    const { message, selectedUser, setSelectedUser, sendMessage, getMessagees } = useContext(ChatContext);
    const { axios, authUser, onlineUser, socket, checkAuth } = useContext(AuthContext);
    const [input, setInput] = useState("");
    const [isBlocked, setIsBlocked] = useState(false);

    const scrollEnd = useRef();
    const remoteVideoRef = useRef();

    const {
        myVideo,
        callerInfo,
        remoteStream,
        incomingCall,
        callAccepted,
        callRejectedPopUp,
        rejectorData,
        isMicOn,
        isCamOn,
        waitingForAnswer,
        callUser,
        answerCall,
        rejectCall,
        endCall,
        toggleMic,
        toggleCam,
    } = useWebRTC({ socket, authUser, selectedUser });

    // block unblock api
    const handleBlockUser = async (id) => {
        try {
            await axios.put(`/api/auth/block/${id}`);
            toast.success("User blocked");
            checkAuth()
            // Optionally update state or refetch user
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleUnblockUser = async (id) => {
        try {
            await axios.put(`/api/auth/unblock/${id}`);
            toast.success("User unblocked");
            checkAuth()
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    // check block user or not
    useEffect(() => {
        if (!authUser || !selectedUser) return;

        const blockedByMe = authUser.blockedUsers?.includes(selectedUser._id);
        const blockedMe = selectedUser.blockedUsers?.includes(authUser._id);

        setIsBlocked(blockedByMe || blockedMe);
    }, [authUser, selectedUser, isBlocked]);


    useEffect(() => {
        if (scrollEnd.current) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [message]);

    useEffect(() => {
        if (selectedUser) {
            getMessagees(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return;
        await sendMessage({ text: input });
        setInput("");
    };

    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
        };
        reader.readAsDataURL(file);
    };

    if (!selectedUser) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
                <img src={assets.logo_icon} alt="Logo" className="max-w-16" />
                <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-hidden relative backdrop-blur-lg text-white flex flex-col">
            {/* ---------------- VIDEO CALL UI ---------------- */}
            <div></div>
            {callAccepted && (
                <div className="flex fixed w-full h-full  gap-6  p-4 bg-black">
                    {/* {console.log(myVideo.current)} */}
                    <video ref={myVideo} autoPlay playsInline muted className="rounded-2xl relative right-0 z-50  w-[200px] h-[140px] border" />
                    <video ref={remoteVideoRef} autoPlay playsInline className="rounded-2xl absolute z-40 top-0 w-full h-full " />
                </div>
            )}

            {incomingCall && !callAccepted && (
                <div className="text-center  fixed top-0 flex  justify-center items-center p-6 bg-black/40 w-full h-full">
                    <div className="w-[17rem] h-[10rem] p-4 rounded-2xl flex flex-col bg-white">
                        <h2 className="text-xl font-semibold mb-4 text-black">📞 Incoming Call...</h2>
                        <h2 className="text-xl font-semibold mb-4 text-black">{callerInfo.name}</h2>

                        <div className="flex justify-center gap-4">
                            <button onClick={answerCall} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                                <FaPhone className="inline mr-2" /> Accept
                            </button>
                            <button onClick={rejectCall} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                                <FaX className="inline mr-2" /> Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {waitingForAnswer && !callAccepted && (
                <div className="text-center fixed top-0 w-full h-full flex flex-col items-center justify-center gap-4 p-4 bg-black/40">
                    <h2 className="text-xl font-semibold mb-2">📤 Calling {selectedUser?.fullName}...</h2>
                    <video ref={myVideo} autoPlay muted playsInline className="rounded-2xl w-[300px] h-[220px] border" />
                    <button onClick={endCall} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                        <FaPhone className="mr-2 inline" /> Cancel Call
                    </button>
                </div>
            )}

            {callRejectedPopUp && rejectorData && (
                <div className="text-center p-6 bg-black/40">
                    <h2 className="text-xl font-semibold text-red-400 mb-4">❌ Call Rejected by {rejectorData?.name}</h2>
                    <button onClick={() => window.location.reload()} className="bg-gray-700 text-white px-4 py-2 rounded">
                        Close
                    </button>
                </div>
            )}

            {/* ---------------- CALL CONTROLS ---------------- */}
            {callAccepted && (
                <div className="flex absolute bottom-8 left-4 right-4 gap-4 mt-4 justify-center">
                    <button onClick={toggleMic} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
                        {isMicOn ? <FaMicrochip className="inline mr-2" /> : <FaMicroblog className="inline mr-2" />}
                        {isMicOn ? "Mic On" : "Mic Off"}
                    </button>
                    <button onClick={toggleCam} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
                        {isCamOn ? <FaVideoSlash className="inline mr-2" /> : <FaFileVideo className="inline mr-2" />}
                        {isCamOn ? "Cam On" : "Cam Off"}
                    </button>
                    <button onClick={endCall} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        <FaPhoneFlip className="inline mr-2" /> End Call
                    </button>
                </div>
            )}

            {/* ---------------- HEADER ---------------- */}
            <div className="flex items-center gap-2 py-3 px-4 border-b border-stone-500">
                <img
                    src={selectedUser.ProfilePic || assets.avatar_icon}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                />
                <p className="flex-1 text-lg text-white flex items-center gap-2">
                    {selectedUser.fullName}
                    {onlineUser.includes(selectedUser._id) && (
                        <span className="w-2 h-2 rounded-full bg-green-600" />
                    )}
                </p>
                {!isBlocked && <> <FaVideo onClick={callUser} size={34} className="p-2 cursor-pointer text-white" />
                    <FaPhone size={34} className="p-2 cursor-pointer text-white" /> </>}

                <div className='relative  py-2 group'>
                    {/* friend reques here */}
                    <FaRegCircleQuestion size={25} className="max-w-5 group " />
                    <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                        {!authUser.blockedUsers?.includes(selectedUser._id) ? (
                            <button onClick={() => handleBlockUser(selectedUser._id)} className="text-red-500">Block</button>
                        ) : (
                            <button onClick={() => handleUnblockUser(selectedUser._id)} className="text-green-500">Unblock</button>
                        )}
                        {console.log(authUser.blockedUsers?.includes(selectedUser._id))}
                    </div>
                </div>
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />


            </div>

            {/* ---------------- MESSAGES ---------------- */}
            <div className="flex-1 overflow-y-scroll p-3 pb-6">
                {message.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 justify-end ${msg.sender !== authUser._id && 'flex-row-reverse'}`}>
                        {msg.image ? (
                            <img src={msg.image} alt="" className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8" />
                        ) : (
                            <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.sender === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                                {msg.text}
                            </p>
                        )}
                        <div className="text-center text-xs">
                            <img
                                src={
                                    msg.sender === authUser._id
                                        ? authUser?.ProfilePic || assets.avatar_icon
                                        : selectedUser?.ProfilePic || assets.avatar_icon
                                }
                                alt=""
                                className="w-7 rounded-full"
                            />
                            <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
                <div ref={scrollEnd}></div>
            </div>

            {/* ---------------- INPUT ---------------- */}
            {!isBlocked && <div className="flex items-center gap-3 p-3 bg-black/40">
                <div className="flex-1 flex items-center bg-gray-500 px-3 border-1 rounded-full md:w-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
                        placeholder="Send a message"
                        className="flex-1 text-sm p-3 border-none outline-none text-white placeholder-gray-100 bg-transparent"
                    />
                    <input type="file" onChange={handleSendImage} id="image" accept="image/*" hidden />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="Gallery" className="mr-2 w-5 cursor-pointer" />
                    </label>
                </div>
                <img onClick={handleSendMessage} src={assets.send_button} alt="Send" className="w-7 cursor-pointer" />
            </div>}
        </div>
    );
};

export default ChatContainer;

import React, { useContext, useEffect, useState } from 'react'
// import assets, { userDummyData } from '../assets/assets';
import { FriendContext } from '../context/FriendContext';
import assets from '../assets/assets';

const Request = ({ setOpen }) => {

    const { allUser, calcelRequest, allFriend, allRequest, sendRequest, acceptRequest,
        rejectRequest, friend, isRequest, outGoingRequest } = useContext(FriendContext)
    // const [sent, setSent] = useState(false)
    const [isFriendOpen, setIsFriendOpen] = useState(true)



    useEffect(() => {
        allFriend()
        allRequest()
        outGoingRequest()

    }, [sendRequest, rejectRequest, outGoingRequest])
    return (
        <div className='absolute flex items-center justify-center top-[10%] left-[5%] right-[5%] max-md:left-[0] w-screen   bg-transparent'>
            <div className='w-[30rem] max-md:w-[80%] shadow-2xl  h-[30rem]  rounded-3xl bg-gray-300 overflow-hidden'>
                <div className='flex items-center w-full justify-between pb-1 bg-gray-200'>
                    <div className='flex items-center'>
                        <p onClick={() => setIsFriendOpen(true)} className={`text-5 font-bold text-blue-500 text-center cursor-pointer px-8 py-1.5 ${isFriendOpen ? 'bg-amber-400' : ''}`}>Friend Request</p>
                        <p onClick={() => setIsFriendOpen(false)} className={`text-5 font-bold text-blue-500 text-center cursor-pointer px-8 py-1.5 ${isFriendOpen ? '' : 'bg-amber-400'}`}>Suggested</p>
                    </div>
                    <p onClick={() => setOpen(false)} className='text-5 mt-1.5 mr-2 font-bold text-white text-center cursor-pointer bg-gradient-to-r from-purple-400 to-violet-600 bg-gray-300 px-3 rounded-full py-1'>Close</p>
                </div>
                <div className='bg-[#282142] rounded-full flex items-center  py-3 px-4 mx-2'>
                    <input type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8]  flex-1' placeholder='Search user' />
                </div>
                {/*  yadi rfriend request h*/}
                {
                    isFriendOpen ? (<>
                        {/* all user here */}
                        <div className='flex flex-col mt-4 max-h-full overflow-y-scroll pr-2'>
                            {
                                friend.map((user, index) => (
                                    <div key={index} className={`relative flex justify-between mt-2 items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm`}>
                                        <div className='flex items-center gap-4'>
                                            {/* {console.log(user)} */}
                                            <img src={user.sender.profilePic || assets.avatar_icon} alt="Profile Pic" className='w-[35px] aspect-[1/1] rounded-full' />
                                            <p>{user.sender.fullName}</p>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <p onClick={() => acceptRequest(user._id)} className='text-5 font-bold text-white text-center cursor-pointer bg-gradient-to-r from-purple-400 to-violet-600 bg-gray-300 px-3 rounded-full py-1'>Accept</p>

                                            <p onClick={() => rejectRequest(user._id)} className='text-5 font-bold text-white text-center cursor-pointer bg-gradient-to-r from-purple-400 to-violet-600 bg-gray-300 px-3 rounded-full py-1'>Reject</p>

                                        </div>

                                    </div>

                                ))
                            }
                        </div>
                    </>) : (<>
                        {/* all user here */}
                        <div className='flex flex-col mt-4 max-h-full overflow-y-scroll pr-2'>
                            {
                                allUser.map((user, index) => (
                                    <div key={index} className={`relative flex justify-between mt-2 items-center gap-2 p-2 pl-4 rounded  hover:bg-gray-100 transition cursor-pointer max-sm:text-sm`}>
                                        <div className='flex items-center gap-4'>
                                            <img src={user?.profilePic || assets.avatar_icon} alt="Profile Pic" className='w-[35px] aspect-[1/1] rounded-full' />
                                            <p>{user.fullName}</p>
                                        </div>

                                        {

                                            isRequest.find(u => u.recipient.includes(user._id)) ? (

                                                <p onClick={() => calcelRequest(user._id)} className='text-5 font-bold text-white text-center cursor-pointer bg-gradient-to-r from-purple-400 to-violet-600 bg-gray-300 px-3 rounded-full py-1'>Cancel Request</p>

                                            ) : (
                                                <p onClick={() => sendRequest(user._id)} className='text-5 font-bold text-white text-center cursor-pointer bg-gradient-to-r from-purple-400 to-violet-600 bg-gray-300 px-3 rounded-full py-1'>Add Friend</p>
                                            )
                                        }
                                        {/* {console.log(isRequest.map(u => u.recipient), user._id)} */}
                                    </div>

                                ))
                            }
                        </div>
                    </>

                    )
                }
            </div>


        </div>

    )
}

export default Request

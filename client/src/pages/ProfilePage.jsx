import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const ProfilePage = () => {
    const { authUser, updateProfile } = useContext(AuthContext)
    const navigate = useNavigate()
    const [selectedImage, setSelectedImage] = useState(null)
    const [name, setName] = useState(authUser.fullName)
    const [bio, setBio] = useState(authUser.bio)

    // form submit here
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedImage) {
            await updateProfile({ fullName: name, bio })
            navigate('/')
            return
        }
        const reader = new FileReader()
        reader.readAsDataURL(selectedImage)
        reader.onload = async () => {
            const base64Image = reader.result
            await updateProfile({ profilePic: base64Image, fullName: name, bio })
            navigate('/')
        }

    }
    return (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
            <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-700 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
                <form onSubmit={handleSubmit} className='flex  flex-col gap-5 p-10 flex-1'>
                    <h3 className='text-lg font-bold'>Profile Details</h3>
                    <label htmlFor="avator" className='flex items-center gap-3 cursor-pointer'>
                        <input type="file" onChange={(e) => setSelectedImage(e.target.files[0])} id='avator' accept='.png, .jpg, .jpeg' hidden />
                        <img src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} alt="" className={`w-20 h-20 ${selectedImage && 'rounded-full'}`} />
                        upload profile image
                    </label>
                    <input type="text" value={authUser.email} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' disabled />
                    <input type="text" onChange={(e) => setName(e.target.value)} value={name} placeholder='Your Name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' />
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Provide a short bio' required></textarea>
                    <div className='flex items-center justify-between'>
                        <button type='submit' className='py-3 px-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                            Update now
                        </button>
                        <Link to='/' className='py-3 px-3  bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                            Back To Home
                        </Link>
                    </div>
                </form>
                <img src={authUser?.profilePic || assets.logo_icon} alt="logo here" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && 'rounded-full'}`} />
            </div>
        </div>
    )
}

export default ProfilePage

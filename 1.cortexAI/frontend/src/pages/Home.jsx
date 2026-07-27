import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { setUserdata } from '../redux/userSlice';
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';

function Home() {
    const {userData}=useSelector(state=>state.user)
    const dispatch=useDispatch()
    const [loading, setLoading] = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState("")

    const handleLogin = async (token) => {
        try {
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
        } catch (error) {
            console.error("Backend login error:", error)
            setErrorMsg(error?.response?.data?.message || "Failed to log in on server")
        }
    }

    const googleLogin = async () => {
        setLoading(true)
        setErrorMsg("")
        try {
            const data = await signInWithPopup(auth, googleProvider)
            const token = await data.user.getIdToken()
            await handleLogin(token)
        } catch (error) {
            console.error("Firebase Login Error:", error)
            if (error.code === 'auth/popup-blocked') {
                setErrorMsg("Popup was blocked by browser. Please allow popups for this site.")
            } else if (error.code === 'auth/unauthorized-domain') {
                setErrorMsg("Domain not authorized in Firebase Console.")
            } else if (error.code === 'auth/operation-not-allowed') {
                setErrorMsg("Google Sign-In is not enabled in Firebase Console.")
            } else {
                setErrorMsg(error.message || "Google Sign-in failed.")
            }
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className='h-screen  flex bg-[#0d0f14] text-white overflow-hidden'>

<SideBar/>
<ChatArea/>
<Artifact/>

{!userData &&   <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur'>
                <div className='w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5'>
                    <div className='flex flex-col gap-1'>
                        <h2 className='text-[17px] font-semibold text-slate-100 tracking-tight'>Welcome to CortexAI</h2>
                        <p className='text-[13px] text-slate-500'>Please login to continue using the app.</p>
                    </div>

                    {errorMsg && (
                        <div className='p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400'>
                            {errorMsg}
                        </div>
                    )}

                    <button 
                        disabled={loading}
                        className='w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 transition-all duration-150 cursor-pointer disabled:opacity-50' 
                        onClick={googleLogin}
                    >
                        <FcGoogle size={15} />
                        {loading ? "Connecting..." : "Continue With Google"}
                    </button>
                </div>
            </div>}
          
        </div>
    )
}

export default Home

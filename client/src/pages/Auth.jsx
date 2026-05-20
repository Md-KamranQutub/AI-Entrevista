import React, { useEffect } from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { convertOffsetToTimes, easeIn, easeInOut, easeOut, motion } from 'framer-motion'
import { signInWithPopup } from 'firebase/auth';
import { auth , provider } from '../utils/firebase.js'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const Auth = () => {
  const navigate = useNavigate();
  // useEffect(() => {
  //   const check = async()=>{
  //    const response = await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/auth/check",{name,email}, {withCredentials:true});
  //       if(response.data.status === "success")
  //         navigate("/");
  //     }
  //     check();
  // }, [])
  
  const handleGoogleAuth = async()=>{
    try{
        const result = await signInWithPopup(auth , provider);
        const user = result.user;

        const name = user.displayName;
        const email = user.email;
        const response = await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/auth/login",{name,email}, {withCredentials:true});
        console.log(response);
        if(response.data.status === "success")
          navigate("/");

        
    }catch(err){
       console.log("Error in Authorisation" , err);
    }
  }
  return (
    <div className='min-h-screen flex justify-center items-center bg-[#f1f1f1]'>
      <motion.div  initial={{ opacity:0 , y:-80}} animate={{opacity:1 , y:0}} transition={{duration:0.6, ease:easeOut}} className=' transition-all bg-white rounded-4xl z-10 border-gray-100 border-2 shadow-3xl shadow-gray-200 flex flex-col justify-center items-center gap-6'>
        <div className='flex justify-center pt-6 items-center w-full gap-4'>
          <BsRobot className='bg-black text-white p-1 rounded-md' size={28} />
          <p className='text-lg font-semibold'>AI Entrevista</p>
        </div>
        <div className='flex flex-col gap-1'>
        <h2 className='text-center text-2xl font-bold'>Continue With</h2>
        <div className='flex gap-1 p-1 bg-green-200 rounded-full items-center justify-center'>
          <IoSparkles size={18} className='text-green-600'/>
          <h2 className='text-center text-2xl font-bold px-1 text-green-600'>AI Smart Interview</h2>
          </div>
        </div>
        <div className='flex flex-wrap text-center w-3/4'>
        <p className='text-center'>Sign in to start AI-powered mock interviews track your progress , and unlock detailed performance insights.</p>
        </div>
        <motion.button onClick={handleGoogleAuth} whileHover={{opacity:0.8 , scale:1.06}} whileTap={{scale:0.96}} className='flex justify-center items-center gap-2 bg-black text-white rounded-full px-6 py-2 mb-6 cursor-pointer'>
          <FcGoogle />
          Sign In With Google
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Auth
import React, { use, useState } from 'react';
import { BsRobot } from "react-icons/bs";
import { AiTwotoneDollarCircle } from "react-icons/ai";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { FaHistory } from "react-icons/fa";
import { CiPlay1 } from "react-icons/ci";
import axios from 'axios';
import {motion} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const {userData} = useSelector((state)=>state.user);
    const [showCreditPopUp, setshowCreditPopUp] = useState(false)
    const [showProfilePopUP, setshowProfilePopUP] = useState(false)
    const navigate = useNavigate();
    const handleLogOut = async() =>{
       await axios.get(import.meta.env.VITE_BACKEND_URL+"/api/auth/logout",{withCredentials:true});
       navigate('/login');
    }
  return (
    <motion.div initial={{y:-40}} animate={{y:0}} transition={{duration:0.8}} className='w-[70%] flex justify-between py-4 my-6 bg-white rounded-2xl border-2 border-gray-200 z-10'>
        <div className="logo flex gap-4 items-center px-8">
            <BsRobot size={30} className='p-2 rounded-md text-white bg-black'/>
            <p className='text-lg font-semibold hidden md:block'>AI ENTREVISTA</p>
        </div>
        <div className=' relative flex items-center gap-4 px-8'>
            <div onClick={()=>{setshowCreditPopUp(!showCreditPopUp);setshowProfilePopUP(false)}} className=" credits flex items-center gap-1 rounded-full bg-gray-300 p-2 cursor-pointer">
             <AiTwotoneDollarCircle/>
             <p>{userData?.credits}</p>
            </div>
            {showCreditPopUp && <div className="credit-popup gap-2 absolute bg-white p-4 rounded-lg top-15 -left-20 min-w-40 flex flex-col justify-center items-center">
                <p>Need some more credits?</p>
                <button onClick={()=>navigate('/pricing')} className='bg-black px-4 py-2 text-white rounded-lg cursor-pointer'>Buy more Credits</button>
            </div>}
            <div onClick={()=>{setshowProfilePopUP(!showProfilePopUP);setshowCreditPopUp(false)}} className=" relative profile rounded-full bg-black text-white font-semi-bold cursor-pointer h-10 w-10 flex items-center justify-center">
                {userData?.name?.slice(0,1)}
            </div>
     {showProfilePopUP && <div className='absolute top-15 left-0 bg-white min-w-40'>
                  <div className='flex flex-col gap-2 p-4'>
                        <Link to={'/interview'} className='flex gap-1 items-center'><CiPlay1/>Start Interview</Link>
                        <Link to={'/history'} className='flex gap-1 items-center'><FaHistory/>Interview History</Link>
                        <p className='flex gap-1 text-red-500  items-center cursor-pointer' onClick={handleLogOut}>
                           <RiLogoutCircleRLine/>
                           Logout 
                        </p>
                  </div>
            </div>}
        </div>
    </motion.div>
  )
}

export default Navbar
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {useDispatch} from 'react-redux';
import { setUserData } from '../redux/userSlice';
import Navbar from '../components/Navbar';
import { IoSparkles } from 'react-icons/io5';
import {motion} from 'framer-motion'
import { BsBarChart, BsClock,BsFileEarmarkText,BsMic, BsRobot } from 'react-icons/bs';
import evalImg from '../assets/images/ai-ans.png';
import hrImg from '../assets/images/HR.png';
import techImg from '../assets/images/tech.png';
import confidenceImg from '../assets/images/confi.png';
import creditImg from '../assets/images/credit.png';
import resumeImg from '../assets/images/resume.png';
import pdfImg from '../assets/images/pdf.png';
import analyticsImg from '../assets/images/history.png';

const Homepage = () => {
const [currentUser, setcurrentUser] = useState("")
const dispatch = useDispatch();
const navigate = useNavigate();
 useEffect(() => {
   const getCurrentUser = async()=>{
    try{
    const result = await axios.get(import.meta.env.VITE_BACKEND_URL+"/api/user/currentUser",{withCredentials:true});
    console.log(result);
    if(!result.data)
      navigate('/login');
   dispatch(setUserData(result.data))
   }catch(err){
    navigate('/login');
    dispatch(setUserData(null));
  }
}
  getCurrentUser();
 }, [])
 
  return (
    <div className='min-h-screen bg-[#f1f1f1] flex flex-col items-center'>
      <Navbar />
      <div className='flex flex-col items-center justify-center my-20'>
        <div className='flex flex-col justify-center items-center'>
          <div className='flex gap-2 items-center w-fit'>
            <span><IoSparkles className='text-green-500'/></span><span>AI powered Smart Interview Platform</span>
          </div>
          <div className='flex flex-col gap-1 mt-6 items-center '>
              <h2 className='font-bold text-3xl'>Practice Interviews with</h2>
              <h2 className='font-bold text-3xl bg-green-100 text-green-500 px-4 py-2 flex items-center justify-center rounded-full w-fit'>AI Intelligence</h2>
          </div>
          <div className='mt-4 flex items-center flex-wrap max-w-[50%] text-center'>
            Role-based mock interviews with smart follow-ups adaptive difficulty and real-time performance evaluation.
          </div>
          <div className="buttons flex items-center gap-4 mt-6">
               <motion.button onClick={()=>{navigate('/interview')}} whileHover={{scale:1.04, opacity:0.8}} whileTap={{scale:0.96}} className='bg-black text-white px-6 py-2 rounded-full cursor-pointer'>Start Interview</motion.button>
               <motion.button onClick={()=>{navigate('/history')}} whileHover={{scale:1.04 , opacity:0.8}} whileTap={{scale:0.96}} className='bg-gray-200 text-black px-6 py-2 rounded-full cursor-pointer'>View History</motion.button>
          </div>
        </div>
        <div className='flex gap-10 items-center mt-20 flex-col md:flex-row'>
           {
            [
              {
                icon:<BsRobot size={24}/>,
                step:"Step 1",
                type:"Role and Experience Selection",
                description:"Ai adjusts difficulty based on selected job role"
              },
              {
                icon:<BsMic size={24}/>,
                step:"Step 2",
                type:"Smart Voice Interview",
                description:"Dynamic follow-up questions based on your answers"
              },
              {
                icon:<BsClock size={24}/>,
                step:"Step 3",
                type:"Time based Simulation",
                description:"Real Interview Pressure with time tracking"
              }
            ].map((item,index)=>{
              return <motion.div initial={{opacity:0 , x:-60}} whileInView={{opacity:1 , x:0}} transition={{duration: 0.1 + index*0.2}} whileHover={{rotate:0 , scale:1.06}}  key={index} className={`${index===0?" md:-rotate-3":""} ${index===1?"md:rotate-3":""} ${index===2?"md:-rotate-4":""} transition-all relative flex flex-col gap-4 shadow-2xl shadow-gray-300 bg-[#f3f3f3] rounded-lg items-center p-4 hover:ring-2 ring-green-500`}>
                   <div className='absolute ring-2 ring-green-500 text-green-500 p-3 -top-6 bg-white rounded-lg'>{item.icon}</div>
                   <div className="step font-semibold text-md text-green-500 mt-6">{item.step}</div>
                   <div className="type font-semibold text-lg">{item.type}</div>
                   <div className="desc max-w-80 text-center">{item.description}</div>
              </motion.div>
            })
           }
        </div>
        <div className="capabilities px-4 md:px-0 mt-20 flex flex-col items-center justify-center">
            <motion.div initial={{opacity:0 , y:40}} whileInView={{opacity:1 , y:0}} transition={{duration:0.4}} className='flex gap-2'><h2 className='font-bold text-2xl'>Advanced AI</h2><h2 className='font-bold text-2xl text-green-500'>Capabilites</h2></motion.div>
            <div className='grid md:grid-cols-2 gap-10 md:mx-60'>
                {
                  [
                    {
                      image:evalImg,
                      icon:<BsBarChart size={20}/>,
                      title:"AI Answer Evaluation",
                      desc:"Scores Communication, technical accuracy and confidence."
                    },
                    {
                      image:resumeImg,
                      icon:<BsFileEarmarkText size={20}/>,
                      title:"Resume Based Interview",
                      desc:"Project-specific questions based on uploaded resume."
                    },
                    {
                      image:pdfImg,
                      icon:<BsFileEarmarkText size={20}/>,
                      title:"Downloadable Pdf Report",
                      desc:"Detailed strengths , weakness and improvement insights."
                    },
                    {
                      image:evalImg,
                      icon:<BsBarChart size={20}/>,
                      title:"History and Analytics",
                      desc:"Tack progress with performance graphs and topic analysis."
                    }                   
                  ].map((item, index)=>{
                    return <motion.div key={index} whileHover={{scale:1.06}} className='flex  border-gray-100 gap-1 max-h-60 rounded-2xl shadow-2xl shadow-gray-200'>
                          <div className='w-1/2'>
                          <img className="object-contain max-h-60" src={item.image} alt="No Image"/>
                          </div>
                          <div className='flex flex-col md:pt-12 md:gap-4 w-1/2'>
                             <div className="icon text-green-500 bg-green-100 p-2 w-fit rounded-lg">
                              {item.icon}
                             </div>
                             <div className="title">
                              <h2 className='font-bold text-lg text-center'>{item.title}</h2>
                             </div>
                             <div className="desc">
                              <p className='text-center text-sm text-gray-500'>{item.desc}</p>
                             </div>
                          </div>
                    </motion.div>
                  })
                }
            </div>
        </div>
        <div className="capabilities px-4 mt-20 flex flex-col items-center justify-center">
            <motion.div initial={{opacity:0 , y:40}} whileInView={{opacity:1 , y:0}} transition={{duration:0.4}} className='flex gap-2'><h2 className='font-bold text-2xl'>Multiple Interview <span className='text-green-500'>Modes</span></h2></motion.div>
            <div className='grid md:grid-cols-2 gap-10 md:mx-60 mt-20'>
                {
                  [
                    {
                      image:hrImg,
                      title:"HR Interview Mode",
                      desc:"Behavioral and Communication based evaluation."
                    },
                    {
                      image:techImg,
                      title:"Technical Mode",
                      desc:"Deep Technical questioning based on selected role."
                    },
                    {
                      image:confidenceImg,
                      title:"Confidence Detection",
                      desc:"Basic tone and voice analysis insights."
                    },
                    {
                      image:creditImg,
                      title:"Credits System",
                      desc:"Unlock premium interview sessions easily."
                    }                   
                  ].map((item, index)=>{
                    return <motion.div key={index} whileHover={{scale:1.06}} className='flex rounded-2xl shadow-2xl items-center justify-between shadow-gray-300 '>
                            <div className='p-6 w-3/4'>
                              <h2 className='text-lg font-bold'>{item.title}</h2>
                              <p className=' text-sm text-gray-500'>{item.desc}</p>
                            </div>
                            <div className='pr-4'>
                              <img className='size-14' src={item.image} alt="No Image" />
                            </div>
                    </motion.div>
                  })
                }
            </div>
        </div>
      </div>
    </div>
  )
}

export default Homepage
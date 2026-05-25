import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const InterviewHistory = () => {

    const [interviews, setinterviews] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        const getInterviews = async () => {
            try {
                const result = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/interview/interview-history", { withCredentials: true });
                setinterviews(result.data);
            } catch (err) {
                console.log(err);
            }
        }
        getInterviews();
    }, [])

    const handleBack = ()=>{
        navigate("/")
    }

    const showReport = (interviewId)=>{
        navigate('/report/'+interviewId);

    }

    return (
        <div className=' sm:p-10 px-10 py-5 md:px-40 md:py-20 bg-linear-to-br from-green-50 to-green-100 min-h-screen'>
            <div className='heading space-y-5'>
                <div className="top flex gap-5  items-center">
                    <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleBack} className=" cursor-pointer arrow p-2 bg-white rounded-full">
                        <FaArrowLeft className='p-0.5' size={20} />
                    </motion.button>
                    <div className="heading-name flex flex-col">
                        <h2 className='font-bold text-xl'>Interview History</h2>
                        <p className='text-sm'>Track your past interviews and performance reports.</p>
                    </div>
                </div>
                <div className="bottom">

                </div>
            </div>
            <div className="interviews">
                <div className="interview-collection flex flex-col gap-4">
                    {interviews.map((interview, index) => {
                        return <motion.div onClick={()=>{showReport(interview._id)}} whileTap={{scale:0.96}} whileHover={{ scale: 1.02 }} key={interview._id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className='cursor-pointer md:p-4 px-6 py-3 gap-5 bg-white rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-gray-300 border-2 border-gray-100'>
                            <div className="role flex flex-row md:flex-col px-1 md:px-0 md:w-fit  justify-between w-full">
                                <div className="roleshow">
                                    <h3 className='font-bold text-sm md:text-lg '>{interview.role}</h3>
                                </div>
                                <div className="experience">
                                    <p className=' text-sm md:text-md'>{interview.experience}</p>
                                </div>
                                <div className="createdAt">
                                    <p className='text-sm text-gray-300'>{new Date(interview.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className='flex justify-between w-full md:w-fit  md:gap-4'>
                                <div className="score flex flex-col">
                                    <div className="scoreshow text-lg text-green-500">{interview.finalScore}/10</div>
                                    <p className='text-sm text-gray-400 font-normal'>Overall</p>
                                </div>
                                <div className={`status rounded-full text-xs flex items-center ${interview.status === "Completed" ? "bg-green-300 text-green-700" : "bg-yellow-200 text-yellow-700"} py-0.5 px-4 font-semibold`}>
                                    <p className='flex items-center'>{interview.status}</p>
                                </div>
                            </div>
                        </motion.div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default InterviewHistory
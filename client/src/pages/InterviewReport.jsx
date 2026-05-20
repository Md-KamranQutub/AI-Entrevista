import axios from 'axios';
import React, {useState, useEffect } from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { useParams } from 'react-router-dom'
import Step3 from '../components/Step3';

const InterviewReport = () => {
  const {interviewId} = useParams();
  const [interview , setInterview] = useState("");
  useEffect(() => {
    const getInterview = async()=>{
      try{
      const result = await axios.get(import.meta.env.VITE_BACKEND_URL+`/api/interview/interview-report/${interviewId}`,{withCredentials:true});
       setInterview(result.data);
      }catch(err){
        console.log(err);
      }
    }
    getInterview();
  }, [])
  
  return (
    <div className='min-h-screen bg-linear-to-br from-green-50 to-green-100'>
        <Step3 report={interview}/>
    </div>
  )
}

export default InterviewReport
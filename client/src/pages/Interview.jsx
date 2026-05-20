import React, { useState } from 'react'
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';

const Interview = () => {
  const [step , setStep] = useState(1);
  const [interviewData , setInerviewData] = useState(null);
  return (
  <div className={`min-h-screen flex justify-center items-center ${step === 2 ? "bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950" : ""}`}>
      {step === 1 && <Step1 onStart={(data)=>{setInerviewData(data); setStep(2)}}/>}
      {step === 2 && <Step2 interviewData={interviewData} onFinish={(report)=>{setInerviewData(report);setStep(3);}}/>}
      {step === 3 && <Step3  report={interviewData}/>}
  </div>
  )
}

export default Interview
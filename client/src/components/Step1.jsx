import React, { useState } from "react";
import {
  FaBriefcase,
  FaFile,
  FaFileUpload,
  FaMicrophoneAlt,
  FaUserTie,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch , useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Step1 = ({ onStart }) => {
  const {userData} = useSelector((state)=>state.user);
  const dispatch = useDispatch();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical Interview");
  const [resumeFile, setResumefile] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading , setLoading] = useState(false);
  const [resumeText ,setResumeText] = useState("");
  const handleStart = async () => {
    try{
      setLoading(true); 
      // const formData = new FormData();
      // formData.append("role" , role);
      // formData.append("experience" , experience);
      // formData.append("mode" , mode);
      // formData.append("resumeText" , resumeText);
      // formData.append("projects" , projects);
      // formData.append("skills" , skills);
      const response = await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/interview/get-questions",{role  , experience , mode, projects , skills,resumeText},{withCredentials:true});
      dispatch(setUserData({...userData,credits: response.data.creditsLeft}));
      onStart(response.data);
      setLoading(false);
    }catch(err){
       console.log(err);
       setLoading(false);
    }
  };
  const handleResumeAnalysis = async () => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('resume' , resumeFile);
      const result = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/interview/resume", formData,
        { withCredentials: true },
      );
      if (result?.data && result.status === 200) {
        setRole(result?.data?.role);
        setExperience(result.data?.experience);
        setProjects(result.data?.projects);
        setSkills(result.data?.skills);
        setResumeText(result.data?.resumeText);
        setAnalysisDone(true);
      }
      setAnalyzing(false);
    } catch (error) {
      console.error("Error in analyzing resume", error);
      setAnalyzing(false);
    }
  };
  return (
    <div className="md:w-3/4 flex  md:my-20 flex-col md:flex-row  rounded-2xl border-2  border-gray-100 shadow-3xl shadow-gray-300">
      <div className="bg-green-100 px-10 py-12 md:w-1/2">
        <h2 className="font-bold text-3xl py-4">Start Your AI Interview</h2>
        <p className="text-sm  py-4">
          Practice real interview scenarios powered by AI. Improve
          communication, technical skills and confidence.
        </p>
        <div className="flex gap-2 bg-white p-3 rounded-md items-center my-4">
          <FaUserTie className="text-green-500" size={18} />
          <p className="font-semibold text-md">Choose Role and Experience</p>
        </div>
        <div className="flex gap-2 bg-white p-3 rounded-md items-center my-4">
          <FaMicrophoneAlt className="text-green-500" size={18} />
          <p className="font-semibold text-md">Smart Voice Interview</p>
        </div>
      </div>
      <div className="bg-white px-10 md:w-1/2 flex flex-col md:px-10 py-6 gap-8 focus:border-2 border-green-500">
        <h2 className="text-3xl font-bold">Interview Setup</h2>
        <div className="flex gap-2 p-3 items-center ring-green-500 focus-within:ring-2 rounded-lg">
          <FaUserTie className="text-gray-400" size={18} />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            type="text"
            placeholder="Enter role"
            className="outline-none w-full"
          />
        </div>
        <div className="flex gap-2 p-3 items-center ring-green-500 focus-within:ring-2 rounded-lg">
          <FaBriefcase className="text-gray-400" size={18} />
          <input
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            type="text"
            placeholder="Experience (e.g. 2)"
            className="outline-none w-full"
          />
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          name=""
          id=""
          className="outline-none p-3 ring-green-500 focus-within:ring-2 rounded-lg"
        >
          <option value="Technical Interview">Technical Interview</option>
          <option value="HR Interview">HR Interview</option>
        </select>
        {!analysisDone && <div
          className="cursor-pointer border-2 border-green-500 rounded-lg p-6 border-dashed flex flex-col justify-center items-center gap-2"
          onClick={() => {
            !resumeFile && document.getElementById("resume").click();
          }}
        >
          {resumeFile ? (
            <FaFile className="text-green-500" size={40} />
          ) : (
            <FaFileUpload className="text-green-500 " size={40} />
          )}
          <p className="text-sm">
            {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
          </p>
         {!resumeFile && <input
            onChange={(e) => setResumefile(e.target.files[0])}
            type="file"
            accept=".pdf"
            name="resume"
            id="resume"
            className="hidden"
          />}
          {resumeFile && (
            <motion.button
              onClick={handleResumeAnalysis}
              className="p-2 text-white bg-black rounded-md cursor-pointer"
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </motion.button>
          )}
        </div>}
        {analysisDone && <div
          className=" border-2 border-green-500 rounded-lg p-6 border-dashed space-y-3">
            <ul className="text-lg font-semibold list-disc">Projects:</ul>
             {projects.map((project,ind)=>{
                return<li key={ind}>{project}</li>
             })}
             <div className="text-lg font-semibold flex flex-wrap gap-3">Skills:
             {skills.map((skill,ind)=>{
                return <span className="bg-green-200 px-2 py-1 rounded-full text-sm" key={ind}>{skill}</span>
             })}
             </div>
          </div>
        }
        <motion.button
          disabled={!role || !experience}
          onClick={handleStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className={`bg-black p-2 cursor-pointer rounded-full disabled:opacity-50 text-white ${loading?"opacity-70":"opacity-100"}`}
        >
          {loading?"Starting...":"Start Interview"}
        </motion.button>
      </div>
    </div>
  );
};

export default Step1;

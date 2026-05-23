import fs from 'fs'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { askAI } from '../services/openRouter.services.js';
import { parse } from 'path';
import { Interview } from '../models/interview.model.js';
import { time } from 'console';
import User from '../models/user.model.js';

export const analyzeResume = async(req,res)=>{
    try{
    if(!req.file)
        return res.status(400).json("Resume file required");

    const filePath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filePath);
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjs.getDocument({data:uint8Array}).promise;
    let resumeText = "";
    for( let pageNum = 1 ; pageNum <= pdf.numPages ; pageNum++ ){
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map(item=>item.str).join(" ");
        resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g," ").trim();
    const messages = [
        {
            role:"system",
            content:`
            Extract structured data from resume given to you.
            Do not use symbol \` or any other symbol which will give error on using JSON.parse.
            Return strictly JSON.
            {
               "role":"string",
               "experience":"string",
               "projects":["projects1","projects2"],
               "skills":["skill1","skil2"]
            }
            `
        },
        {
            role:"user",
            content:resumeText
        }
    ];

    const aiResponse = await askAI(messages);
    if(!aiResponse)
       return res.status(401).json({message:"Did not get Any AI Response"})
    const parsedResponse = JSON.parse(aiResponse);
    await fs.unlinkSync(filePath,(err)=>{
        if(err)
            console.log("Error in fileSync",err);
    });
    return res.json({
        role:parsedResponse.role,
        experience:parsedResponse.experience,
        projects:parsedResponse.projects,
        skills: parsedResponse.skills,
        resumeText
    })
}catch(error){
    console.error("Error in analyzing Resume",error);
    if(req.file && fs.existsSync(req.file.path)){
       await fs.unlink(req.file.path,(err)=>{
        if(err)
        console.log(err);
       });
    }
    return res.status(500).json({message:error.message});
}
}

export const generateQuestions = async(req, res)=>{
    try{
    const {role , experience , mode , projects , skills, resumeText} = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);
    if(user.credits < 50){
        return res.status(402).json("Not Enough Credits");
    }
    const projectText = Array.isArray(projects) && projects.length > 0 ? projects.join(" ") : "None";
    const skillText = Array.isArray(skills) && skills.length > 0 ? skills.join(" ") : "None";
    const safeResume = resumeText?.trim() || "None";
    const userPrompt = `
    Role:${role}
    Experience:${experience}
    Interview Mode : ${mode}
    Projects: ${projectText}
    Skills: ${skillText}
    Resume: ${safeResume}
    `;
    const messages = [
        {
            role:"system",
            content:`You are a real human interviewer conducting a professional interview.
            Speak in simple, natural English as if you are directly talking to the candidate.
            Generate exactly 10 interview questions.
            Strict Rules:
            - Each question must have no of words in between 15 and 25.
            - Each question must be a single complete sentence.
            - Do not Number them.
            - Do not add explanations.
            - Do not add extra text before or after.
            - One question per line only.
            - Keep language simple and conversational.
            - Questions must feel practical and realistic.

            Difficulty progression:
            First 3 Questions easy Next 4 Questions mediocre and the last 3 questions of hard difficulty.

            Make questions based on the candidate's role , experience, projects, skills and resume details.
            `
        },
        {
            role:"user",
            content:userPrompt
        }
    ]

    const aiResponse = await askAI(messages);
    if(!aiResponse)
        return res.status(400).json("Empty Ai response");
    const questionArray = aiResponse.split("\n").map(q => q.trim()).filter(q=>q.length > 0).slice(0,10);
    if(questionArray.length === 0 )
    {
        return res.status(500).json({
            message: "AI failed to generate questions"
        })
    }
    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
        userId,
        role,
        experience,
        mode,
        resumeText:safeResume,
        questions:questionArray.map((q,index)=>({
            question:q,
            difficulty: ["easy","easy","easy","moderate","moderate","moderate","moderate","hard","hard","hard"][index],
            timeLimit: [60,60,60,90,90,90,90,120,120,120][index],
        }))
    })
    return res.status(200).json({
      interviewId:interview._id,
      creditsLeft:user.credits,
      userName:user.name,
      questions:interview.questions
    });
}catch(err){
    console.log(err);
    return res.status(500).json({message:err.message});
}
}

export const acceptAnswer = async(req,res)=>{
    try{
    const {answer , interviewId , questionIndex , timeTaken} = req.body;
    const interview = await Interview.findById(interviewId);
    const question = interview.questions[questionIndex];
    if(!answer || !answer.trim()){
        question.answer = "";
        question.feedback = "You did not submit any answer";
        await interview.save();
        return res.status(200).json({feedback:question.feedback});
    }

    if(question.timeLimit <= timeTaken){
        question.answer = "";
        question.feedback = "Time limit exceeded";
        await interview.save();
        return res.status(200).json({feedback:question.feedback});
    }
    const messages = [
        {
           role:"system",
           content:`You are a professional interviewer evaluating a candidates answer in a real interview.

           Evaluate naturally and fairly , like a fair person would.

           Score the answer in theses areas (0 to 10):
           1.Confidence - Does the answer sound clear, confident , and well presented?
           2.Communication - Is the language simple, clear and easy to understand?
           3.Correctness -  Is the answer accurate , relevant, and complete?

           Rules: 
           - Be realistic and unbiased. 
           - Do not give random high socres.
           - If the answer is weak , score low.
           - If the answer is strong and detailed , score high.
           - Consider clarity , structure and relevance.

           Calculate :
           finalScore = average of confidence , communication and correctness (rounded off to the nearest whole number).

           Feeback Rules:
           - Write natural human feedback.
           - 10 to 15 words only.
           - Sound like real interview feedback.
           - Can suggest improvement if needed.
           - Do not repeat the question.
           - Do not explain scoring.
           - Keep tone professional and honest.

           Return only valid json in this format

           {
             "confidence" : number,
             "correctness" : number,
             "communication" : number,
             "finalScore" : number,
             "feedback" : "short human feedback"
           }
           `
        },
        {
            role:"user",
            content:`
            Question : ${question.question}
            Answer: ${answer}
            `
        }
        ]

        const aiResponse = await askAI(messages);
        const parsedResponse = JSON.parse(aiResponse);

        question.answer = parsedResponse.answer;
        question.confidence = parsedResponse.confidence;
        question.communication = parsedResponse.communication;
        question.correctness = parsedResponse.correctness;
        question.score = parsedResponse.finalScore;
        question.feedback = parsedResponse.feedback;

        await interview.save();

        return res.status(200).json({feedback : parsedResponse.feedback})
    }catch(err){
        console.log(err);
      return res.status(500).json({message:err.message})
    }
}

export const getReport = async(req,res)=>{
    try {
        const {interviewId} = req.body
        const interview = await Interview.findById(interviewId);
        const questions = interview.questions;
        let totalScore = 0;
        let communicationScore = 0;
        let confidenceScore = 0;
        let correctnessScore = 0;
        questions.forEach(q=>{
            totalScore += q.score;
            communicationScore += q.communication
            confidenceScore += q.confidence
            correctnessScore += q.correctness
        });
        
        const finalScore = totalScore/10;
        const avgCommunication = communicationScore/10;
        const avgConfidence = confidenceScore/10;
        const avgCorrectness = correctnessScore/10;

        interview.finalScore = finalScore;
        interview.status = "Completed";
        await interview.save();

        return res.status(200).json({
            id: interview._id,
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q)=>({
                question: q.question,
                score: q.score,
                feedback: q.feedback,
                confidence:q.confidence,
                communication:q.communication,
                correctness:q.correctness
            }))
        })
    } catch (error) {
        return res.status(200).json({message:`Failed to complete Interview ${error.message}`})   
    }
}

export const getInterviewHistory = async(req,res)=>{
    try{
    const userId = req.userId;
    const interviewData = await Interview.find({userId}).sort({createdAt:-1}).select(" role experience mode finalScore status createdAt");
    return res.status(200).json(interviewData);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Error occured in getting history"});
    }
}

export const getInterviewReport = async(req, res)=>{
    try{
        const interview = await Interview.findById(req.params.id);
        if(!interview)
            return res.status(404).json({message:"Interview not found in your database"});
        
        const questions = interview.questions;
      
        let communicationScore = 0;
        let confidenceScore = 0;
        let correctnessScore = 0;

        questions.forEach(q=>{
            communicationScore += q.score
            confidenceScore += q.score
            correctnessScore += q.score
        });

        const avgCommunication = communicationScore/10;
        const avgConfidence = confidenceScore/10;
        const avgCorrectness = correctnessScore/10;

        return res.status(200).json({
            finalScore: interview.finalScore,
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        })
    }catch(err){
        console.log(err);
        res.status(500).json({message:`Error in getting Report ${err}`});
    }
}
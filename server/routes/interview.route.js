import express from 'express'
import { upload } from '../middlewares/multer.js';
import { acceptAnswer, analyzeResume, generateQuestions, getInterviewHistory, getInterviewReport, getReport } from '../controllers/interview.controller.js';
import {isAuthorised} from '../middlewares/checkAuth.middleware.js'

const interviewRouter = express.Router();

interviewRouter.post('/resume' ,isAuthorised, upload.single("resume"), analyzeResume);
interviewRouter.post('/get-questions' ,isAuthorised, generateQuestions);
interviewRouter.post('/submit-answer', isAuthorised, acceptAnswer);
interviewRouter.post('/report' ,isAuthorised, getReport);
interviewRouter.get('/interview-history' , isAuthorised , getInterviewHistory);
interviewRouter.get('/interview-report/:id', isAuthorised, getInterviewReport);


export default interviewRouter;
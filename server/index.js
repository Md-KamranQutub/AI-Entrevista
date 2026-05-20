import express from 'express';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import connectDb from './config/connectDb.js';
import dns from 'node:dns/promises'
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
import paymentRouter from './routes/payment.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials:true,
}

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

//routes
app.use('/api/auth' , authRouter);
app.use('/api/user' , userRouter);
app.use('/api/interview' , interviewRouter);
app.use('/api/payment',paymentRouter);

app.listen(PORT, ()=>{
    console.log("App listening on port ", PORT);
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    connectDb();
})
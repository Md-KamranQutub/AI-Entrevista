import express from 'express'
import { isAuthorised } from '../middlewares/checkAuth.middleware.js';
import { getCurrentUser } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/currentUser' , isAuthorised , getCurrentUser);

export default userRouter;
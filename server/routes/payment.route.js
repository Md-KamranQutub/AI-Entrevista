import express from "express"
import { isAuthorised } from "../middlewares/checkAuth.middleware.js";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/order" , isAuthorised, createOrder);
paymentRouter.post("/verify-payment" , isAuthorised , verifyPayment)

export default paymentRouter
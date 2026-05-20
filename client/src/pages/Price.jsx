import React, { useState } from "react";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios'
import {useDispatch} from 'react-redux'
import { setUserData } from "../redux/userSlice";

const Price = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("low cost");
  const [loadingPlan , setLoadingPlan] = useState(null);
  const dispatch = useDispatch();

  const handlePayment = async(plan)=>{
      try {
        setLoadingPlan(plan.id);
        const amount = plan.id ==="low cost" ? 20 : plan.id === "basic" ? 100 : 500;
        const result = await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/payment/order",{
          planId:plan.id,
          amount:amount,
          credits:plan.credits,
        },{withCredentials:true})
     
        const options = {
          key: import.meta.env.VITE_RAZORPAY_API_KEY,
          amount: result.data.amount,
          currency: "INR",
          name: "AI ENTREVISTA",
          descripton: `${plan.name} - ${plan.credits} Credits`,
          order_id : result.data.id,

          handler: async function(response){
            const verifiedPayment = await axios.post(import.meta.env.VITE_BACKEND_URL+"/api/payment/verify-payment",response,{withCredentials:true}) 
            dispatch(setUserData(verifiedPayment.data.user));

            alert("Payment Succesfull!");
          },
          theme:{
            color:"#10b981"
          },
        } 
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoadingPlan(null);
      } catch (err) {
        console.log(err);
        setLoadingPlan("");
      }
  }

  const plans = [
    {
      id: "low cost",
      name: "Low Cost",
      price: "₹20",
      credits: 100,
      descripton: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 600,
      descripton: "Great For Focused Practise and skill development.",
      features: [
        "600 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 4000,
      descripton: "Best value for serious job preparation.",
      features: [
        "4000 AI Interview Credits",
        "Advanced AI capabilities",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-16 px-6">
      <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
        <button
          onClick={()=>navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => {
               setSelectedPlan(plan.id);
              }}
              className={`relative rounded-3xl p-8 transition-all duration-300 border cursor-pointer
                ${isSelected ?"border-emerald-500 shadow-2xl bg-white":"border-gray-200 bg-white shadow-md"}
                `}
            >
              {plan.badge && (
                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                    {plan.badge}
                </div>
              )}
              {plan.default && (
                <div className="absolute top-6 right-6 text-black bg-gray-200  text-xs px-3 py-1 rounded-full ">
                  Low Cost
                </div>
              )}
              {/* plan name */}
              <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">{plan.price}</span>
                <p className="text-gray-500 mt-1">{plan.credits} Credits</p>
              </div>

              <p className="text-gray-500 mt-4 text-sm leading-relaxed">{plan.descripton}</p>

              {/* Features */}
              <div className="mt-6 space-y-3 text-left">
                {plan.features.map((feature , i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm"/>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button disabled={loadingPlan} onClick={(e)=>{setSelectedPlan(plan.id);handlePayment(plan)}} className={`disabled:opacity-50 w-full mt-8 py-3 cursor-pointer rounded-xl font-semibold transition ${isSelected ? "bg-emerald-600 text-white hover:opacity-90":"bg-gray-100 text-gray-700 hover:bg-emerald-50"}`}>
                     {isSelected ? "Proceed to Pay" :"Select Plan"}
              </button>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Price;

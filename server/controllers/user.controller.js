import User from "../models/user.model.js";

export const getCurrentUser = async(req,res)=>{
    try{
    const userId = req.userId;
    console.log(userId);
    if(!userId)
        return res.status(400).json({message:"Not Authorised"});
    
    const user = await User.findById(userId);
    if(!user)
        return res.status(404).json({message:"User Not Found"});

    return res.status(200).json(user);

    }catch(err){
    
    }
}
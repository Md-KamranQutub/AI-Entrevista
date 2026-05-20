import User from '../models/user.model.js'
import generateToken from '../config/token.js'

export const googleAuth = async(req,res)=>{
  try{
    const {name, email} = req.body;
    let user = await User.findOne({email});
    if(!user){
        user = await User.create({
            name,
            email
        })
    }
    const token = await generateToken(user._id);

    res.cookie("token" , token,{
        http:true,
        secure:true,
        sameSite:'none',
        maxAge:7*24*60*60*1000
    });
    return res.status(200).json({message:"Token generated succesfully" , status:"success"});

  }catch(err){
    console.log(err);
    return res.status(500).json({message:`Google Auth Error ${err}` , status:"failed"})
  }
}

export const logOut = async(req,res)=>{
    try{
       await res.clearCookie("token");
       return res.status(200).json({message:"Logged Out Succesfully"});
    }catch(err){
       return res.status(500).json({message:"Error in logging out" , err});
    }
}
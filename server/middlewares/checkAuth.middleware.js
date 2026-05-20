import jwt from 'jsonwebtoken';

export const isAuthorised = async(req,res,next) =>{
    try{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Not Authorised"});
    }
    const verifiedToken = await jwt.verify(token , process.env.JWT_SECRET);
    if(!verifiedToken){
        return res.status(401).json({message:"Not a verified User"});
    }
    req.userId = verifiedToken.userId;
    next();
    }catch(err){
       console.log("Error in Auth middleware" , err);
    }
}
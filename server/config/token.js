import jwt from 'jsonwebtoken';

const generateToken = async(userId)=>{
    try{
        const token = jwt.sign({userId} , process.env.JWT_SECRET , {expiresIn:'7d'});
        return token;
    }catch(err){
        console.error("Error in token genretion", err);
    }
}

export default generateToken;
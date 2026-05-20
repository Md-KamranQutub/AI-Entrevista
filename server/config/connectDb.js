import mongoose, { mongo } from "mongoose";

const connectDb = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected..");
    }
    catch(err){
      console.log("Database Connection Error" , err);
    }
}

export default connectDb;
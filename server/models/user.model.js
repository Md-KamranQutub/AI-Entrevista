import {mongoose} from "mongoose";
import { Schema , model } from "mongoose";

const userSchema = new Schema({
name:{
   type: String,
   required: true
},
email:{
   type: String,
   required: true,
   unique: true
},
credits:{
   type: Number,
   default: 100
}


},{timestamps:true})

const User = mongoose.model('User' , userSchema);

export default User;
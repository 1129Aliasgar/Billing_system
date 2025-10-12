import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        required:true,
        enum:["admin", "user"]
    },
    password:{
        type:String,
        required:true
    },
})

export default mongoose.model("User", userSchema)
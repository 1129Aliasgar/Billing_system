import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    }
    catch(err){
        console.log(`Error connecting to MongoDB: ${err.message}`)
        process.exit(1)
    }
}

export default connectDB
import User from "./models/user.js"
import connectDB from "./config/db.js"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

dotenv.config()
await connectDB();

const seedUser = async () => {
    try{
        const hashedPassword = await bcrypt.hash("2667", 10)
        const user = await User.create({
        name: "mudar",
        email: "mudar.i.bootwala@gmail.com",
        role: "admin",
        password: hashedPassword
    })
    console.log(`User created: ${user.name}`)
    process.exit(0);
    }
    catch(err){
        console.log(`Error creating user: ${err.message}`)
        process.exit(1)
    }
};
seedUser();

import User from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        if (user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })
        res.status(200).json({ token, user })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

import mongoose from "mongoose"

const contactFormSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

export default mongoose.model("ContactForm", contactFormSchema)
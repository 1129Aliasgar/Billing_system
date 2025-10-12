import ContactForm from "../models/ContactForm.js"

export const createContactForm = async (req, res) => {
    try {
        const {name , email , message} = req.body

        const existingUser = await ContactForm.findOne({email})
        if(existingUser) {
            return res.status(400).json({ message: "Already submitted" })
        }

        const contactForm = await ContactForm.create({name , email , message})
        res.status(201).json(contactForm)

    }
    catch(err) {
        res.status(500).json({ message: err.message })
    }

}

export const getContactForms = async (req , res) => {
    try {
        const forms = await ContactForm.find().sort({ createdAt: -1 });
        res.status(200).json(forms)
    }
    catch(err) {
        res.status(500).json({ message: err.message })
    }
}
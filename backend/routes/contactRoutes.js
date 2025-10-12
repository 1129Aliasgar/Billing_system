import express from "express"
import { createContactForm, getContactForms } from "../controllers/contactController.js"

const router = express.Router()

router.post("/", createContactForm) ;
router.get("/", getContactForms) ;

export default router
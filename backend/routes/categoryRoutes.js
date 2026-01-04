import express from "express"
import { verifyToken } from "../middleware/authMiddleware.js"
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js"

const router = express.Router()

router.post("/create-category", verifyToken, createCategory)
router.get("/get-categories", getCategories)
router.get("/get-category/:id", verifyToken, getCategoryById)
router.put("/update-category/:id", verifyToken, updateCategory)
router.delete("/delete-category/:id", verifyToken, deleteCategory)

export default router


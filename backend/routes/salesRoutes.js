import express from "express"
import { verifyToken } from "../middleware/authMiddleware.js"
import {
  getSales,
  getSalesByProduct,
  getMonthlySales,
  getSalesSummary,
  getMonthlySalesByCategory
} from "../controllers/salesController.js"

const router = express.Router()

router.get("/get-sales", verifyToken, getSales)
router.get("/get-sales-by-product/:productId", verifyToken, getSalesByProduct)
router.get("/get-monthly-sales", verifyToken, getMonthlySales)
router.get("/get-sales-summary", verifyToken, getSalesSummary)
router.get("/get-monthly-sales-by-category", verifyToken, getMonthlySalesByCategory)

export default router


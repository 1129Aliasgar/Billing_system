import express from "express"
import { verifyToken } from "../middleware/authMiddleware.js"
import {
  createBill,
  getBills,
  getBillById,
  getBillByBillId,
  updatePayment,
  getDebitBills,
  updateBill,
  deleteBill
} from "../controllers/billingController.js"

const router = express.Router()

router.post("/create-bill", verifyToken, createBill)
router.get("/get-bills", verifyToken, getBills)
router.get("/get-bill/:id", verifyToken, getBillById)
router.get("/get-bill-by-billid/:billId", verifyToken, getBillByBillId)
router.put("/update-payment/:id", verifyToken, updatePayment)
router.put("/update-bill/:id", verifyToken, updateBill)
router.delete("/delete-bill/:id", verifyToken, deleteBill)
router.get("/get-debit-bills", verifyToken, getDebitBills)

export default router


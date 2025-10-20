import express from "express"
import { verifyToken } from "../middleware/authMiddleware.js" 
import { createProduct, getProducts, updateProduct, deleteProduct , getProductsByID } from "../controllers/productsController.js"

const router = express.Router()

router.post("/create-products", verifyToken , createProduct);
router.get("/get-products" , getProducts);
router.get("/get-product/:id" , getProductsByID)
router.put("/update-product/:id", verifyToken , updateProduct);
router.delete("/delete-product/:id", verifyToken , deleteProduct);

export default router;
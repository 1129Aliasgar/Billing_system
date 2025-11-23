import Billing from "../models/billing.js"
import Sales from "../models/sales.js"
import Product from "../models/product.js"

// CREATE Bill
export const createBill = async (req, res) => {
  try {
    const { customerName, vehicleNumber, delivery, buyerName, buyerAddress, buyerPhone, buyerGstNumber, items, gst, gstPercent, cgstSgst, isDebit, userPaid, userDue } = req.body

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" })
    }

    // Validate stock and calculate amounts
    let billAmount = 0
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    // First, validate all items and calculate bill amount
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` })
      }

      // Validate quantity against stock
      if (item.quantity > product.inStock) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.inStock}, Requested: ${item.quantity}` 
        })
      }

      // Calculate item total
      const itemTotal = item.price * item.quantity
      billAmount += itemTotal
    }

    // Calculate GST and total
    const gstAmount = gst && gstPercent ? (billAmount * gstPercent) / 100 : 0
    const totalAmount = billAmount + gstAmount

    // Determine user paid and due (use provided values or calculate)
    let finalUserPaid = userPaid !== undefined ? userPaid : (isDebit ? 0 : totalAmount)
    let finalUserDue = userDue !== undefined ? userDue : (isDebit ? totalAmount : 0)
    
    // Ensure values are valid
    if (finalUserPaid < 0) finalUserPaid = 0
    if (finalUserDue < 0) finalUserDue = 0
    if (finalUserPaid + finalUserDue !== totalAmount) {
      // Adjust to match total
      finalUserPaid = totalAmount - finalUserDue
      if (finalUserPaid < 0) {
        finalUserPaid = 0
        finalUserDue = totalAmount
      }
    }
    
    const status = finalUserDue > 0 ? "due" : "completed"

    // Create bill (this will generate billId via pre-save hook)
    const bill = await Billing.create({
      customerName: customerName || buyerName || "Customer",
      buyerName: buyerName || customerName || undefined,
      buyerAddress: buyerAddress || undefined,
      buyerPhone: buyerPhone || undefined,
      buyerGstNumber: buyerGstNumber || undefined,
      vehicleNumber: vehicleNumber || undefined,
      delivery: delivery || undefined,
      items,
      billAmount,
      userPaid: finalUserPaid,
      userDue: finalUserDue,
      gst: gst || false,
      gstPercent: gst ? (gstPercent || 0) : 0,
      cgstSgst: cgstSgst || false,
      totalAmount,
      isDebit: isDebit || finalUserDue > 0,
      status
    })

    // Now update stock and create sales records with billId
    for (const item of items) {
      const product = await Product.findById(item.productId)
      
      // Update product stock
      product.inStock -= item.quantity
      await product.save()

      // Create or update sales record with billId and bill MongoDB _id
      const salesFilter = { productId: item.productId, month, year }
      await Sales.findOneAndUpdate(
        salesFilter,
        { 
          $inc: { quantitySold: item.quantity },
          $set: { 
            billId: bill.billId,
            billObjectId: bill._id // Store MongoDB _id of the bill
          }
        },
        { upsert: true, new: true }
      )
    }

    return res.status(201).json({ 
      message: "Bill created successfully", 
      bill 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET All Bills
export const getBills = async (req, res) => {
  try {
    const { status, isDebit } = req.query
    let filter = {}

    if (status) {
      filter.status = status
    }
    if (isDebit !== undefined) {
      filter.isDebit = isDebit === "true"
    }

    const bills = await Billing.find(filter)
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 })

    return res.status(200).json({ 
      message: "Bills fetched successfully", 
      bills 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Bill by ID
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params
    const bill = await Billing.findById(id)
      .populate("items.productId", "name price inStock")

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" })
    }

    return res.status(200).json({ 
      message: "Bill found successfully", 
      bill 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Bill by billId
export const getBillByBillId = async (req, res) => {
  try {
    const { billId } = req.params
    const bill = await Billing.findOne({ billId })
      .populate("items.productId", "name price inStock")

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" })
    }

    return res.status(200).json({ 
      message: "Bill found successfully", 
      bill 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// UPDATE Payment (Add payment to debit bill)
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required" })
    }

    const bill = await Billing.findById(id)
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" })
    }

    // Calculate new payment
    const newPaid = bill.userPaid + amount
    const newDue = Math.max(0, bill.userDue - amount)

    // Update bill
    bill.userPaid = newPaid
    bill.userDue = newDue
    bill.isDebit = newDue > 0
    bill.status = newDue === 0 ? "completed" : "due"
    
    await bill.save()

    return res.status(200).json({ 
      message: "Payment updated successfully", 
      bill 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Debit Bills
export const getDebitBills = async (req, res) => {
  try {
    const bills = await Billing.find({ 
      $or: [{ isDebit: true }, { userDue: { $gt: 0 } }] 
    })
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 })

    return res.status(200).json({ 
      message: "Debit bills fetched successfully", 
      bills 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// UPDATE Bill
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params
    const { customerName, buyerName, buyerAddress, buyerPhone, buyerGstNumber, vehicleNumber, delivery } = req.body

    const bill = await Billing.findById(id)
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" })
    }

    // Update fields
    if (customerName !== undefined) {
      bill.customerName = customerName
    }
    if (buyerName !== undefined) {
      bill.buyerName = buyerName
    }
    if (buyerAddress !== undefined) {
      bill.buyerAddress = buyerAddress
    }
    if (buyerPhone !== undefined) {
      bill.buyerPhone = buyerPhone
    }
    if (buyerGstNumber !== undefined) {
      bill.buyerGstNumber = buyerGstNumber
    }
    if (vehicleNumber !== undefined) {
      bill.vehicleNumber = vehicleNumber
    }
    if (delivery !== undefined) {
      bill.delivery = delivery
    }

    await bill.save()

    return res.status(200).json({ 
      message: "Bill updated successfully", 
      bill 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// DELETE Bill
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params

    const bill = await Billing.findById(id)
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" })
    }

    // Note: We do NOT restore stock when deleting a bill
    // because the products were already sold and stock was already deducted
    // Deleting a bill is just removing the record, not reversing the sale

    // Remove sales records for this bill - use bill creation date
    for (const item of bill.items) {
      const billDate = new Date(bill.createdAt)
      const month = billDate.getMonth() + 1
      const year = billDate.getFullYear()
      
      // Find and update sales records that reference this bill
      await Sales.updateMany(
        { 
          productId: item.productId, 
          month, 
          year,
          billObjectId: bill._id 
        },
        { 
          $inc: { quantitySold: -item.quantity }
        }
      )
      
      // Also check by billId string in case billObjectId wasn't set
      await Sales.updateMany(
        { 
          productId: item.productId, 
          month, 
          year,
          billId: bill.billId 
        },
        { 
          $inc: { quantitySold: -item.quantity }
        }
      )
    }

    // Delete the bill
    await Billing.findByIdAndDelete(id)

    return res.status(200).json({ 
      message: "Bill deleted successfully" 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}


import Sales from "../models/sales.js"
import Product from "../models/product.js"
import Billing from "../models/billing.js"
import Category from "../models/category.js"

// GET All Sales (for admin analysis)
export const getSales = async (req, res) => {
  try {
    const { productId, month, year } = req.query
    let filter = {}

    if (productId) {
      filter.productId = productId
    }
    if (month) {
      filter.month = parseInt(month)
    }
    if (year) {
      filter.year = parseInt(year)
    }

    const sales = await Sales.find(filter)
      .populate("productId", "name price inStock")
      .sort({ year: -1, month: -1, createdAt: -1 })

    return res.status(200).json({ 
      message: "Sales fetched successfully", 
      sales 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Sales by Product
export const getSalesByProduct = async (req, res) => {
  try {
    const { productId } = req.params
    const sales = await Sales.find({ productId })
      .populate("productId", "name price inStock")
      .sort({ year: -1, month: -1 })

    return res.status(200).json({ 
      message: "Sales fetched successfully", 
      sales 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Monthly Sales Summary
export const getMonthlySales = async (req, res) => {
  try {
    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({ 
        message: "Month and year are required" 
      })
    }

    const sales = await Sales.find({ 
      month: parseInt(month), 
      year: parseInt(year) 
    })
      .populate("productId", "name price")
      .sort({ quantitySold: -1 })

    // Calculate total sales
    const totalSales = sales.reduce((sum, s) => sum + s.quantitySold, 0)

    return res.status(200).json({ 
      message: "Monthly sales fetched successfully", 
      month: parseInt(month),
      year: parseInt(year),
      totalSales,
      sales 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Sales Summary (for admin dashboard)
export const getSalesSummary = async (req, res) => {
  try {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Get current month sales
    const currentMonthSales = await Sales.find({
      month: currentMonth,
      year: currentYear
    }).populate("productId", "name price")

    // Get all products with their sales
    const products = await Product.find({ ISBillingAvailable: true })
    const salesData = []

    for (const product of products) {
      const productSales = await Sales.find({ productId: product._id })
        .sort({ year: -1, month: -1 })

      const totalSold = productSales.reduce((sum, s) => sum + s.quantitySold, 0)
      const currentMonthSale = productSales.find(
        s => s.month === currentMonth && s.year === currentYear
      )

      salesData.push({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          inStock: product.inStock
        },
        totalSold,
        currentMonthSold: currentMonthSale ? currentMonthSale.quantitySold : 0,
        salesHistory: productSales
      })
    }

    return res.status(200).json({ 
      message: "Sales summary fetched successfully", 
      summary: {
        currentMonth,
        currentYear,
        totalProducts: products.length,
        salesData
      }
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Monthly Sales by Category (from billing data)
export const getMonthlySalesByCategory = async (req, res) => {
  try {
    const { month, year } = req.query
    
    // Default to current month if not provided
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1
    const targetYear = year ? parseInt(year) : new Date().getFullYear()

    // Validate month and year
    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({ 
        message: "Invalid month. Must be between 1 and 12." 
      })
    }

    // Calculate date range for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1)
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999)

    // Get all bills for the specified month
    const bills = await Billing.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      status: { $in: ["completed", "due"] } // Only count completed or due bills
    }).populate("items.productId", "category") // Populate category field

    // Aggregate sales by category
    const categorySales = {}
    let totalRevenue = 0
    let totalItems = 0

    // Collect all unique product IDs to fetch in one query
    const productIds = new Set()
    for (const bill of bills) {
      for (const item of bill.items) {
        const productId = item.productId?._id || item.productId
        if (productId) productIds.add(productId)
      }
    }

    // Fetch all products at once
    const products = await Product.find({ _id: { $in: Array.from(productIds) } }).select("category")
    const productMap = new Map()
    products.forEach(p => productMap.set(p._id.toString(), p))

    for (const bill of bills) {
      for (const item of bill.items) {
        // item.productId might be ObjectId or already populated
        const productId = item.productId?._id || item.productId
        const product = productMap.get(productId?.toString() || productId)
        if (!product) continue

        // Use product category if it exists and is not empty
        // If category is empty/null/undefined, use "Uncategorized"
        // If category is "General" (default), still use it but it will be shown
        let category = product.category
        if (!category || (typeof category === 'string' && category.trim() === "")) {
          category = "Uncategorized"
        }

        const itemTotal = item.price * item.quantity

        if (!categorySales[category]) {
          categorySales[category] = {
            category,
            quantity: 0,
            revenue: 0,
            billCount: new Set()
          }
        }

        categorySales[category].quantity += item.quantity
        categorySales[category].revenue += itemTotal
        categorySales[category].billCount.add(bill._id.toString())

        totalRevenue += itemTotal
        totalItems += item.quantity
      }
    }

    // Convert to array and format
    const categoryData = Object.values(categorySales).map(cat => ({
      category: cat.category,
      quantity: cat.quantity,
      revenue: parseFloat(cat.revenue.toFixed(2)),
      billCount: cat.billCount.size
    })).sort((a, b) => b.quantity - a.quantity) // Sort by quantity descending

    // Get most sold category
    const mostSoldCategory = categoryData.length > 0 ? categoryData[0] : null

    return res.status(200).json({
      message: "Monthly sales by category fetched successfully",
      month: targetMonth,
      year: targetYear,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalItems,
      mostSoldCategory,
      categoryData,
      billCount: bills.length
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}


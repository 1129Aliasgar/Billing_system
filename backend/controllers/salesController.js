import Sales from "../models/sales.js"
import Product from "../models/product.js"

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


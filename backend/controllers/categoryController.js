import Category from "../models/category.js"

// CREATE Category
export const createCategory = async (req, res) => {
  try {
    const { name, displayName, description } = req.body

    if (!name || !displayName) {
      return res.status(400).json({ 
        message: "Name and display name are required" 
      })
    }

    // Normalize name to lowercase for uniqueness check
    const normalizedName = name.trim().toLowerCase()

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: normalizedName })
    if (existingCategory) {
      return res.status(400).json({ 
        message: "Category already exists" 
      })
    }

    const category = await Category.create({
      name: normalizedName,
      displayName: displayName.trim(),
      description: description || ""
    })

    return res.status(201).json({ 
      message: "Category created successfully", 
      category 
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Category already exists" 
      })
    }
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET All Categories
export const getCategories = async (req, res) => {
  try {
    const { activeOnly } = req.query
    let filter = {}
    
    if (activeOnly === 'true') {
      filter.isActive = true
    }

    const categories = await Category.find(filter)
      .sort({ displayName: 1 })

    return res.status(200).json({ 
      message: "Categories fetched successfully", 
      categories 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// GET Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findById(id)

    if (!category) {
      return res.status(404).json({ 
        message: "Category not found" 
      })
    }

    return res.status(200).json({ 
      message: "Category found successfully", 
      category 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// UPDATE Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { displayName, description, isActive } = req.body

    const updateData = {}
    if (displayName !== undefined) updateData.displayName = displayName.trim()
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!category) {
      return res.status(404).json({ 
        message: "Category not found" 
      })
    }

    return res.status(200).json({ 
      message: "Category updated successfully", 
      category 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// DELETE Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return res.status(404).json({ 
        message: "Category not found" 
      })
    }

    return res.status(200).json({ 
      message: "Category deleted successfully", 
      category 
    })
  } catch (err) {
    return res.status(500).json({ 
      message: "Something went wrong", 
      error: err.message 
    })
  }
}

// Helper function to get or create category (used by product controller)
export const getOrCreateCategory = async (categoryName) => {
  if (!categoryName || categoryName.trim() === "") {
    return null
  }

  try {
    const normalizedName = categoryName.trim().toLowerCase()
    
    // Try to find existing category
    let category = await Category.findOne({ name: normalizedName })
    
    // If not found, create it
    if (!category) {
      category = await Category.create({
        name: normalizedName,
        displayName: categoryName.trim(),
        description: ""
      })
    }
    
    return category
  } catch (err) {
    console.error("Error in getOrCreateCategory:", err)
    return null
  }
}


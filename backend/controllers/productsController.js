import Product from "../models/product.js"
import { getOrCreateCategory } from "./categoryController.js"

// CREATE Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, inStock, image, HSN_code, metadata , IsVisible , ISBillingAvailable, category } = req.body;

    // Auto-save category if provided
    let categoryName = category 
    if (category && category.trim() !== "") {
      await getOrCreateCategory(category)
      categoryName = category.trim()
    }

    const product = await Product.create({
      name,
      discription: description, // model field is 'discription'
      price,
      inStock,
      image,
      HSNC_code: HSN_code, // model field is 'HSNC_code'
      metadata: {
        colorvalues: metadata?.colorvalues ?? metadata?.color ?? [],
        sizevalues: metadata?.sizevalues ?? metadata?.size ?? [],
        brandvalues: metadata?.brandvalues ?? metadata?.brand ?? [],
      },
      IsVisible,
      ISBillingAvailable,
      category: categoryName,
    });

    if (!product) {
      return res.status(400).json({ message: "Product not created" });
    }

    return res.status(201).json(product , { message: "Product created successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// GET All Products
export const getProducts = async (req, res) => {
  try {
    const onlyVisible = req.query?.visible === 'true'
    const billingOnly = req.query?.billing === 'true'
    const category = req.query?.category
    
    let filter = {}
    if (onlyVisible) filter.IsVisible = true
    if (billingOnly) filter.ISBillingAvailable = true
    if (category) filter.category = category
    
    const products = await Product.find(filter);

    return res.status(200).json(products , { message: "Products fetched successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// UPDATE Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, inStock, image, HSN_code, metadata , IsVisible , ISBillingAvailable, category } = req.body;

    // Auto-save category if provided
    let categoryName = category !== undefined ? category : "General"
    if (category && category.trim() !== "") {
      await getOrCreateCategory(category)
      categoryName = category.trim()
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        discription: description,
        price,
        inStock,
        image,
        HSNC_code: HSN_code,
        metadata: {
          colorvalues: metadata?.colorvalues ?? metadata?.color ?? [],
          sizevalues: metadata?.sizevalues ?? metadata?.size ?? [],
          brandvalues: metadata?.brandvalues ?? metadata?.brand ?? [],
        },
        IsVisible,
        ISBillingAvailable,
        category: categoryName,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product , { message: "Product updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// DELETE Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully", product });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

export const getProductsByID = async (req, res) => {
    try {
        const {id} = req.params ;
        const product = await Product.findById(id);

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        return res.status(200).json({ message: "Product found successfully", product });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: err.message });
    }
}

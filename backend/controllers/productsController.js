import Product from "../models/product.js"

// CREATE Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, inStock, image, HSN_code, metadata , IsVisible } = req.body;

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
    const filter = onlyVisible ? { IsVisible: true } : {}
    const products = await Product.find(filter);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.status(200).json(products , { message: "Products fetched successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// UPDATE Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, inStock, image, HSN_code, metadata , IsVisible } = req.body;

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

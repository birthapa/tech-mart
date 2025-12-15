const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    // Validate that req.body exists and contains required fields
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Request body is required" });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Check for required fields
    if (
      !name ||
      !description ||
      !price ||
      !countInStock ||
      !category ||
      !Array.isArray(sizes) ||
      !Array.isArray(colors) ||
      !Array.isArray(collections) ||
      !sku
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields or invalid array format" });
    }

    // Check for duplicate SKU
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ message: "SKU already exists" });
    }

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id, // admin user creating it
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Product Creation Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update an existing product by ID
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Update fields safely (only if provided)
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;

    // FIXED: Convert string to number for numeric fields
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice)) {
        return res.status(400).json({ message: "Price must be a valid number" });
      }
      product.price = numPrice;
    }

    if (discountPrice !== undefined) {
      if (discountPrice === "" || discountPrice === null) {
        product.discountPrice = null; // or 0 if preferred
      } else {
        const numDiscount = Number(discountPrice);
        if (isNaN(numDiscount)) {
          return res.status(400).json({ message: "Discount price must be a valid number" });
        }
        product.discountPrice = numDiscount;
      }
    }

    if (countInStock !== undefined) {
      const numStock = Number(countInStock);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ message: "Stock must be a valid non-negative number" });
      }
      product.countInStock = numStock;
    }

    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (material !== undefined) product.material = material;
    if (gender !== undefined) product.gender = gender;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isPublished !== undefined) product.isPublished = isPublished;
    if (tags !== undefined) product.tags = tags;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (weight !== undefined) product.weight = weight;

    // Handle arrays safely
    if (Array.isArray(sizes)) product.sizes = sizes;
    if (Array.isArray(colors)) product.colors = colors;
    if (Array.isArray(collections)) product.collections = collections;

    // Handle images - only update if new array is sent
    if (Array.isArray(images) && images.length > 0) {
      product.images = images;
    }

    // Handle SKU update with uniqueness check
    if (sku !== undefined && sku !== product.sku) {
      const existingSku = await Product.findOne({ sku });
      if (existingSku) {
        return res.status(400).json({ message: "SKU already exists" });
      }
      product.sku = sku;
    } else if (sku !== undefined) {
      product.sku = sku;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Product Update Error:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by ID
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Product Deletion Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route GET /api/products
// @desc Get all products with optional query filters
// @access Public
router.get("/", async (req, res) => {
  try {
    const {
      collection,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    // Filter logic
    if (collection && collection.toLowerCase() !== "all") {
      query.collections = { $in: [collection] };
    }

    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }

    if (material) {
      query.material = { $in: material.split(",") };
    }

    if (brand) {
      query.brand = { $in: brand.split(",") };
    }

    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query.colors = { $in: [color] };
    }

    if (gender) {
      query.gender = gender;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort Logic
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    // Fetch products and apply sorting
    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit) || 0);

    res.json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route GET /api/products/best-seller
// @desc Retrieve the product with highest rating
// @access Public
router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    if (!bestSeller) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(bestSeller);
  } catch (error) {
    console.error("Best Seller Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/products/new-arrivals
// @desc Retrieve latest 8 products Creation date
// @access Public
router.get("/new-arrivals", async (req, res) => {
  try {
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on the current product's gender and category
// @access Public
router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const similarProducts = await Product.find({
      _id: { $ne: id },
      gender: product.gender,
      category: product.category,
    }).limit(4);

    res.json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
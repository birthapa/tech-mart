const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// ==================== HANDLER FUNCTIONS (DEFINED FIRST) ====================

// GET /api/products - Fetch products with filters, search, sort, and pagination
const getProducts = async (req, res) => {
  try {
    const {
      category,
      gender,
      color,
      size,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy,
      limit,
    } = req.query;

    let query = {};

    if (category) {
      query.category = category;
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
};

// GET /api/products/best-seller - Retrieve the highest-rated product
const getBestSellers = async (req, res) => {
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
};

// GET /api/products/new-arrivals - Latest 8 products by creation date
const getNewArrivals = async (req, res) => {
  try {
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// GET /api/products/:id - Get single product by ID
const getProductById = async (req, res) => {
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
};

// GET /api/products/similar/:id - Get similar products
const getSimilarProducts = async (req, res) => {
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
};

// ==================== ROUTES (NOW SAFE TO REGISTER) ====================

// Existing routes...
router.get("/", getProducts); // Fetch all/filtered products

// New route for best sellers
router.get("/best-seller", getBestSellers);

// @route   GET /api/products/new-arrivals
// @desc    Retrieve latest 8 products by creation date
// @access  Public
router.get("/new-arrivals", getNewArrivals);

// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Public
router.get("/:id", getProductById);

// @route   GET /api/products/similar/:id
// @desc    Retrieve similar products based on gender and category
// @access  Public
router.get("/similar/:id", getSimilarProducts);

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
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice)) {
        return res.status(400).json({ message: "Invalid price value" });
      }
      product.price = numPrice;
    }
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (sizes !== undefined) product.sizes = sizes;
    if (colors !== undefined) product.colors = colors;
    if (collections !== undefined) product.collections = collections;
    if (material !== undefined) product.material = material;
    if (gender !== undefined) product.gender = gender;

    // === FIXED: Safe handling of images (string URLs or objects) ===
    if (images !== undefined) {
      if (Array.isArray(images) && images.length > 0) {
        product.images = images.map((item) => {
          if (typeof item === "string") {
            return {
              url: item.trim(),
              altText: product.name || "Product image",
            };
          }
          return {
            url: item.url || "",
            altText: item.altText || product.name || "Product image",
          };
        });
      } else {
        product.images = [];
      }
    }
    // === END OF FIX ===

    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isPublished !== undefined) product.isPublished = isPublished;
    if (tags !== undefined) product.tags = tags;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (weight !== undefined) product.weight = weight;
    if (sku !== undefined) {
      // Optional: prevent SKU change or validate uniqueness
      const existing = await Product.findOne({ sku, _id: { $ne: product._id } });
      if (existing) {
        return res.status(400).json({ message: "SKU already exists" });
      }
      product.sku = sku;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Product Update Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
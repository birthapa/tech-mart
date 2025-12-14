const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Helper function to get cart by user or guest
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

// POST /api/cart - Add item (Public)
router.post("/", async (req, res) => {
  const { productId, quantity = 1, size, color, guestId, userId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await getCart(userId, guestId);

    if (!cart) {
      cart = new Cart({
        user: userId || null,
        guestId: guestId || null,
        products: [],
        totalPrice: 0,
      });
    }

    const itemIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += quantity;
    } else {
      cart.products.push({
        productId,
        name: product.name,
        image: product.images[0],
        price: product.price,
        size,
        color,
        quantity,
      });
    }

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT /api/cart - Update quantity (Protected)
router.put("/", protect, async (req, res) => {
  const { productId, quantity, size, color } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity <= 0) {
      cart.products.splice(itemIndex, 1);
    } else {
      cart.products[itemIndex].quantity = quantity;
    }

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE /api/cart/:productId - Remove item (Protected)
router.delete("/:productId", protect, async (req, res) => {
  const { size, color } = req.body;  // Get variant details from body

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === req.params.productId &&
        (!size || item.size === size) &&
        (!color || item.color === color)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.products.splice(itemIndex, 1);

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET /api/cart - Get cart (Protected)
router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ products: [], totalPrice: 0 });
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST /api/cart/merge - Merge guest cart after login (Protected)
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;

  try {
    const userCart = await Cart.findOne({ user: req.user._id });
    const guestCart = await Cart.findOne({ guestId });

    if (!guestCart || guestCart.products.length === 0) {
      return res.json(userCart || { products: [], totalPrice: 0 });
    }

    if (!userCart) {
      guestCart.user = req.user._id;
      guestCart.guestId = null;
      await guestCart.save();
      return res.json(guestCart);
    }

    for (const guestProduct of guestCart.products) {
      const productIndex = userCart.products.findIndex(
        (p) =>
          p.productId.toString() === guestProduct.productId.toString() &&
          p.size === guestProduct.size &&
          p.color === guestProduct.color
      );

      if (productIndex > -1) {
        userCart.products[productIndex].quantity += guestProduct.quantity;
      } else {
        userCart.products.push(guestProduct);
      }
    }

    userCart.totalPrice = userCart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await userCart.save();
    await guestCart.deleteOne();

    res.json(userCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
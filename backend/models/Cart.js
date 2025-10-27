const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  image: String,
  price: {
    type: Number, // Changed from String to Number to match arithmetic in cartRoutes.js
    required: true,
  },
  size: String,
  color: String,
  quantity: {
    type: Number,
    default: 1,
  },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  guestId: {
    type: String,
  },
  products: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0, // Ensure default is applied even when products is empty
  },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
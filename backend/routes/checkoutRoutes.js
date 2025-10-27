const express = require("express");
const router = express.Router();
const Checkout = require("../models/Checkout");
const Order = require("../models/Order");
const axios = require("axios");
const { protect } = require("../middleware/authMiddleware");

// Helper function to format phone number for Khalti
function formatPhoneNumberForKhalti(phone) {
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 977 (Nepal code without +)
  if (cleaned.startsWith('977')) {
    return `+${cleaned}`;
  }
  
  // If it's 10 digits (Nepal numbers without country code)
  if (cleaned.length === 10) {
    return `+977${cleaned}`;
  }
  
  // If it already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: assume it's a Nepal number
  return `+977${cleaned}`;
}

// @desc    Create Checkout & Initialize Khalti Payment
// @route   POST /api/checkout
// @access  Private
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  // ✅ Basic Validations
  if (!checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No checkout items provided" });
  }

  if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.phone) {
    return res.status(400).json({ message: "Incomplete shipping address" });
  }

  if (!req.user || !req.user.email) {
    return res.status(400).json({ message: "User email is required" });
  }

  try {
    // ✅ Save checkout to DB
    const checkout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    // ✅ Format phone number for Khalti
    const formattedPhone = formatPhoneNumberForKhalti(shippingAddress.phone);
    console.log("Formatted phone for Khalti:", formattedPhone);

    // ✅ Build payload for Khalti Initiate API
    const payload = {
      public_key: process.env.VITE_KHALTI_PUBLIC_KEY,
      product_identity: checkout._id.toString(),
      product_name: "E-Commerce Order",
      amount: Math.round(totalPrice * 100),
      mobile: formattedPhone,
      transaction_pin: "1234", // Temporary test PIN
      return_url: `${process.env.CLIENT_URL}/checkout/success`,
      website_url: `${process.env.CLIENT_URL}`,
      customer_info: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName || ""}`,
        email: req.user.email,
        phone: formattedPhone,
      },
    };

    console.log("Khalti Payload:", payload);

    // ✅ Call Khalti Initiate API
    const khaltiResponse = await axios.post(
      process.env.KHALTI_INITIATE_URL,
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Store Khalti response
    checkout.paymentData = khaltiResponse.data;
    await checkout.save();

    res.status(201).json(checkout);
  } catch (err) {
    console.error("❌ Checkout Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      headers: err.response?.headers,
      stack: err.stack,
    });
    
    if (err.response?.data) {
      return res.status(500).json({
        message: "Khalti API Error",
        error: err.response.data,
      });
    }
    
    res.status(500).json({
      message: "Server error during checkout",
      error: err.message,
    });
  }
});

// @desc    Verify Khalti Payment
// @route   POST /api/checkout/verify-payment
// @access  Private
router.post("/verify-payment", protect, async (req, res) => {
  const { pidx, orderId } = req.body;

  if (!pidx || !orderId) {
    return res.status(400).json({ message: "Missing pidx or orderId" });
  }

  try {
    const response = await axios.post(
      process.env.KHALTI_VERIFY_URL,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const khaltiData = response.data;

    if (khaltiData.status !== "Completed") {
      return res.status(400).json({
        message: "Payment not completed",
        status: khaltiData.status,
      });
    }

    // ✅ Find the checkout and update payment status
    const checkout = await Checkout.findById(orderId);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    checkout.isPaid = true;
    checkout.paidAt = Date.now();
    checkout.paymentStatus = "completed";
    checkout.paymentDetails = khaltiData;
    checkout.pidx = pidx;
    await checkout.save();

    // ✅ Create order from checkout
    const order = await Order.create({
      user: req.user._id,
      orderItems: checkout.checkoutItems,
      shippingAddress: checkout.shippingAddress,
      totalPrice: checkout.totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      paymentMethod: checkout.paymentMethod,
      paymentResult: khaltiData,
    });

    res.status(200).json({
      message: "Payment verified successfully",
      order,
      checkout,
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Payment verification failed",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
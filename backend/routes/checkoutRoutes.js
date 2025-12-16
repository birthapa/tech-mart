const express = require("express");
const axios = require("axios");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Helper function to get Khalti endpoint based on mode (CORRECTED: Fixed sandbox URL)
const getKhaltiEndpoint = () => {
  if (process.env.KHALTI_MODE === "production") {
    return "https://khalti.com/api/v2/";
  } else {
    // Sandbox URL: Fixed from "devkhalti.com" to "dev.khalti.com"
    return "https://dev.khalti.com/api/v2/";
  }
};

// @route POST /api/checkout/:id/initiateKhalti
// @desc Initiate Khalti payment for a checkout session
// @access Private
// ← FIXED: Removed hyphen after :id → safe path
router.post("/:id/initiateKhalti", protect, async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.KHALTI_SECRET_KEY || !process.env.KHALTI_RETURN_URL || !process.env.KHALTI_WEBSITE_URL) {
      return res.status(500).json({ message: "Khalti configuration missing. Check environment variables." });
    }

    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    if (checkout.isPaid) {
      return res.status(400).json({ message: "Checkout already paid" });
    }

    // Prepare payload for Khalti (amount in paisa)
    const amountInPaisa = Math.round(checkout.totalPrice * 100); // Assuming totalPrice in NPR
    const payload = {
      return_url: process.env.KHALTI_RETURN_URL,
      website_url: process.env.KHALTI_WEBSITE_URL,
      amount: amountInPaisa.toString(),
      purchase_order_id: checkout._id.toString(),
      purchase_order_name: `Order for ${req.user.name || 'Customer'}`,
      customer_info: {
        name: req.user.name || 'Test User',
        email: req.user.email || 'test@example.com',
        phone: req.user.phone || '9800000001', // Use test phone for sandbox
      },
    };

    console.log("Khalti Payload:", payload); // For debugging

    // Khalti API call
    const endpoint = getKhaltiEndpoint();
    const response = await axios.post(
      `${endpoint}epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { pidx, payment_url } = response.data; // Assuming response has these (based on docs)

    // Optionally save pidx to checkout for reference
    checkout.paymentDetails = { ...checkout.paymentDetails, pidx };
    await checkout.save();

    console.log(`Khalti payment initiated for checkout ${checkout._id}, pidx: ${pidx}`);
    res.status(200).json({ 
      success: true, 
      payment_url, 
      pidx,
      message: "Redirect user to payment_url" 
    });
  } catch (error) {
    console.error("Error initiating Khalti payment:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
});

// @route GET /api/checkout/khalti/callback
// @desc Handle Khalti callback (verify payment and update status)
// @access Public (Khalti calls this)
router.get("/khalti/callback", async (req, res) => {
  const { pidx, status, amount, transaction_id, purchase_order_id } = req.query;

  if (!pidx) {
    return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/checkout/failure?error=no_pidx`);
  }

  try {
    // First, verify via lookup API
    const endpoint = getKhaltiEndpoint();
    const lookupResponse = await axios.post(
      `${endpoint}epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const lookupData = lookupResponse.data;
    console.log(`Khalti lookup for pidx ${pidx}:`, lookupData);

    if (lookupData.status === 'Completed') {
      // Update checkout to paid (repurpose existing /pay logic)
      const checkout = await Checkout.findById(purchase_order_id);
      if (checkout) {
        checkout.isPaid = true;
        checkout.paymentStatus = 'paid';
        checkout.paymentDetails = {
          ...checkout.paymentDetails,
          pidx,
          transaction_id,
          status: 'Completed',
          amount: parseInt(amount) / 100, // Back to NPR
        };
        checkout.paidAt = new Date();
        await checkout.save();

        console.log(`Payment verified and updated for checkout ${purchase_order_id}`);
        // Redirect to frontend success with order ID
        return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/checkout/success?orderId=${purchase_order_id}`);
      }
    } else {
      console.log(`Payment failed for pidx ${pidx}, status: ${lookupData.status}`);
      return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/checkout/failure?error=${lookupData.status}`);
    }
  } catch (error) {
    console.error("Error in Khalti callback:", error.response?.data || error.message);
    res.redirect(`${process.env.KHALTI_WEBSITE_URL}/checkout/failure?error=verification_failed`);
  }
});

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid after successful payment (existing, but now called internally if needed)
// @access Private
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();
      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Invalid Payment Status" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation (existing, unchanged)
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (checkout.isPaid && !checkout.isFinalized) {
      // Create final order based on the checkout details
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });
      // Mark the checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();
      // Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/checkout (existing, unchanged)
// @desc Create a new checkout session
// @access Private
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;
  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "no items in checkout" });
  }
  try {
    // Create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems: checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });
    console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error Creating checkout session:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
const express = require("express");
const axios = require("axios");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Helper function to get Khalti endpoint based on mode
const getKhaltiEndpoint = () => {
  if (process.env.KHALTI_MODE === "production") {
    return "https://khalti.com/api/v2/";
  } else {
    return "https://dev.khalti.com/api/v2/";
  }
};

// @route POST /api/checkout/:id/initiateKhalti
router.post("/:id/initiateKhalti", protect, async (req, res) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY || !process.env.KHALTI_WEBSITE_URL) {
      return res.status(500).json({ message: "Khalti configuration missing." });
    }

    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });
    if (checkout.isPaid) return res.status(400).json({ message: "Checkout already paid" });

    const amountInPaisa = Math.round(checkout.totalPrice * 100);

    const payload = {
      return_url: `${process.env.KHALTI_WEBSITE_URL}/order-confirmation`,
      website_url: process.env.KHALTI_WEBSITE_URL,
      amount: amountInPaisa.toString(),
      purchase_order_id: checkout._id.toString(),
      purchase_order_name: `Order for ${req.user.name || 'Customer'}`,
      customer_info: {
        name: req.user.name || 'Test User',
        email: req.user.email || 'test@example.com',
        phone: req.user.phone || '9800000001',
      },
    };

    console.log("Khalti Payload:", payload);

    const endpoint = getKhaltiEndpoint();
    const response = await axios.post(`${endpoint}epayment/initiate/`, payload, {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const { pidx, payment_url } = response.data;

    checkout.paymentDetails = { ...checkout.paymentDetails, pidx };
    await checkout.save();

    res.status(200).json({ success: true, payment_url, pidx });
  } catch (error) {
    console.error("Error initiating Khalti:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
});

// NEW: Khalti callback - verify payment and create permanent Order
router.get("/khalti/callback", async (req, res) => {
  const { pidx, status, amount, transaction_id, purchase_order_id } = req.query;

  if (!pidx) {
    return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/order-confirmation?status=failed`);
  }

  try {
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

    if (lookupData.status === "Completed") {
      const checkout = await Checkout.findById(purchase_order_id);
      if (!checkout) {
        return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/order-confirmation?status=failed`);
      }

      // Mark checkout as paid
      checkout.isPaid = true;
      checkout.paymentStatus = "paid";
      checkout.paymentDetails = {
        ...checkout.paymentDetails,
        pidx,
        transaction_id,
        status: "Completed",
        amount: parseInt(amount) / 100,
      };
      checkout.paidAt = new Date();

      // CREATE PERMANENT ORDER
      let finalOrderId = checkout._id;

      if (!checkout.isFinalized) {
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

        checkout.isFinalized = true;
        checkout.finalizedAt = new Date();
        await checkout.save();

        // Clear user's cart
        await Cart.findOneAndDelete({ user: checkout.user });

        finalOrderId = finalOrder._id;
        console.log("Permanent Order created with ID:", finalOrder._id);
      }

      await checkout.save();

      // Redirect to confirmation with real Order ID
      return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/order-confirmation?orderId=${finalOrderId}&status=success`);
    }

    // Payment not completed
    return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/order-confirmation?status=failed`);
  } catch (error) {
    console.error("Error in Khalti callback:", error.response?.data || error.message);
    return res.redirect(`${process.env.KHALTI_WEBSITE_URL}/order-confirmation?status=failed`);
  }
});

// Existing routes (unchanged)
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });
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

router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    if (checkout.isPaid && !checkout.isFinalized) {
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
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();
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

router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;
  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "no items in checkout" });
  }
  try {
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error Creating checkout session:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
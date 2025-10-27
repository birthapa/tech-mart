const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String },
  color: { type: String },
});

const checkoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkoutItems: [checkoutItemSchema],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Allow various formats including country code
          return /^(\+?977)?[0-9]{7,10}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number! Use format: 9779841234567 or +9779841234567`
      }
    },
  },
  paymentMethod: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paymentStatus: { type: String, default: "pending" },
  paymentDetails: { type: mongoose.Schema.Types.Mixed },
  pidx: { type: String },
  isFinalized: { type: Boolean, default: false },
  finalizedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Checkout", checkoutSchema);
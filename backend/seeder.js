const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
const products = require("./data/products");
// REMOVED bcrypt — no longer needed since no user creation

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected successfully");
}).catch((error) => {
  console.error("Error connecting to MongoDB", error);
  process.exit(1); // Exit if the connection fails
});

// Function to seed data
const seedData = async () => {
  try {
    // Clear existing data (optional — keep if you want fresh products every time)
    await Product.deleteMany();
    await Cart.deleteMany();
    // DO NOT delete users — users are created via register route only
    // await User.deleteMany(); // ← REMOVED: Users are permanent, created via /register

    // Seed only products — no user creation
    await Product.insertMany(products);

    console.log("Product data seeded successfully!");
    process.exit(); // Exit after seeding is done
  } catch (error) {
    console.error("Error seeding the data:", error);
    process.exit(1); // Exit with an error code if something goes wrong
  }
};

seedData();
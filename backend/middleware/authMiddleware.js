const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes (JWT authentication)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token); // Debug: see raw token

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded); // Debug: see decoded payload

      // Fetch full user from DB based on token payload
      const user = await User.findById(decoded.user.id).select("-password");

      if (!user) {
        console.log("No user found for ID:", decoded.user.id);
        return res.status(401).json({ message: "User not found" });
      }

      // Attach user object to request
      req.user = user;
      console.log("User found:", req.user._id, req.user.email); // Debug: user data OK

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("No token provided in headers");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to restrict route to admins only
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };

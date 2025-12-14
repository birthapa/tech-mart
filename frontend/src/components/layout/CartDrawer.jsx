import React from "react";
import { IoMdClose } from "react-icons/io";
import CartContents from "../carts/CartContents";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CartDrawer = ({ isOpen = false, toggleCart = () => {} }) => {
  const navigate = useNavigate();

  // Get user and guestId from auth state (adjust path if your auth slice is different)
  const { user } = useSelector((state) => state.auth || {});
  const guestId = useSelector((state) => state.auth?.guestId || null);

  // Get cart from cart state with safe fallback
  const { cart = { products: [] }, loading } = useSelector((state) => state.cart || {});

  const userId = user?._id || null;

  const handleCheckout = () => {
    toggleCart(); // Close drawer
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  const subtotal = cart.products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0  bg-opacity-50 z-40"
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close cart"
          >
            <IoMdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading cart...</p>
          ) : cart.products.length > 0 ? (
            <CartContents cart={cart} userId={userId} guestId={guestId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <button
                onClick={toggleCart}
                className="mt-4 text-blue-600 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {cart.products.length > 0 && (
          <div className="border-t bg-white p-6">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Subtotal</span>
              <span>NPR {subtotal.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Shipping, taxes, and discounts calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
import React from "react";
import { IoMdClose } from "react-icons/io";
import CartContents from "../carts/CartContents";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CartDrawer = ({ isOpen = false, toggleCart = () => {} }) => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth || {});
  const guestId = useSelector((state) => state.auth?.guestId || null);

  const { cart = { products: [] }, loading } = useSelector((state) => state.cart || {});

  const userId = user?._id || null;

  const handleCheckout = () => {
    toggleCart();
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  const subtotal = cart.products.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleCart} />
      )}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <button onClick={toggleCart} className="text-gray-500 hover:text-black">
            <IoMdClose className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100%-200px)]">
          <CartContents cart={cart} userId={userId} guestId={guestId} />

          {cart.products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">Your cart is empty</p>
              <button
                onClick={toggleCart}
                className="text-blue-600 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          )}
        </div>

        {cart.products.length > 0 && (
          <div className="border-t bg-white p-6">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
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
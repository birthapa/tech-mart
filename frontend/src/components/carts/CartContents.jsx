import React from "react";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useDispatch } from "react-redux";
import {
  updateCartItemQuantity,
  removeFromCart,
} from "../../redux/slices/cartSlice";

const CartContents = ({ cart, userId, guestId }) => {
  const dispatch = useDispatch();

  if (!cart?.products || cart.products.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  const handleQuantityChange = (productId, delta, quantity, size, color) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          guestId,
          userId,
          size,
          color,
        })
      );
    }
  };

  const handleRemoveFromCart = (productId, size, color) => {
    dispatch(removeFromCart({ productId, guestId, userId, size, color }));
  };

  const handleRemoveKeyDown = (e, productId, size, color) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRemoveFromCart(productId, size, color);
    }
  };

  return (
    <div>
      {cart.products.map((product) => (
        <div
          key={`${product.productId}-${product.size}-${product.color}`}
          className="flex items-start justify-between py-4 border-b"
        >
          <div className="flex items-start gap-4">
            <img
              src={product.image}
              alt={product.name || "Product image"}
              className="w-20 h-24 object-cover rounded"
              loading="lazy"
            />
            <div>
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-xs text-gray-500">Size: {product.size}</p>
              <p className="text-xs text-gray-500">Color: {product.color}</p>

              <div className="flex items-center mt-2 space-x-2">
                <button
                  onClick={() =>
                    handleQuantityChange(
                      product.productId,
                      -1,
                      product.quantity,
                      product.size,
                      product.color
                    )
                  }
                  className="border-2 border-gray-400 rounded w-8 h-8 text-sm font-medium disabled:opacity-50"
                  disabled={product.quantity <= 1}
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  -
                </button>
                <span
                  className="mx-2 text-sm"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {product.quantity}
                </span>
                <button
                  onClick={() =>
                    handleQuantityChange(
                      product.productId,
                      1,
                      product.quantity,
                      product.size,
                      product.color
                    )
                  }
                  className="border-2 border-gray-400 rounded w-8 h-8 text-sm font-medium"
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between h-full ml-4">
            <p className="text-sm font-semibold">
              NPR {(product.price * product.quantity).toLocaleString()}
            </p>
            <button
              onClick={() =>
                handleRemoveFromCart(product.productId, product.size, product.color)
              }
              className="mt-4 focus:outline-none"
              onKeyDown={(e) =>
                handleRemoveKeyDown(e, product.productId, product.size, product.color)
              }
              aria-label={`Remove ${product.name} from cart`}
              tabIndex={0}
            >
              <RiDeleteBin3Line
                className="h-5 w-5 text-red-600 cursor-pointer"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout, clearCheckoutError } from "../../redux/slices/checkoutSlice";
import CheckoutComponent from "./CheckoutComponent";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading, error, paymentError } = useSelector((state) => state.checkout);

  const [checkoutId, setCheckoutId] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!user || !token) {
      navigate("/login");
    } else if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, user, navigate]);

  const totalPrice =
    cart?.products?.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    ) || 0;

  const isShippingComplete = Object.values(shippingAddress).every(
    (field) => field.trim() !== ""
  );

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    dispatch(clearCheckoutError());

    const payload = {
      checkoutItems: cart.products,
      shippingAddress,
      paymentMethod: "Khalti",
      totalPrice,
    };

    try {
      const action = await dispatch(createCheckout(payload));

      if (createCheckout.fulfilled.match(action) && action.payload?._id) {
        setCheckoutId(action.payload._id);
      } else {
        console.error("Checkout creation failed:", action.payload || action.error);
      }
    } catch (err) {
      console.error("Unexpected error during checkout:", err);
    }
  };

  const formatPhoneNumber = (value) => {
    return value.replace(/[^\d+]/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setShippingAddress((prev) => ({
        ...prev,
        phone: formatPhoneNumber(value),
      }));
    } else {
      setShippingAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-7 -mt-20">
      <div className="flex flex-col lg:flex-row justify-between max-w-6xl mx-auto gap-3">
        <div className="w-full lg:w-1/2 pr-4">
          <h2 className="text-2xl font-bold uppercase mb-6">Checkout</h2>
          <form onSubmit={handleCreateCheckout} className="space-y-6">
            <div>
              <h3 className="text-base font-semibold mb-3">Contact Details</h3>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              />
            </div>

            <div>
              <h3 className="text-base font-semibold mb-3">Delivery</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={shippingAddress.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={shippingAddress.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded text-sm mb-4"
                required
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>

              <input
                type="text"
                name="country"
                placeholder="Country"
                value={shippingAddress.country}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded text-sm mb-4"
                required
              />

              <div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone (e.g. 9779841234567)"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 9779841234567 or +9779841234567
                </p>
              </div>
            </div>

            {!checkoutId ? (
              <button
                type="submit"
                disabled={!isShippingComplete || loading}
                className={`w-full py-3 text-white text-sm font-medium rounded ${
                  isShippingComplete && !loading
                    ? "bg-black hover:bg-gray-800"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Processing..." : "Continue to Payment"}
              </button>
            ) : (
              <div className="pt-4">
                <h3 className="text-base font-semibold mb-3">Pay with Khalti</h3>
                <CheckoutComponent amount={totalPrice} checkoutId={checkoutId} />
              </div>
            )}

            {(error || paymentError) && (
              <p className="text-red-500 text-sm font-medium mt-2 text-center">
                {error || paymentError}
              </p>
            )}
          </form>
        </div>

        <div className="w-full lg:w-1/2 bg-white border border-gray-200 p-6 rounded-md h-fit">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Order Summary
          </h3>
          {cart?.products?.map((product, index) => (
            <div
              key={`${product.productId}-${product.size}-${product.color}-${index}`}
              className="flex justify-between items-start gap-4 mb-4"
            >
              <img
                src={product.image || "https://via.placeholder.com/80x100?text=No+Image"}
                alt={product.name || "Product"}
                className="w-16 h-20 object-cover rounded bg-gray-100"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80x100?text=No+Image";
                }}
              />
              <div className="text-sm flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-gray-600">Size: {product.size}</p>
                <p className="text-gray-600">Color: {product.color}</p>
                <p className="text-gray-600">Qty: {product.quantity || 1}</p>
              </div>
              <p className="text-sm font-semibold whitespace-nowrap">
                Rs. {(product.price * (product.quantity || 1)).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="border-t mt-4 pt-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>Rs. {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
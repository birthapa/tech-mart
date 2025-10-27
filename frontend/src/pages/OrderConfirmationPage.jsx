import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { checkout } = useSelector((state) => state.checkout);

  useEffect(() => {
    if (checkout && checkout._id && checkout.isPaid) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    } else {
      navigate("/my-orders");
    }
  }, [checkout, dispatch, navigate]);

  if (!checkout || !checkout.isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No order found</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date(checkout.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 10);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white mt-[-80px]">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-8">
        Thank You for Your Order!
      </h1>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Order ID: {checkout._id}
            </h2>
            <p className="text-sm text-gray-500">
              Order date: {new Date(checkout.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-700 font-medium">
              Estimated Delivery: {estimatedDelivery.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mb-8 space-y-4">
          {checkout.checkoutItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center border border-gray-100 rounded-md p-2"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 object-cover rounded mr-4"
              />
              <div>
                <h4 className="text-sm font-medium">{item.name}</h4>
                <p className="text-xs text-gray-500">
                  {item.color} | {item.size}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-1">Payment</h4>
            <p className="text-gray-600">Khalti</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Delivery</h4>
            <p className="text-gray-600">{checkout.shippingAddress.address}</p>
            <p className="text-gray-600">
              {checkout.shippingAddress.city}, {checkout.shippingAddress.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
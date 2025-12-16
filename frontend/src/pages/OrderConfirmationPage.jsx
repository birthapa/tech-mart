import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const paymentStatus = searchParams.get("status");

  const { checkout } = useSelector((state) => state.checkout);
  const { cart } = useSelector((state) => state.cart);

  // Fallback: Use cart data if checkout state is lost (most common after Khalti redirect)
  let order = checkout;

  if (!order || !order.checkoutItems?.length) {
    if (cart?.products?.length > 0) {
      const totalPrice = cart.products.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
      order = {
        _id: "Your Recent Order",
        checkoutItems: cart.products.map(p => ({
          productId: p.productId,
          name: p.name,
          image: p.image,
          price: p.price,
          quantity: p.quantity || 1,
          color: p.color,
          size: p.size,
        })),
        shippingAddress: {
          address: "As entered during checkout",
          city: "",
          country: "",
        },
        totalPrice,
        createdAt: new Date(),
        isPaid: true,
      };
    }
  }

  useEffect(() => {
    if (order && order.isPaid) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    }

    // If payment failed
    if (paymentStatus === "failed" || !order) {
      navigate("/checkout");
    }
  }, [order, dispatch, navigate, paymentStatus]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Processing...</h2>
          <p className="text-gray-600">Your payment was successful. Check My Orders.</p>
          <button
            onClick={() => navigate("/my-orders")}
            className="bg-black text-white px-6 py-3 rounded"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.createdAt);
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
              Order ID: {order._id}
            </h2>
            <p className="text-sm text-gray-500">
              Order date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-700 font-medium">
              Estimated Delivery: {estimatedDelivery.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mb-8 space-y-4">
          {order.checkoutItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center border border-gray-100 rounded-md p-2"
            >
              <img
                src={item.image || "https://via.placeholder.com/80"}
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
                <p className="text-sm font-medium">Rs. {item.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-1">Payment</h4>
            <p className="text-gray-600">Khalti (Paid)</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Delivery</h4>
            <p className="text-gray-600">{order.shippingAddress.address || "As entered"}</p>
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/my-orders")}
            className="bg-black text-white px-8 py-4 rounded-lg text-lg hover:bg-gray-800 transition"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
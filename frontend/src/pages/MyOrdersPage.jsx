import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orders: fetchedOrders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return <p className="text-center text-lg py-8">Loading your orders...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-lg py-8">
        <p className="text-red-600 font-medium">Error: {error}</p>
        <button
          onClick={() => dispatch(fetchUserOrders())}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (fetchedOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 ml-2 mt-[-20px]">
      <h2 className="text-xl font-semibold mb-6">My Orders</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Shipping</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {fetchedOrders.map((order) => (
              <tr
                key={order._id}
                onClick={() => handleRowClick(order._id)}
                className="border-t hover:bg-gray-50 cursor-pointer transition"
              >
                <td className="py-4 px-4">
                  {order.orderItems[0]?.image ? (
                    <img
                      src={order.orderItems[0].image}
                      alt={order.orderItems[0].name || "Product"}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 font-medium">
                  {order._id.slice(-8)} {/* Shows last 8 chars for cleaner look */}
                </td>
                <td className="py-4 px-4">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="py-4 px-4">
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </td>
                <td className="py-4 px-4 text-center">
                  {order.orderItems.length}
                </td>
                <td className="py-4 px-4 font-semibold">
                  ${order.totalPrice.toFixed(2)}
                </td>
                <td className="py-4 px-4">
                  {order.isPaid ? (
                    <span className="text-green-600 font-medium">Paid</span>
                  ) : (
                    <span className="text-red-600 font-medium">Unpaid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrdersPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders: fetchedOrders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) return <p className="text-center text-lg">Loading orders...</p>;
  if (error) return <p className="text-center text-lg">Error: {error}</p>;

  return (
    <div className="bg-white rounded-lg shadow p-4 ml-2 mt-[-20px]">
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-3">Image</th>
            <th className="py-2 px-3">Order ID</th>
            <th className="py-2 px-3">Date</th>
            <th className="py-2 px-3">Shipping</th>
            <th className="py-2 px-3">Items</th>
            <th className="py-2 px-3">Total</th>
            <th className="py-2 px-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {fetchedOrders.map((order) => (
            <tr
              key={order._id}
              onClick={() => handleRowClick(order._id)}
              className="border-t hover:bg-gray-50 cursor-pointer"
            >
              <td className="py-2 px-3">
                <img
                  src={order.orderItems[0]?.image}
                  alt={order.orderItems[0]?.name}
                  className="w-10 h-10 object-cover rounded"
                />
              </td>
              <td className="py-2 px-3">{order._id}</td>
              <td className="py-2 px-3">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="py-2 px-3">
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </td>
              <td className="py-2 px-3">{order.orderItems.length}</td>
              <td className="py-2 px-3">${order.totalPrice.toFixed(2)}</td>
              <td className="py-2 px-3">
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
      {fetchedOrders.length === 0 && !loading && !error && (
        <p className="text-center text-lg mt-4">No orders found.</p>
      )}
    </div>
  );
};

export default MyOrdersPage;
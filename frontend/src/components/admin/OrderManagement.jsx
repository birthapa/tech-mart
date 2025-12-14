import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // ← Fixed: Added missing import
import { useNavigate } from "react-router-dom"; // ← Fixed: Added missing import
import { fetchAllOrders, updateOrderStatus } from "../../redux/slices/adminOrderSlice"; // ← Adjust path if needed

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.adminOrders);

  // Protect route: redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllOrders());
    }
  }, [dispatch, user, navigate]);

  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
  };

  if (loading) return <p className="text-center py-12 text-gray-600">Loading orders...</p>;
  if (error) return <p className="text-center py-12 text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Order Management</h2>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="py-4 px-6">Order ID</th>
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6">Total Price</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-6 font-medium">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="py-4 px-6">{order.user?.name || "Guest"}</td>
                  <td className="py-4 px-6 font-semibold">
                    ${order.totalPrice?.toFixed(2) || "0.00"}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.status || "Processing"}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleStatusChange(order._id, "Delivered")}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Mark as Delivered
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
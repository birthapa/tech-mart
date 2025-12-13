import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { initiateKhaltiPayment } from "../../redux/slices/checkoutSlice";

const CheckoutComponent = ({ amount, checkoutId }) => {
  const dispatch = useDispatch();
  const { paymentLoading, paymentError } = useSelector((state) => state.checkout);

  const handlePayWithKhalti = async () => {
    try {
      const result = await dispatch(initiateKhaltiPayment(checkoutId)).unwrap();

      if (result.payment_url) {
        // Redirect user to Khalti's actual payment page
        window.location.href = result.payment_url;
      } else {
        alert("No payment link received. Please try again.");
      }
    } catch (err) {
      console.error("Khalti payment initiation failed:", err);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePayWithKhalti}
        disabled={paymentLoading}
        className={`w-full py-3 text-white text-sm font-medium rounded transition-all ${
          paymentLoading
            ? "bg-purple-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {paymentLoading ? "Redirecting to Khalti..." : `Pay NPR ${amount.toFixed(2)} with Khalti`}
      </button>

      {paymentError && (
        <p className="text-red-600 text-center font-medium bg-red-50 py-2 rounded-lg">
          {paymentError}
        </p>
      )}
    </div>
  );
};

export default CheckoutComponent;
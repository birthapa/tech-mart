import React from "react";
import KhaltiCheckout from "khalti-checkout-web";
import { useDispatch } from "react-redux";
import { verifyKhaltiPayment } from "../../redux/slices/checkoutSlice";
import { useNavigate } from "react-router-dom";

const CheckoutComponent = ({ amount, checkoutId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const config = {
    publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY,
    productIdentity: checkoutId,
    productName: "Order Payment",
    productUrl: window.location.href,
    eventHandler: {
      onSuccess(payload) {
        console.log("Khalti payment successful. Payload:", payload);
        // Dispatch verification to backend
        dispatch(verifyKhaltiPayment({ 
          pidx: payload.idx || payload.pidx, 
          orderId: checkoutId 
        }))
          .unwrap()
          .then(() => {
            navigate("/order-confirmation", { 
              state: { 
                success: true, 
                amount: amount,
                checkoutId: checkoutId
              } 
            });
          })
          .catch((error) => {
            console.error("Payment verification failed:", error);
            alert('Payment verification failed. Please contact support.');
          });
      },
      onError(error) {
        console.error("Khalti payment error:", error);
        alert('Payment failed. Please try again.');
      },
      onClose() {
        console.log("Khalti widget closed");
      },
    },
    paymentPreference: [
      "KHALTI",
      "EBANKING",
      "MOBILE_BANKING",
      "CONNECT_IPS",
      "SCT",
    ],
  };

  const checkout = new KhaltiCheckout(config);

  const openKhaltiWidget = () => {
    checkout.show({ amount: amount * 100 }); // Amount in paisa
  };

  return (
    <div>
      <button
        onClick={openKhaltiWidget}
        className="w-full py-3 text-white text-sm font-medium rounded bg-purple-600 hover:bg-purple-700"
      >
        Pay NPR {amount.toFixed(2)} with Khalti
      </button>
    </div>
  );
};

export default CheckoutComponent;
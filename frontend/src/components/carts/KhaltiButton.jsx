import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyKhaltiPayment } from '../../redux/slices/checkoutSlice';

const KhaltiButton = ({ amount, checkoutId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { checkout } = useSelector((state) => state.checkout);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://khalti.com/static/web/merchant/khalti-checkout.js';
    script.async = true;
    script.onload = () => {
      initializeKhalti();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeKhalti = () => {
    const khaltiConfig = {
      publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY,
      productIdentity: checkoutId,
      productName: 'E-commerce Order',
      productAmount: amount * 100,
      eventHandler: {
        onSuccess: (payload) => {
          dispatch(verifyKhaltiPayment({ pidx: payload.detail.pidx, orderId: checkoutId }))
            .unwrap()
            .then(() => {
              navigate('/order-confirmation', { state: { order: checkout } });
            })
            .catch((err) => {
              console.error('Verification failed:', err);
              alert('Payment verification failed. Please contact support.');
            });
        },
        onError: (error) => {
          console.error('Payment error:', error);
          alert('Payment failed. Please try again.');
        },
        onClose: () => {
          console.log('Khalti widget closed');
        },
      },
    };

    window.KhaltiCheckout(khaltiConfig);
  };

  const handleKhaltiPayment = () => {
    if (window.KhaltiCheckout) {
      window.KhaltiCheckout();
    } else {
      alert('Khalti SDK not loaded. Please wait.');
    }
  };

  return (
    <div>
      <button
        onClick={handleKhaltiPayment}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
      >
        Pay with Khalti
      </button>
    </div>
  );
};

export default KhaltiButton;
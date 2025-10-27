import React from 'react';
import { HiShoppingBag,  HiOutlineCreditCard, HiRefresh } from 'react-icons/hi';

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
        {/* Feature 1 */}
        <div className="flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-md">
          <HiShoppingBag className="text-4xl text-black mb-4" />
          <h4 className="font-semibold text-lg mb-2">Free International Shipping</h4>
          <p className="text-sm text-gray-600">On all orders over $100.00</p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-md">
          <HiRefresh className="text-4xl text-black mb-4" />
          <h4 className="font-semibold text-lg mb-2">45 Days Returns</h4>
          <p className="text-sm text-gray-600">Money back Guarantee</p>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-md">
          <HiOutlineCreditCard className="text-4xl text-black mb-4" />
          <h4 className="font-semibold text-lg mb-2">24/7 Secure Checkout</h4>
          <p className="text-sm text-gray-600">100% secured checkout process</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

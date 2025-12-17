import React from "react";
import { Link } from "react-router-dom";

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center text-gray-500">No related products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="block"
        >
          <div className="relative h-80 overflow-hidden rounded shadow hover:shadow-xl transition duration-300">
            <img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 text-black px-4 py-2">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm">Rs.{product.price?.toFixed(2)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;

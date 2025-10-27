import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Hero from "../components/layout/Hero";
import GenderCollectionSelection from "../components/products/GenderCollectionSelection";
import NewArrivals from "../components/products/NewArrivals";
import ProductDetails from "../components/products/ProductDetails";
import ProductGrid from "../components/products/ProductGrid";
import FeatureCollection from "../components/products/FeatureCollection";
import FeaturesSection from "../components/products/FeaturesSection";
import { fetchProductsByFilters } from "../redux/slices/productsSlice"; // Assuming this is the correct path
// Removed: import products from "../../../backend/data/products"; // This is unused

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    // Fetch products for a specific collection
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        category: "Bottom Wear",
        limit: 8,
      })
    );

    // Fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
        );
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBestSeller();
  }, [dispatch]);

  return (
    <main>
      <Hero />
      <GenderCollectionSelection />
      <NewArrivals />
      <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>

      {bestSellerProduct ? (
        <ProductDetails productId={bestSellerProduct._id} />
      ) : (
        <p className="text-center">Loading best seller product...</p>
      )}

      <div className="container mx-auto py-10">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top wears for women
        </h2>
        <ProductGrid products={products} loading={loading} error={error} />
      </div>

      <FeatureCollection />
      <FeaturesSection />
    </main>
  );
};

export default Home;

// frontend/src/pages/CollectionPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
import FilterSidebar from "../components/products/FilterSidebar";
import SortOptions from "../components/products/SortOptions";

const CollectionPage = () => {
  const { collection } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const searchKey = searchParams.toString();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Mapping collection route → default filter (only if no manual filter exists)
  const collectionToFilterMap = {
    men: { gender: "Men" },
    women: { gender: "Women" },
    "top-wear": { category: "Top Wear" },
    "bottom-wear": { category: "Bottom Wear" },
    all: {}, // All products
  };

  // MAIN FIX: Smart filter logic
  useEffect(() => {
    const urlParams = Object.fromEntries(searchParams.entries());
    let finalFilters = { ...urlParams };

    // Only apply collection default filter if:
    // 1. We are on a specific collection page
    // 2. AND user has NOT manually selected any filter (gender or category)
    if (collection && collection !== "all") {
      const defaultFilter = collectionToFilterMap[collection.toLowerCase()];
      if (defaultFilter) {
        // Apply gender only if not already set
        if (!finalFilters.gender && defaultFilter.gender) {
          finalFilters.gender = defaultFilter.gender;
        }
        // Apply category only if not already set
        if (!finalFilters.category && defaultFilter.category) {
          finalFilters.category = defaultFilter.category;
        }
      }
    }

    // If user clicked "All", we don't override anything
    dispatch(fetchProductsByFilters(finalFilters));
  }, [dispatch, collection, searchKey]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="p-4 mt-[-100px]">
      {/* Mobile Filter Toggle */}
      <div className="flex mb-4 lg:hidden ml-1 mt-2">
        <button
          onClick={toggleSidebar}
          className="border p-2 flex items-center rounded w-fit"
          aria-label="Toggle Filter Sidebar"
          aria-expanded={isSidebarOpen}
          aria-controls="filter-sidebar"
        >
          <FaFilter className="mr-2" /> Filter
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div
          id="filter-sidebar"
          ref={sidebarRef}
          className={`fixed top-0 left-0 bg-white p-4 w-64 z-50
            transform transition-transform duration-300
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            max-h-screen overflow-y-auto
            lg:relative lg:translate-x-0 lg:block lg:h-auto lg:w-64 lg:z-auto lg:transform-none lg:max-h-full lg:overflow-visible
          `}
        >
          <FilterSidebar />
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold uppercase tracking-wide">
              {collection?.replace("-", " ") || "All Collection"}
            </h2>
            <SortOptions />
          </div>

          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="text-red-500">{String(error)}</p>
          ) : safeProducts.length === 0 ? (
            <p className="text-gray-600">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 px-2 sm:px-0">
              {safeProducts.map((product) => {
                const img =
                  product?.images?.[0]?.url ||
                  "https://via.placeholder.com/600x800?text=No+Image";
                return (
                  <div
                    key={product._id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <img
                      src={img}
                      alt={product?.name || "Product"}
                      className="w-full h-[280px] object-cover rounded"
                      loading="lazy"
                    />
                    <h3 className="mt-2 font-medium text-lg text-gray-900 line-clamp-1">
                      {product?.name || "Untitled"}
                    </h3>
                    <p className="text-gray-600 text-md">
                      {product?.price != null ? `$${product.price}` : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
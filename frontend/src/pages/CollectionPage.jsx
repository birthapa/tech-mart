// frontend/src/pages/CollectionPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import { fetchProductsByFilters } from '../features/products/productsSlice';

const CollectionPage = () => {
  const { collection } = useParams(); // men, women, top-wear, bottom-wear
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allProducts, loading, error } = useSelector((state) => state.products);

  // Auto detect filters from URL
  const getInitialFilters = () => {
    if (collection === 'men') return { gender: 'Men', category: 'All' };
    if (collection === 'women') return { gender: 'Women', category: 'All' };
    if (collection === 'top-wear') return { gender: 'All', category: 'Top Wear' };
    if (collection === 'bottom-wear') return { gender: 'All', category: 'Bottom Wear' };
    return { gender: 'All', category: 'All' };
  };

  const [filters, setFilters] = useState(getInitialFilters());

  // Sync filter UI when URL changes
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [collection]);

  // Fetch products when filters change
  useEffect(() => {
    dispatch(fetchProductsByFilters(filters));
  }, [filters, dispatch]);

  // Optional: Update URL when filter changes
  useEffect(() => {
    let path = '/collection/';
    if (filters.gender !== 'All') {
      path += filters.gender.toLowerCase();
    } else if (filters.category !== 'All') {
      path += filters.category.toLowerCase().replace(' ', '-');
    } else {
      path += 'all';
    }
    navigate(path, { replace: true });
  }, [filters, navigate]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const getTitle = () => {
    switch (collection) {
      case 'men': return 'MEN';
      case 'women': return 'WOMEN';
      case 'top-wear': return 'TOP-WEAR';
      case 'bottom-wear': return 'BOTTOM-WEAR';
      default: return 'COLLECTION';
    }
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading products...</div>;
  if (error) return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tech-Mart</h1>
          <nav className="flex gap-10 text-lg font-medium">
            <a href="/collection/men" className="hover:text-orange-600 transition">MEN</a>
            <a href="/collection/women" className="hover:text-orange-600 transition">WOMEN</a>
            <a href="/collection/top-wear" className="hover:text-orange-600 transition">TOP WEAR</a>
            <a href="/collection/bottom-wear" className="hover:text-orange-600 transition">BOTTOM WEAR</a>
          </nav>
          <div className="flex gap-6 text-2xl">
            <span className="cursor-pointer">Search</span>
            <span className="cursor-pointer">User</span>
            <span className="cursor-pointer">Cart</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-10">
        {/* Filter Sidebar */}
        <aside className="w-72 bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">{getTitle()}</h2>

          <div className="space-y-10">
            {/* Gender Filter */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Gender</h3>
              {['All', 'Men', 'Women'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={opt}
                    checked={filters.gender === opt}
                    onChange={() => handleFilterChange('gender', opt)}
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Category</h3>
              {['All', 'Top Wear', 'Bottom Wear'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={opt}
                    checked={filters.category === opt}
                    onChange={() => handleFilterChange('category', opt)}
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600 text-lg">{allProducts.length} Products Found</p>
            <select className="border border-gray-300 rounded-lg px-5 py-3 text-gray-700">
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {allProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {allProducts.length === 0 && (
            <div className="text-center py-20 text-2xl text-gray-500">
              No products found for selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;

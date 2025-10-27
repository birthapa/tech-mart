import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    color: '',
    size: [],
    material: [],
    brand: [],
    maxprice: 100,
  });

  const categories = ['All', 'Top Wear', 'Bottom Wear'];
  const genders = ['All', 'Men', 'Women'];
  const colors = ['Red', 'Blue', 'Black', 'Green', 'Yellow', 'Gray', 'White'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const materials = ['Cotton', 'Wool', 'Denim', 'Polyester', 'Silk'];
  const brands = ['Urban Threads', 'Modern Fit', 'Street Style', 'Beach Breeze'];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    setFilters({
      category: params.category || '',
      gender: params.gender || '',
      color: params.color || '',
      size: params.size ? params.size.split(',') : [],
      material: params.material ? params.material.split(',') : [],
      brand: params.brand ? params.brand.split(',') : [],
      maxprice: Number(params.maxprice) || 100,
    });
  }, [searchParams]);

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (Array.isArray(value)) {
      if (value.length === 0) {
        newParams.delete(key);
      } else {
        newParams.set(key, value.join(','));
      }
    } else {
      if (!value && value !== 0) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }

    setSearchParams(newParams);
  };

  const handleSingleToggle = (key, value) => {
    const realValue = value === 'All' ? '' : value;
    setFilters((prev) => {
      updateParams(key, realValue);
      return { ...prev, [key]: realValue };
    });
  };

  const handleCheckboxChange = (key, value) => {
    const updated = filters[key].includes(value)
      ? filters[key].filter((v) => v !== value)
      : [...filters[key], value];

    setFilters((prev) => {
      updateParams(key, updated);
      return { ...prev, [key]: updated };
    });
  };

  const handlePriceChange = (e) => {
    const val = Number(e.target.value);
    setFilters((prev) => {
      updateParams('maxprice', val);
      return { ...prev, maxprice: val };
    });
  };

  return (
    <div className="p-4 space-y-4 mt-[-30px]">
      <h3 className="text-xl font-medium text-gray-800">Filter</h3>

      {/* Category */}
      <div>
        <label className="block text-gray-600 font-medium mb-2">Category</label>
        {categories.map((category) => (
          <div key={category} className="flex items-center mb-1">
            <input
              type="radio"
              name="category"
              value={category}
              checked={filters.category === (category === 'All' ? '' : category)}
              onChange={() => handleSingleToggle('category', category)}
              className="mr-2 h-4 w-4 text-blue-500 border-gray-300"
            />
            <span>{category}</span>
          </div>
        ))}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-gray-600 font-medium mb-2">Gender</label>
        {genders.map((gender) => (
          <div key={gender} className="flex items-center mb-1">
            <input
              type="radio"
              name="gender"
              value={gender}
              checked={filters.gender === (gender === 'All' ? '' : gender)}
              onChange={() => handleSingleToggle('gender', gender)}
              className="mr-2 h-4 w-4 text-blue-500 border-gray-300"
            />
            <span>{gender}</span>
          </div>
        ))}
      </div>

      {/* Color */}
      <div>
        <label className="block text-gray-600 font-medium mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleSingleToggle('color', color)}
              className={`w-8 h-8 rounded-full border-2 ${
                filters.color === color ? 'border-black' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              aria-label={color}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-gray-600 font-medium mb-2">Size</label>
        {sizes.map((size) => (
          <div key={size} className="flex items-center mb-1">
            <input
              type="checkbox"
              value={size}
              checked={filters.size.includes(size)}
              onChange={() => handleCheckboxChange('size', size)}
              className="mr-2 h-4 w-4 text-blue-500 border-gray-300"
            />
            <span>{size}</span>
          </div>
        ))}
      </div>

      {/* Material */}
      <div>
        <label className="block text-gray-600 font-medium mb-2">Material</label>
        {materials.map((material) => (
          <div key={material} className="flex items-center mb-1">
            <input
              type="checkbox"
              value={material}
              checked={filters.material.includes(material)}
              onChange={() => handleCheckboxChange('material', material)}
              className="mr-2 h-4 w-4 text-blue-500 border-gray-300"
            />
            <span>{material}</span>
          </div>
        ))}
      </div>

      {/* Brand */}
      <div>
        <label className="block text-gray-600 font-medium mb-2">Brand</label>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-1">
            <input
              type="checkbox"
              value={brand}
              checked={filters.brand.includes(brand)}
              onChange={() => handleCheckboxChange('brand', brand)}
              className="mr-2 h-4 w-4 text-blue-500 border-gray-300"
            />
            <span>{brand}</span>
          </div>
        ))}
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-gray-600 font-medium mb-2">Price Range</label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.maxprice}
            onChange={handlePriceChange}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-700 mt-1">
            Max Price: ₹{filters.maxprice}
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>₹0</span>
          <span>₹100</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;

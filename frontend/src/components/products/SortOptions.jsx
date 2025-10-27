import React from 'react';
import { useSearchParams } from 'react-router-dom';

const SortOptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (e) => {
    const sortBy = e.target.value;
    searchParams.set('sortBy', sortBy);
    setSearchParams(searchParams);
  };

  return (
    <select
      onChange={handleSortChange}
      value={searchParams.get('sortBy') || ''}
      className="border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:ring focus:border-blue-400"
    >
      <option value="">Default</option>
      <option value="priceAsc">Price: Low to High</option>
      <option value="priceDesc">Price: High to Low</option>
      <option value="popularity">Popularity</option>
    </select>
  );
};

export default SortOptions;

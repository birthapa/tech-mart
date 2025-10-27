import { Link } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from 'react-icons/hi2';
import { IoMdClose } from 'react-icons/io';
import Searchbar from './Searchbar';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const Navbar = ({ toggleCart }) => {
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const {user} = useSelector((state) => state.auth);

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;

  const togglerNavDrawer = () => setNavDrawerOpen((open) => !open);

  const categories = [
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'Top Wear', value: 'top-wear' },
    { label: 'Bottom Wear', value: 'bottom-wear' },
  ];

  return (
    <>
      <nav className="w-full bg-white shadow-md z-40">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between py-4 px-4">
          <Link to="/" className="text-2xl font-medium ml-5">
            Tech-Mart
          </Link>

          {/* Desktop Category Links */}
          <div className="hidden md:flex space-x-6 items-center ml-10">
            {categories.map(({ label, value }) => (
              <Link
                key={label}
                to={`/collection/${value}`}
                className="text-gray-700 hover:text-black text-sm font-medium uppercase"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4 mr-5">
            {user && user.role === "admin" &&(
            <Link
              to="/admin"
              className="block bg-black px-2 py-1 rounded text-sm text-white"
            >
              Admin
            </Link>
)}

            <Link
              to="/profile"
              className="hover:text-black"
              aria-label="User Profile"
            >
              <HiOutlineUser className="h-5 w-5 text-gray-700" />
            </Link>

            <button
              onClick={toggleCart}
              className="relative hover:text-black focus:outline-none"
              aria-label="Open Cart Drawer"
              type="button"
            >
              <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#ef3e20] text-white text-xs rounded-full px-2 py-0.5">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Search (Desktop Only) */}
            <div className="hidden md:block overflow-hidden">
              <Searchbar />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={togglerNavDrawer}
              className="md:hidden"
              aria-label="Toggle Navigation Drawer"
            >
              <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <div
        className={`fixed top-[56px] left-0 w-3/4 sm:w-1/3 max-h-[80vh] bg-white shadow-lg transform transition-transform duration-300 z-50 overflow-y-auto ${
          navDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4 border-b">
          <button onClick={togglerNavDrawer} aria-label="Close Navigation Menu">
            <IoMdClose className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <nav className="space-y-4">
            {categories.map(({ label, value }) => (
              <Link
                key={label}
                to={`/collection/${value}`}
                onClick={togglerNavDrawer}
                className="block text-gray-700 hover:text-black"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;

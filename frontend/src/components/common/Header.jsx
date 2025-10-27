import Topbar from "../layout/Topbar";
import Navbar from "./Navbar";

const Header = ({ cartCount, toggleCart }) => {
  return (
    <header className="border-b border-gray-200">
      <div className="w-full">
        <Topbar />
        <Navbar cartCount={cartCount} toggleCart={toggleCart} />
      </div>
    </header>
  );
};

export default Header;

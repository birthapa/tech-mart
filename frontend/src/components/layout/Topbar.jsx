import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";

const Topbar = () => {
  return (
    <div className="bg-[#e8e2e1] text-black p-2 z-50">
      <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto">
        {/* Left Section - Brand Name + Icons */}
        <div className="flex items-center space-x-4 min-w-[120px]">
          <span className="text-sm font-bold"></span>
          <div className="flex space-x-2">
            <a href="#" className="hover:text-gray-700">
              <TbBrandMeta className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-gray-700">
              <IoLogoInstagram className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-gray-700">
              <RiTwitterXLine className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Middle Section - Text */}
        <div className="flex-1 text-center px-4 mx-auto ml-[-50px]">
          <span className="text-sm font-medium">
            We ship worldwide - Fast and reliable shipping!
          </span>
        </div>

        {/* Right Section - Contact */}
        <div className="min-w-[50px] text-right ml-[-40px]">
          <span className="text-sm font-medium whitespace-nowrap">
            +977 9848578693
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;

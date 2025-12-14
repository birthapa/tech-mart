import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );
        setNewArrivals(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNewArrivals();
  }, []);

  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });

    // Ensure button state updates after smooth scroll
    setTimeout(() => updateScrollButtons(), 400);
  };

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (container) {
      const leftScroll = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(leftScroll < maxScrollLeft - 1); // Use buffer to avoid rounding issues
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);

      // Run once after render
      setTimeout(() => updateScrollButtons(), 100);

      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
      };
    }
  }, [newArrivals]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-10 px-2 lg:px-12">
      <div className="mx-auto max-w-screen-xl px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold mb-2">Explore New Arrivals</h2>
          <p className="text-lg text-gray-600">
            Discover the latest styles straight off the runway, freshly added to
            keep your wardrobe on the cutting edge of fashion.
          </p>
        </div>

        {/* Scroll Buttons */}
        <div className="flex justify-end items-center mb-4 space-x-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-1 rounded border ${
              canScrollLeft
                ? "bg-white text-black shadow hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-1 rounded border ${
              canScrollRight
                ? "bg-white text-black shadow hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>

        {/* Scrollable Product Cards */}
        <div
          ref={scrollRef}
          className={`overflow-x-auto flex gap-2 px-1 scrollbar-hide ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {newArrivals.map((product) => (
            <div
              key={product._id}
              className="relative min-w-[350px] h-80 overflow-hidden shadow-lg hover:shadow-xl transition duration-300"
            >
              <img
                src={product.images[0]?.url}
                alt={product.images[0]?.altText}
                className="w-full h-full object-cover"
                draggable="false"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 text-black font-bold px-4 py-3">
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm">${product.price}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;

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
  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH NEW ARRIVALS
  ======================= */
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );

        // Ensure array always
        setNewArrivals(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch new arrivals:", error);
        setNewArrivals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  /* =======================
     SCROLL HANDLING
  ======================= */
  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });

    setTimeout(updateScrollButtons, 400);
  };

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;

    const leftScroll = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    setCanScrollLeft(leftScroll > 0);
    setCanScrollRight(leftScroll < maxScrollLeft - 1);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateScrollButtons);
    setTimeout(updateScrollButtons, 100);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
    };
  }, [newArrivals]);

  /* =======================
     DRAG SCROLL
  ======================= */
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <section className="py-10 px-2 lg:px-12">
      <div className="mx-auto max-w-screen-xl px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold mb-2">Explore New Arrivals</h2>
          <p className="text-lg text-gray-600">
            Discover the latest styles freshly added to Tech-Mart.
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

        {/* Products */}
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
          {loading && (
            <p className="text-gray-500">Loading new arrivals...</p>
          )}

          {!loading && newArrivals.length === 0 && (
            <p className="text-gray-500">No new arrivals found.</p>
          )}

          {!loading &&
            newArrivals.map((product) => (
              <div
                key={product._id}
                className="relative min-w-[350px] h-80 overflow-hidden shadow-lg hover:shadow-xl transition duration-300"
              >
                <img
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.images?.[0]?.altText || product.name}
                  className="w-full h-full object-cover"
                  draggable="false"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 text-black font-bold px-4 py-3">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm">Rs. {product.price}</p>
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

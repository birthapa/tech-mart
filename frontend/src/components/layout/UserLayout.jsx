import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../common/Footer";
import Header from "../common/Header";
import CartDrawer from "./CartDrawer";

const UserLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartProducts, setCartProducts] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartProducts(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  // Save cart to localStorage on cart change
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartProducts));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cartProducts]);

  const toggleCart = () => setDrawerOpen((open) => !open);

  const addToCart = (product) => {
    setCartProducts((prev) => {
      const existing = prev.find(
        (p) =>
          p.id === product.id &&
          p.size === product.size &&
          p.color === product.color
      );

      if (existing) {
        return prev.map((p) =>
          p.id === product.id &&
          p.size === product.size &&
          p.color === product.color
            ? { ...p, quantity: p.quantity + (product.quantity || 1) }
            : p
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            size: product.size,
            color: product.color,
            image: product.image,
            quantity: product.quantity || 1,
          },
        ];
      }
    });

    setDrawerOpen(true); // Open drawer when item is added
  };

  const updateQuantity = (id, size, color, quantity) => {
    if (quantity < 1) return;
    setCartProducts((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (id, size, color) => {
    setCartProducts((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && item.size === size && item.color === color)
      )
    );
  };

  const cartCount = cartProducts.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} toggleCart={toggleCart} />
      <div className="flex flex-col min-h-screen pt-[80px] md:pt-[100px]">
        <main className="flex-grow">
          <Outlet context={{ addToCart, cartProducts: cartProducts || [] }} />
        </main>

        <Footer />

        <CartDrawer
          isOpen={drawerOpen}
          toggleCart={toggleCart}
          products={cartProducts}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      </div>
    </>
  );
};

export default UserLayout;

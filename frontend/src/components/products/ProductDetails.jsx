import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import {
  fetchProductDetails,
  fetchSimilarProducts
} from "../../redux/slices/productsSlice"; 
import { addToCart } from "../../redux/slices/cartSlice";

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { user, guestId } = useSelector((state) => state.auth);

  const { addToCart: contextAddToCart, toggleCart } = useOutletContext();

  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const productFetchId = productId || id;

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts({ id: productFetchId }));
    }
  }, [dispatch, productFetchId]);

  useEffect(() => {
    if (selectedProduct?.images?.length) {
      setMainImage(selectedProduct.images[0].url);
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color");
      return;
    }

    setIsButtonDisabled(true);

    dispatch(
      addToCart({
        productId: productFetchId,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity,
        size: selectedSize,
        color: selectedColor,
        image: selectedProduct.images?.[0]?.url || selectedProduct.images?.[0] || "",
        guestId,
        userId: user?._id,
      })
    )
      .then(() => {
        toast.success("Product added to cart!", { duration: 1000 });
      })
      .catch(() => {
        toast.error("Failed to add product to cart.");
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!selectedProduct) return <p>Product not found.</p>;

  return (
    <div className="max-w-7xl mx-auto p-14 mt-[-120px]">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2">
          <img
            src={mainImage}
            alt={selectedProduct.name}
            className="w-full h-auto rounded-lg"
          />
          <div className="flex gap-2 mt-4">
            {selectedProduct.images?.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`${selectedProduct.name} thumbnail ${index + 1}`}
                className="w-20 h-20 object-cover rounded cursor-pointer"
                onClick={() => setMainImage(img.url)}
              />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{selectedProduct.name}</h1>
          <p className="text-xl text-gray-600 mb-4">Rs. {selectedProduct.price?.toFixed(2)}</p>
          <p className="mb-4">{selectedProduct.description}</p>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Size</h3>
            <div className="flex gap-2">
              {selectedProduct.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded ${selectedSize === size ? "border-black" : "border-gray-300"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Color</h3>
            <div className="flex gap-2">
              {selectedProduct.colors?.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? "border-black" : "border-gray-300"}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 border rounded"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedColor || isButtonDisabled}
            className="w-full bg-black text-white py-3 rounded disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">
          You May Also Like
        </h2>
        <ProductGrid
          products={similarProducts?.length ? similarProducts : []}
          loading={loading}
          error={null}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
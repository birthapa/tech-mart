// frontend/src/components/admin/EditProductPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchProductDetails } from "../../redux/slices/productsSlice";

const EditProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products: adminProducts, loading, error } = useSelector((state) => state.adminProducts);

  const product = adminProducts.find((p) => p._id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    countInStock: "",
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    material: "",
    gender: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!product && id) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, id, product]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        discountPrice: product.discountPrice || "",
        countInStock: product.countInStock || "",
        sku: product.sku || "",
        category: product.category || "",
        brand: product.brand || "",
        sizes: product.sizes || [],
        colors: product.colors || [],
        material: product.material || "",
        gender: product.gender || "",
      });

      if (product.images && product.images.length > 0) {
        const img = typeof product.images[0] === "string" ? product.images[0] : product.images[0].url;
        setImagePreview(img);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.split(",").map((item) => item.trim()).filter(Boolean),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file)); // Preview only
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Start with current image URL (from Cloudinary or existing)
    let finalImageUrl = imagePreview;

    // If user selected a new image, upload it first
    if (newImage) {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("image", newImage);

      try {
        const token = localStorage.getItem("userToken");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          toast.error(uploadData.message || "Image upload failed");
          setUploading(false);
          return;
        }

        // THIS IS THE FIX: Use the returned Cloudinary URL
        finalImageUrl = uploadData.imageUrl;
      } catch (err) {
        toast.error("Image upload failed");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Now save the product with correct image URL
    try {
      const updatedData = {
        ...formData,
        images: [finalImageUrl], // Send array with real Cloudinary URL
      };

      const token = localStorage.getItem("userToken");
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      } else {
        toast.error(result.message || "Failed to update product");
      }
    } catch (err) {
      toast.error("Server error during save");
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-600">Loading product...</p>;
  if (error) return <p className="text-center py-12 text-red-600">Error: {error}</p>;
  if (!product) return <p className="text-center py-12 text-gray-600">Product not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-8">Edit Product: {product.name}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (NPR)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discount Price</label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stock</label>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sizes (comma separated)</label>
            <input
              type="text"
              name="sizes"
              value={formData.sizes.join(", ")}
              onChange={handleArrayChange}
              placeholder="S, M, L, XL"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Colors (comma separated)</label>
            <input
              type="text"
              name="colors"
              value={formData.colors.join(", ")}
              onChange={handleArrayChange}
              placeholder="Red, Blue, Black"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-lg font-medium mb-4">Product Image</label>
          <div className="flex items-center gap-8">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Current product"
                className="w-64 h-64 object-cover rounded border shadow"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-200 border-2 border-dashed rounded flex items-center justify-center">
                <p className="text-gray-500">No image</p>
              </div>
            )}

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="image-upload"
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              >
                Choose New Image
              </label>
              {newImage && <p className="mt-2 text-sm text-gray-600">Selected: {newImage.name}</p>}
              {uploading && <p className="mt-2 text-sm text-blue-600">Uploading image...</p>}
            </div>
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {uploading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
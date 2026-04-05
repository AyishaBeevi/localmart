import { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: ""
  });

  const [existingImages, setExistingImages] = useState([]);
const [newImages, setNewImages] = useState([]);
const [previewImages, setPreviewImages] = useState([]);
const [dragIndex, setDragIndex] = useState(null);
  /* ---------------- FETCH PRODUCT ---------------- */
 useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      const data = res.data;

      setForm({
        title: data.title || "",
        description: data.description || "",
        price: data.price || "",
        category: data.category || "",
        location: data.location || ""
      });

      // ✅ FIXED — NOW INSIDE SCOPE
      const imgs = Array.isArray(data.images)
        ? data.images
        : data.images
        ? [data.images]
        : [];

      setExistingImages(imgs);
      setPreviewImages(imgs);

      setLoading(false);

    } catch (err) {
      console.error(err);
    }
  };

  fetchProduct();
}, [id]);
const handleNewImages = (e) => {
  const files = Array.from(e.target.files);

  const previews = files.map(f => URL.createObjectURL(f));

  setNewImages(prev => [...prev, ...files]);
  setPreviewImages(prev => [...prev, ...previews]);
};

const removeImage = (index) => {
  setPreviewImages(prev => prev.filter((_, i) => i !== index));
};

const handleDragStart = (index) => setDragIndex(index);

const handleDrop = (index) => {
  if (dragIndex === null) return;

  const updated = [...previewImages];
  const [moved] = updated.splice(dragIndex, 1);
  updated.splice(index, 0, moved);

  setPreviewImages(updated);
  setDragIndex(null);
};
  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     await API.put(`/products/slug/${id}`, form);

      // 👇 redirect after resubmit
      navigate("/my-listings");

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  /* ---------------- UI ---------------- */
 return (
  <div className="max-w-7xl mx-auto px-4 py-10">

    {/* HEADER */}
    <div className="mb-10">
      <h2 className="text-5xl font-bold bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
        Edit Listing
      </h2>
      <p className="text-textMuted mt-2 text-sm">
        Improve your product and get it approved.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">

      {/* LEFT — FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-6 space-y-5 shadow">

          <h3 className="font-semibold text-lg">Product Details</h3>

          {/* TITLE */}
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Product title"
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 outline-none"
            required
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Description"
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 outline-none"
            required
          />

          {/* PRICE */}
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price ₹"
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 outline-none"
            required
          />

          {/* CATEGORY */}
          <select
            value={form.category}
            onChange={(e)=>setForm({...form,category:e.target.value})}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 outline-none"
          >
            <option value="electronics">Electronics</option>
            <option value="vehicles">Vehicles</option>
            <option value="furniture">Furniture</option>
            <option value="pets">Pets</option>
            <option value="books">Books</option>
            <option value="sports">Sports</option>
            <option value="fashion">Fashion</option>
            <option value="others">Others</option>
          </select>

          {/* LOCATION */}
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40 outline-none"
          />

        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">

          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-brand to-purple-500 text-white py-3 rounded-xl font-semibold shadow hover:scale-[1.02] transition"
          >
            Save & Resubmit
          </button>

          <button
            type="button"
            onClick={() => navigate("/my-listings")}
            className="flex-1 border py-3 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>

        </div>

      </form>

      {/* RIGHT — LIVE PREVIEW */}
      <div className="sticky top-20 space-y-4">

  {/* IMAGE EDITOR */}
  <div className="bg-white rounded-2xl shadow-xl p-4">

    <h3 className="font-semibold mb-3">Images</h3>

    {/* UPLOAD */}
    <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
      <p className="text-sm">Add more images</p>
      <input
        type="file"
        multiple
        className="hidden"
        onChange={handleNewImages}
      />
    </label>

    {/* GRID */}
    {previewImages.length > 0 && (
      <div className="grid grid-cols-3 gap-3 mt-4">

        {previewImages.map((img, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e)=>e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="relative group cursor-move"
          >

            <img
              src={img}
              className="w-full h-24 object-cover rounded-lg"
            />

            {/* COVER */}
            {index === 0 && (
              <span className="absolute top-1 left-1 text-[10px] bg-brand text-white px-2 rounded">
                cover
              </span>
            )}

            {/* REMOVE */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>

          </div>
        ))}

      </div>
    )}

  </div>

  {/* LIVE PREVIEW */}
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

    <div className="h-56 bg-gray-100">
      {previewImages[0] ? (
        <img src={previewImages[0]} className="w-full h-full object-cover"/>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          No image
        </div>
      )}
    </div>

    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-lg">
        {form.title || "Product Title"}
      </h3>

      <p className="text-brand font-bold text-xl">
        ₹ {form.price || "0"}
      </p>

      <p className="text-xs text-gray-500 line-clamp-3">
        {form.description || "Description preview..."}
      </p>

      <p className="text-xs text-gray-400">
        📍 {form.location || "Location"}
      </p>
    </div>

  </div>

      </div>

    </div>
  </div>
);
}

export default EditProduct;
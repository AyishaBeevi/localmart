import { useState, useEffect } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CreateProduct() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "electronics",
    condition: "used",
    location: ""
  });

  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  /* ---------------- USER FETCH ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  /* ---------------- SUBSCRIPTION LOGIC ---------------- */
  const now = new Date();

  const expiryDate = user?.subscriptionExpiry
    ? new Date(user.subscriptionExpiry)
    : null;

  const isAdmin = user?.role === "admin";

const isSeller = user?.subscription === "seller";

const isExpired =
  isSeller &&
  expiryDate &&
  expiryDate < now;

const isFreeUser = !isSeller && !isAdmin;

//  MAIN CONTROL (ADMIN BYPASS)
const isBlocked = !isAdmin && isExpired;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error("Your subscription has expired");
      navigate("/upgrade");
      return;
    }

    try {
      setLoadingPost(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      for (let img of images) {
        formData.append("images", img);
      }

      await API.post("/products", formData);

     toast.success("Product posted successfully");

setTimeout(() => {
  navigate("/");
}, 1500);

    } catch (err) {

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message;

        if (status === 403) {
          toast.error(message || "Access denied");
          navigate("/upgrade");
          return;
        }

        toast.error(message || "Something went wrong");
      } else {
        toast.error("Server not reachable");
      }

    } finally {
      setLoadingPost(false);
    }
  };
const handleImageChange = (e) => {
  const files = Array.from(e.target.files);

  const valid = files.filter(file =>
    file.type.startsWith("image/") && file.size < 5 * 1024 * 1024
  );

  if (valid.length !== files.length) {
    toast.error("Only images under 5MB allowed");
  }

  const newImages = [...images, ...valid];
  setImages(newImages);

  const previews = newImages.map(file => URL.createObjectURL(file));
  setPreviewImages(previews);
};

 const handleDrop = (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  handleImageChange({ target: { files } });
};

const handleDragOver = (e) => e.preventDefault();

const removeImage = (index) => {
  const newImages = images.filter((_, i) => i !== index);
  setImages(newImages);
  setPreviewImages(newImages.map(file => URL.createObjectURL(file)));
};

const handleDragStart = (index) => {
  setDraggedIndex(index);
};

const handleDropReorder = (index) => {
  if (draggedIndex === null) return;

  const updated = [...images];
  const [moved] = updated.splice(draggedIndex, 1);
  updated.splice(index, 0, moved);

  setImages(updated);
  setPreviewImages(updated.map(file => URL.createObjectURL(file)));
  setDraggedIndex(null);
};

const [draggedIndex, setDraggedIndex] = useState(null);
  /* ---------------- AI ---------------- */
  const generateAI = async () => {
    try {
      setLoadingAI(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
  title: form.title,
  category: form.category,
  price: form.price
  })
});
      const data = await res.json();

      setForm(prev => ({
        ...prev,
        description: data.description
      }));

    } catch {
      toast.error("AI generation failed");
    } finally {
      setLoadingAI(false);
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

 return (
  <div className="max-w-7xl mx-auto px-4 py-10">

    {/* HEADER */}
    <div className="mb-10">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-brand to-purple-500 bg-clip-text text-transparent">
        Create Listing
      </h1>
      <p className="text-textMuted mt-2 text-sm">
        High quality listings sell faster. Make it count.
      </p>
    </div>

    {/* STATUS (UNCHANGED LOGIC) */}
    {isSeller && !isExpired && (
      <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 mb-6">
        <p className="text-green-700 text-sm font-medium">
          ✅ Active seller — unlimited listings enabled
        </p>
      </div>
    )}

    {isSeller && isExpired && (
      <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 mb-6 flex justify-between items-center">
        <p className="text-red-600 text-sm font-medium">
          ❌ Subscription expired — posting disabled
        </p>
        <button
          onClick={() => navigate("/upgrade")}
          className="bg-gradient-to-r from-brand to-brand/80 text-white px-4 py-2 rounded-lg text-sm"
        >
          Renew
        </button>
      </div>
    )}

    {isFreeUser && !isAdmin && (
      <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 mb-6 flex justify-between items-center">
        <p className="text-sm text-yellow-700">
          ⚠️ Only <b>1 listing</b> allowed. Upgrade for unlimited.
        </p>
        <button
          onClick={() => navigate("/upgrade")}
          className="bg-gradient-to-r from-brand to-brand/80 text-white px-4 py-2 rounded-lg text-sm"
        >
          Upgrade
        </button>
      </div>
    )}

    {isAdmin && (
      <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 mb-6">
        <p className="text-blue-700 text-sm font-medium">
          👑 Admin — no limits
        </p>
      </div>
    )}

    <div className="grid md:grid-cols-2 gap-8">

      {/* LEFT SIDE FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* PRODUCT DETAILS */}
        <div className={`bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-6 space-y-5 shadow ${isBlocked ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="font-semibold text-lg">Product Details</h2>

          <input
            placeholder="Product title"
            value={form.title}
            onChange={(e)=>setForm({...form,title:e.target.value})}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/40"
            required
          />

          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Description</label>

            <button
              type="button"
              onClick={generateAI}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full"
            >
              {loadingAI ? "Generating..." : "AI Generate"}
            </button>
          </div>

          <textarea
            value={form.description}
            onChange={(e)=>setForm({...form,description:e.target.value})}
            className="w-full border rounded-xl px-4 py-3 h-32 text-sm"
            placeholder="Describe your product..."
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-xl px-4 py-3 text-sm"
              value={form.category}
              onChange={(e)=>setForm({...form,category:e.target.value})}
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

            <select
              className="border rounded-xl px-4 py-3 text-sm"
              value={form.condition}
              onChange={(e)=>setForm({...form,condition:e.target.value})}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
        </div>

        {/* PRICE */}
        <div className="bg-white/80 border rounded-2xl p-6 space-y-4 shadow">
          <h2 className="font-semibold">Pricing</h2>

          <input
            type="number"
            placeholder="₹ Price"
            value={form.price}
            onChange={(e)=>setForm({...form,price:e.target.value})}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e)=>setForm({...form,location:e.target.value})}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        {/* FINAL BOSS UPLOAD */}
        <div className="bg-white/80 border rounded-2xl p-6 shadow space-y-4">

          <h2 className="font-semibold">Images</h2>

          {/* CLICKABLE DROP ZONE */}
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition"
          >
            <p className="text-sm font-medium">Upload or drag images</p>
            <p className="text-xs text-gray-400">Max 5MB • JPG/PNG</p>

            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* PREVIEW */}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-4">

              {previewImages.map((img, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e)=>e.preventDefault()}
                  onDrop={() => handleDropReorder(index)}
                  className="relative group"
                >

                  <img
                    src={img}
                    className="w-full h-28 object-cover rounded-xl"
                  />

                  {/* PRIMARY BADGE */}
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-brand text-white text-[10px] px-2 py-[2px] rounded">
                      cover
                    </span>
                  )}

                  {/* REMOVE */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* SUBMIT */}
        <button
          disabled={loadingPost || isBlocked}
          className="w-full py-4 rounded-2xl text-white font-semibold bg-gradient-to-r from-brand to-purple-500 shadow-lg hover:scale-[1.02]"
        >
          {loadingPost ? "Posting..." : "Post Product"}
        </button>

      </form>

      {/* RIGHT SIDE PREVIEW */}
      <div className="sticky top-20">

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          <div className="h-56 bg-gray-100">
            {previewImages[0] ? (
              <img src={previewImages[0]} className="w-full h-full object-cover"/>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No preview
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



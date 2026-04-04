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

// 🔥 MAIN CONTROL (ADMIN BYPASS)
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
      navigate("/");

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
    condition: form.condition
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
    <div className="max-w-4xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-2">Sell an Item</h1>
      <p className="text-textMuted mb-6">
        Fill in the details below to list your product.
      </p>

      {/* ---------------- STATUS BANNERS ---------------- */}

      {/* ACTIVE SELLER */}
      {isSeller && !isExpired && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 text-sm">
            ✅ Active seller — unlimited listings enabled
          </p>
        </div>
      )}

      {/* EXPIRED SELLER */}
      {isSeller && isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <p className="text-red-700 text-sm">
            ❌ Subscription expired — posting disabled
          </p>

          <button
            onClick={() => navigate("/upgrade")}
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm"
          >
            Renew
          </button>
        </div>
      )}

      {/* FREE USER */}
      {isFreeUser && !isAdmin &&  (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <p className="text-sm text-yellow-800">
      ⚠️ You can post only <b>1 product</b> on a free account.  
      Upgrade to a seller plan to post unlimited listings.
    </p>

          <button
            onClick={() => navigate("/upgrade")}
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm"
          >
            Upgrade
          </button>
        </div>
      )}

      {isAdmin && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <p className="text-blue-700 text-sm">
      👑 Admin access — no posting limits
    </p>
  </div>
)}

      {/* ---------------- FORM ---------------- */}

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className={`bg-white border rounded-xl p-6 space-y-4 ${isBlocked ? "opacity-50 pointer-events-none" : ""}`}>

          <h2 className="font-semibold text-lg">Product Details</h2>

          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Product title"
            value={form.title}
            onChange={(e)=>setForm({...form,title:e.target.value})}
            required
          />

          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Description</label>

            <button
              type="button"
              onClick={generateAI}
              disabled={isBlocked}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
            >
              {loadingAI ? "Generating..." : "AI Generate"}
            </button>
          </div>

          <textarea
            className="w-full border rounded-lg px-4 py-2 h-32"
            placeholder="Describe your product..."
            value={form.description}
            onChange={(e)=>setForm({...form,description:e.target.value})}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded-lg px-4 py-2"
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
              className="border rounded-lg px-4 py-2"
              value={form.condition}
              onChange={(e)=>setForm({...form,condition:e.target.value})}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
        </div>

        <div className={`bg-white border rounded-xl p-6 space-y-4 ${isBlocked ? "opacity-50 pointer-events-none" : ""}`}>

          <h2 className="font-semibold text-lg">Pricing & Location</h2>

          <input
            type="number"
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Price (₹)"
            value={form.price}
            onChange={(e)=>setForm({...form,price:e.target.value})}
            required
          />

          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Location"
            value={form.location}
            onChange={(e)=>setForm({...form,location:e.target.value})}
            required
          />
        </div>

        <div className={`bg-white border rounded-xl p-6 space-y-4 ${isBlocked ? "opacity-50 pointer-events-none" : ""}`}>

          <h2 className="font-semibold text-lg">Product Images</h2>

          <input
            type="file"
            multiple
            onChange={(e)=>setImages(e.target.files)}
          />
        </div>

        <button
          disabled={loadingPost || isBlocked}
          className={`w-full py-3 rounded-xl font-medium ${
            isBlocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-brand text-white hover:opacity-90"
          }`}
        >
          {isBlocked ? "Subscription Required" : (loadingPost ? "Posting..." : "Post Product")}
        </button>

      </form>

    </div>
  );
}



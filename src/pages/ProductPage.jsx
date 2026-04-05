import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import toast from "react-hot-toast";
import { handleError } from "../utils/errorHandler";
import { Helmet } from "react-helmet-async";
import API from "../utils/api";

function ProductPage() {

  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showReport, setShowReport] = useState(false);
  const [reportDetails, setReportDetails] = useState("");
const [reportReason, setReportReason] = useState("");

const baseUrl = window.location.origin;

 const toggleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Login required");
      return;
    }

    const res = await API.post(
      `/users/save-product/${product.slug}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const isSaved = res.data.savedProducts.some(
      (id) => id.toString() === product._id.toString()
    );

    setSaved(isSaved);

    toast.success(isSaved ? "Saved ❤️" : "Removed from saved");

  } catch (err) {
    handleError("Save toggle error", err);
    toast.error("Failed to update saved items");
  }
};

  
  // START CHAT
  const startChat = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Login to chat with seller");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

      return;
    }

    const res = await API.post(
      "/chat/start",
      {
        sellerId: product.user._id,
        slug: product.slug
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    navigate(`/chat/${res.data._id}`);

  } catch (err) {
    handleError("Chat start error", err);
    toast.error("Failed to start chat");
  }
};

  // FETCH PRODUCT
  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const res = await API.get(`/products/${slug}`);

        setProduct(res.data);

        if (res.data.images?.length) {
          setSelectedImage(res.data.images[0]);
        }

        // // FETCH SIMILAR PRODUCTS
        if (res.data.category) {

          const similar = await API.get(
            `/products/category/${res.data.category}`
          );

          setSimilarProducts(
            similar.data.filter((p) => p._id !== res.data._id)
          );

        }

      } catch (err) {
        // handleError("Failed to load product", err);
        console.error(err.response?.data || err.message);
      }

      setLoading(false);
    };

    fetchProduct();

  }, [slug]);


  if (loading) {
    return (
      <div className="p-20 text-center text-textMuted">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-20 text-center text-red-500">
        Product not found
      </div>
    );
  }

const reportProduct = async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login to report listings");
    return;
  }

  if (!reportReason) {
    toast.error("Please select a reason");
    return;
  }

  try {

    await API.post(
      "/reports",
      {
        slug: product.slug,
        reason: reportReason,
        details: reportDetails
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    toast.success("Report submitted");

    setShowReport(false);
    setReportReason("");
    setReportDetails("");

  } catch (err) {

    handleError(err);
    toast.error("Failed to submit report");

  }

};
  return (
<div className="max-w-7xl mx-auto px-6 py-12">

  {/* PRODUCT */}
  <div className="grid md:grid-cols-2 gap-16">

    {/* 🔥 LEFT - IMAGE */}
    <div className="sticky top-24 h-fit">

      <div className="rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-xl">
        <Zoom>
          {selectedImage && (
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-[480px] object-cover transition duration-500 hover:scale-105"
            />
          )}
        </Zoom>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 mt-4 flex-wrap">
        {product.images?.map((img, i) => (
          <img
            key={i}
            src={img}
            onClick={() => setSelectedImage(img)}
            className={`w-20 h-20 rounded-xl object-cover cursor-pointer border transition 
              ${selectedImage === img
                ? "border-black scale-105"
                : "border-gray-200 hover:scale-105"
              }`}
          />
        ))}
      </div>
    </div>

    {/* RIGHT - INFO */}
    <div className="flex flex-col gap-6">

      {/* TITLE */}
      <h1 className="text-4xl font-bold leading-tight">
        {product.title}
      </h1>

      {/* PRICE */}
      <div className="text-3xl font-semibold text-green-600">
        ₹{product.price}
      </div>

      {/* DESCRIPTION */}
      <p className="text-gray-600 leading-relaxed">
        {product.description}
      </p>

      {/* ACTIONS */}
      <div className="flex gap-3">

        <button
          onClick={toggleSave}
          className="px-6 py-2 rounded-full border border-gray-300 
          hover:bg-gray-100 transition"
        >
          {saved ? "Saved ❤️" : "Save ♡"}
        </button>

        <button
          onClick={startChat}
          className="px-6 py-2 rounded-full 
          bg-gradient-to-r from-purple-600 to-blue-500 
          text-white hover:opacity-90 transition"
        >
          Chat with Seller
        </button>

      </div>

      {/* SELLER CARD */}
      <div className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-2xl p-5 shadow-sm flex justify-between items-center">

        <Link
          to={`/seller/${product.user?._id}`}
          className="flex items-center gap-4"
        >
          <img
            src={
              product.user?.avatar ||
              `https://ui-avatars.com/api/?name=${product.user?.name}`
            }
            className="w-14 h-14 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold text-lg">
              {product.user?.name}
            </p>
            <p className="text-sm text-gray-500">Verified Seller</p>
          </div>
        </Link>

        <button
          onClick={startChat}
          className="px-5 py-2 rounded-lg bg-black text-white hover:opacity-90"
        >
          Message
        </button>
      </div>

      {/* DETAILS */}
      <div className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-2xl p-6 shadow-sm">

        <h2 className="font-semibold text-lg mb-4">
          Product Details
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">

          <div className="text-gray-500">Category</div>
          <div className="font-medium">{product.category}</div>

          <div className="text-gray-500">Condition</div>
          <div className="font-medium">
            {product.condition || "New"}
          </div>

          <div className="text-gray-500">Listed On</div>
          <div className="font-medium">
            {new Date(product.createdAt).toDateString()}
          </div>

        </div>
      </div>

      {/* REPORT */}
      <button
        onClick={() => setShowReport(true)}
        className="text-red-500 text-sm hover:underline"
      >
        Report listing
      </button>
      {showReport && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setShowReport(false)}
    />

    {/* MODAL */}
    <div className="relative w-[420px] rounded-2xl bg-white shadow-2xl border border-gray-200 p-6">

      {/* TITLE */}
      <h2 className="text-xl font-semibold mb-4">
        Report Listing
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Help us keep the platform safe. Select a reason:
      </p>

      {/* REASONS */}
      <div className="space-y-2">
        {["Spam","Scam","Fake listing","Wrong category"].map(r => (
          <label
            key={r}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
              ${
                reportReason === r
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
          >
            <input
              type="radio"
              value={r}
              checked={reportReason === r}
              onChange={(e) => setReportReason(e.target.value)}
              className="accent-red-500"
            />
            <span className="text-sm">{r}</span>
          </label>
        ))}
      </div>

      {/* TEXTAREA */}
      <textarea
        value={reportDetails}
        onChange={(e) => setReportDetails(e.target.value)}
        placeholder="Additional details (optional)"
        className="w-full mt-4 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
        rows={3}
      />

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 mt-5">

        <button
          onClick={() => setShowReport(false)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          disabled={!reportReason}
          onClick={reportProduct}
          className="px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition"
        >
          Submit Report
        </button>

      </div>

    </div>
  </div>
)}

    </div>
  </div>

  {/* 🔥 SIMILAR PRODUCTS */}
  {similarProducts.length > 0 && (
    <div className="mt-20">

      <h2 className="text-2xl font-bold mb-8">
        Similar Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {similarProducts.slice(0, 8).map(item => (
          <Link
            key={item._id}
            to={`/product/${item.slug}`}
            className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition"
          >
            <div className="overflow-hidden">
              <img
                src={item.images?.[0]}
                className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            <div className="p-4">
              <p className="truncate font-semibold">
                {item.title}
              </p>
              <p className="text-green-600 font-bold">
                ₹{item.price}
              </p>
            </div>
          </Link>
        ))}

      </div>
    </div>
  )}
</div>
);
}

export default ProductPage;
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

function ProductCard({
  slug,
  title,
  price,
  image,
  sellerId,
  sellerName,
  sellerSubscription
}) {
  const navigate = useNavigate();

  const startChat = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await API.post(
        "/chat/start",
        { sellerId, slug },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error("Chat start error:", err);
    }
  };

  return (
    <Link to={`/product/${slug}`} className="block">
      <div className="group rounded-2xl overflow-hidden border border-gray-200 bg-white/80 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">

          <img
            src={image}
            alt={title}
            onError={(e) => (e.target.src = "/placeholder.png")}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />

          {/* gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />

          {/* VERIFIED */}
          {sellerSubscription === "seller" && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-xs px-3 py-1 rounded-full font-medium shadow">
              ⭐ Verified
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4">

          {/* PRICE */}
          <div className="text-xl font-bold text-gray-900 mb-1">
            ₹{price}
          </div>

          {/* TITLE */}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10">
            {title}
          </h3>

          {/* SELLER */}
          <p className="text-xs text-gray-500 mt-2">
            Sold by <span className="text-gray-800 font-medium">{sellerName}</span>
          </p>

          {/* BUTTON */}
          <button
            onClick={startChat}
            className="w-full mt-4 py-2 rounded-lg text-sm font-medium 
            bg-gradient-to-r from-purple-500 to-blue-500 
            text-white hover:opacity-90 transition"
          >
            Chat with Seller
          </button>

        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
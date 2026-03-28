import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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
      {
        sellerId,
        slug 
      },
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
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">

      {/* IMAGE */}
      <div className="relative aspect-square bg-bg overflow-hidden">
        <img
          src={image || "/placeholder.jpg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {sellerSubscription === "seller" && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-3 py-1 rounded-full font-medium">
            ⭐ Verified Seller
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">

        {/* PRICE */}
        <div className="text-xl font-bold text-textDark mb-1">
          ₹{price}
        </div>

        {/* TITLE */}
        <h3 className="text-sm font-medium text-textDark line-clamp-2 h-10">
          {title}
        </h3>

        {/* SELLER */}
        <p className="text-xs text-textMuted mt-2">
          Sold by <span className="text-textDark font-medium">{sellerName}</span>
        </p>

        {/* CHAT BUTTON */}
        <button
          onClick={startChat}
          className="
            w-full mt-4
            border border-border
            text-textDark
            py-2 rounded-lg text-sm font-medium
            bg-brand text-white
            transition
          "
        >
          Chat with Seller
        </button>

      </div>
    </div>
  </Link>
);
}

export default ProductCard;
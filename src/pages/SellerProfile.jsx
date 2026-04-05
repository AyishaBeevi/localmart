import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { handleError } from "../utils/errorHandler";

function SellerProfile() {

  const { id } = useParams(); 

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await API.get(`/products/seller/${id}`);

        setSeller(res.data.seller);
        setProducts(res.data.products);

      } catch (err) {
        handleError("Error loading seller:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [id]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading seller...
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 mb-4">Failed to load seller</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (!seller) {
    return (
      <div className="p-10 text-center text-gray-500">
        Seller not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/*  SELLER HEADER */}
      <div className="mb-10 
      bg-white/80 dark:bg-white/5 backdrop-blur-xl 
      border border-white/30 dark:border-white/10 
      rounded-3xl p-6 shadow-md">

        <div className="flex items-center gap-6">

          <img
            src={
              seller.avatar ||
              `https://ui-avatars.com/api/?name=${seller.name}`
            }
            className="w-20 h-20 rounded-full object-cover"
          />

          <div>
            <h1 className="text-3xl font-bold text-black dark:text-black">
              {seller.name}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Member since {new Date(seller.createdAt).toLocaleDateString()}
            </p>

            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              Listings: {products.length}
            </p>
          </div>

        </div>

      </div>

      {/*  PRODUCTS */}
      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          No active listings
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {products.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >

              <Link
                to={`/product/${p.slug}`} 
                className="group block rounded-2xl overflow-hidden 
                bg-white/80 dark:bg-white/5 backdrop-blur-xl
                border border-white/30 dark:border-white/10 
                shadow-sm hover:shadow-xl transition"
              >

                <div className="overflow-hidden">
                  <img
                    src={p.images?.[0]}
                    className="h-44 w-full object-cover 
                    group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="p-4">

                  <h3 className="font-semibold text-black dark:text-white truncate">
                    {p.title}
                  </h3>

                  <p className="text-green-600 font-bold mt-1">
                    ₹{p.price}
                  </p>

                </div>

              </Link>

            </motion.div>
          ))}

        </div>
      )}

    </div>
  );
}

export default SellerProfile;
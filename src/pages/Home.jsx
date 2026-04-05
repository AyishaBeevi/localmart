import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../utils/api";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import {
  Laptop,
  Car,
  Shirt,
  Sofa,
  Dumbbell,
  Book,
  PawPrint
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, useScroll, useTransform } from "framer-motion";

function Home() {
  const location = useLocation();

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -100]);
  const glowY = useTransform(scrollY, [0, 300], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.92]);
const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  const categories = [
    { icon: Laptop, name: "Electronics" },
    { icon: Car, name: "Vehicles" },
    { icon: Shirt, name: "Fashion" },
    { icon: Sofa, name: "Furniture" },
    { icon: Dumbbell, name: "Sports" },
    { icon: Book, name: "Books" },
    { icon: PawPrint, name: "Pets" }
  ];

  const params = new URLSearchParams(location.search);
  const keyword = params.get("q") || "";

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);


  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/products", {
        params: { q: keyword, page, category, minPrice, maxPrice }
      });

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, page, category, minPrice, maxPrice]);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleApplyFilters = () => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      toast.error("Min price cannot be greater than Max price");
      return;
    }
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8fb] dark:bg-[#0b0b0f] text-black dark:text-white transition-colors duration-300">

      {/* BACKGROUND */}
      <motion.div
        style={{ y: glowY }}
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] 
        bg-gradient-to-r from-purple-300 via-pink-200 to-blue-200 
        dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 
        opacity-30 blur-3xl rounded-full z-0"
      />

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 
          bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)]
          dark:bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)]
          bg-[size:40px_40px]" />
      </div>

      {/* HERO */}
      {!keyword && (
       <motion.section
  style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
  className="relative z-10 text-center pt-16 pb-8"
>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 
            bg-gradient-to-r from-black via-gray-700 to-gray-500 
            dark:from-white dark:via-gray-300 dark:to-gray-500 
            bg-clip-text text-transparent"
          >
            Buy & Sell Anything Near You
          </motion.h1>

          <motion.p className="text-gray-600 dark:text-gray-400 mb-12">
            Discover trusted listings from people in your area
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 rounded-3xl shadow-xl max-w-5xl mx-auto"
          >
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((c, i) => (
                <motion.div key={i} whileHover={{ scale: 1.1 }}>
                  <CategoryCard
                    icon={c.icon}
                    name={c.name}
                    onClick={handleCategoryClick}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* FILTER */}
      <section className="sticky top-2 sm:top-4 z-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-white/80 dark:bg-white/10 px-4 py-2 rounded-lg"
            />
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-white/80 dark:bg-white/10 px-4 py-2 rounded-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button onClick={handleApplyFilters} className="bg-black text-white px-6 py-2 rounded-lg">
              Apply
            </button>
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                setCategory("");
                setPage(1);
              }}
              className="bg-gray-200 dark:bg-white/10 px-6 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-14">

        {loading && (
          <div className="grid grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="relative p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur overflow-hidden">
                <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 w-1/2 rounded" />

                <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] 
                bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
              </div>
            ))}
          </div>
        )}
{!loading && !error && products.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {products.map((product) => {
      
      const getImageUrl = (img) => {
        if (!img) return "/placeholder.png";

        // already full URL (cloudinary etc.)
        if (img.startsWith("http")) return img;

        // local upload (Express)
        return `${import.meta.env.VITE_API_URL}/${img}`;
      };

      return (
        <ProductCard
          key={product._id}
          slug={product.slug}
          title={product.title}
          price={product.price}
          image={getImageUrl(product.images?.[0])}
          sellerId={product.user._id}
          sellerName={product.user?.name}
          sellerSubscription={product.user?.subscription}
        />
      );
    })}
  </div>
)}
      </section>

      {/* QUICK PREVIEW */}
      {preview && (
        <motion.div className="fixed bottom-6 right-6 w-80 z-50">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-black/70 p-4 rounded-2xl shadow-2xl">
            <img src={preview.images?.[0]} className="h-40 w-full object-cover rounded mb-3" />
            <h3>{preview.title}</h3>
            <p>₹{preview.price}</p>
          </div>
        </motion.div>
      )}

    </div>
  );
}

export default Home;
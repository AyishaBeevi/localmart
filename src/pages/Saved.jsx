import { useEffect, useState, useRef } from "react";
import API from "../utils/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

function Saved() {
  const [products, setProducts] = useState([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/users/saved-products", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSaved();
  }, []);

  // cursor glow tracking
  useEffect(() => {
    const handleMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const node = containerRef.current;
    node?.addEventListener("mousemove", handleMove);
    return () => node?.removeEventListener("mousemove", handleMove);
  }, []);

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  // frontend remove illusion
  const removeItem = (slug) => {
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen px-6 py-16 max-w-7xl mx-auto overflow-hidden"
    >

      {/* CURSOR GLOW */}
      <div
        className="pointer-events-none absolute -z-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)",
          left: mouse.x - 250,
          top: mouse.y - 250
        }}
      />

      {/* GRAIN TEXTURE */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] mix-blend-overlay">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* HEADER */}
      <div className="relative z-10 mb-10 
      bg-white/70 dark:bg-black/50 
      backdrop-blur-md 
      inline-block px-6 py-4 rounded-2xl
      border border-white/30 dark:border-white/10">

        <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
          Saved Items
        </h1>

        <p className="text-gray-700 dark:text-gray-300 mt-1">
          Your curated collection of favorites
        </p>
      </div>

      {/* EMPTY STATE */}
      {products.length === 0 && (
        <div className="text-center py-24 
        bg-white/80 dark:bg-black/60 backdrop-blur-xl 
        rounded-3xl border border-white/30 dark:border-white/10 shadow-lg">

          <p className="text-lg font-semibold text-black dark:text-white mb-2">
            Nothing saved yet
          </p>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start exploring and save items you like
          </p>

          <Link
            to="/"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Explore
          </Link>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

        {products.map((product, i) => (
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group perspective"
          >

            <Link
              to={`/product/${product.slug}`}
              className="block relative rounded-2xl overflow-hidden 
              bg-white/90 dark:bg-white/5 
              backdrop-blur-xl
              border border-white/30 dark:border-white/10 
              shadow-md hover:shadow-2xl transition-all duration-500"
            >

              {/* ❤️ REMOVE BUTTON */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(product.slug);
                }}
                className="absolute top-3 right-3 z-20 
                bg-black/60 backdrop-blur-md p-2 rounded-full 
                hover:scale-110 transition"
              >
                <Heart className="text-white w-4 h-4 fill-white" />
              </button>

              {/* IMAGE */}
              <div className="overflow-hidden">
                <img
                  src={getImageUrl(product.images?.[0])}
                  alt={product.title}
                  className="w-full h-44 object-cover 
                  group-hover:scale-105 transition duration-700"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <p className="font-semibold text-black dark:text-black truncate">
                  {product.title}
                </p>

                <p className="text-green-600 font-bold mt-1">
                  ₹{product.price}
                </p>
              </div>

              {/* HOVER LIGHT */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500
              bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10" />

            </Link>
          </motion.div>
        ))}

      </div>

    </div>
  );
}

export default Saved;
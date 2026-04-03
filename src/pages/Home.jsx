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

function Home() {
  const location = useLocation();

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/products", {
        params: {
          q: keyword,
          page,
          category,
          minPrice,
          maxPrice
        }
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
    <div className="bg-[#f6f8fb] min-h-screen">

      {/* HERO */}
      {!keyword && (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Buy & Sell Anything Near You
            </h1>
            <p className="text-gray-600 text-lg mb-10">
              Discover trusted listings from people in your area
            </p>

            {/* Categories Container */}
            <div className="bg-[#f9fafb] p-8 rounded-2xl shadow-sm">
              <div className="flex flex-wrap justify-center gap-6">
                {categories.map((c, i) => (
                  <CategoryCard
                    key={i}
                    icon={c.icon}
                    name={c.name}
                    onClick={handleCategoryClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FILTER BAR */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-wrap items-center gap-4 justify-center md:justify-between">

          <div className="flex gap-4 flex-wrap">
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />

            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Apply Filters
            </button>

            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                setCategory("");
                setPage(1);
              }}
              className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>

        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-semibold mb-10 text-center">
          {keyword ? `Results for "${keyword}"` : "Latest Listings"}
        </h2>

        {loading && (
          <p className="text-center text-textMuted">Loading products...</p>
        )}

        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-textMuted">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                slug={product.slug}
                title={product.title}
                price={product.price}
                image={product.images?.[0]}
                sellerId={product.user._id}
                sellerName={product.user?.name}
                sellerSubscription={product.user?.subscription}
              />
            ))}
          </div>
        )}
      </section>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-6 pb-16">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-5 py-2 border rounded-lg disabled:opacity-40 bg-white"
        >
          Prev
        </button>

        <span className="font-medium text-textDark">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage(prev => (prev < totalPages ? prev + 1 : prev))
          }
          disabled={page === totalPages}
          className="px-5 py-2 border rounded-lg disabled:opacity-40 bg-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Home;
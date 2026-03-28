import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api";
import { handleError } from "../utils/errorHandler";

function SellerProfile() {

  const { slug } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchSeller = async () => {

      try {

        const res = await API.get(`/products/seller/${id}`);

        setSeller(res.data.seller);
        setProducts(res.data.products);

      } catch (err) {
        handleError("Error loading seller:", err);
      } finally {
        setLoading(false);
      }

    };

    fetchSeller();

  }, [id]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return <p className="p-10">Loading seller...</p>;
  }

  /* ---------------- SELLER NOT FOUND ---------------- */

  if (!seller) {
    return <p className="p-10">Seller not found</p>;
  }

  return (

    <div className="max-w-6xl mx-auto p-10">

      {/* SELLER HEADER */}

      <div className="flex items-center gap-6 mb-10 border p-6 rounded-lg bg-white">

        <img
          src={
            seller.avatar ||
            `https://ui-avatars.com/api/?name=${seller.name}`
          }
          alt={seller.name}
          className="w-20 h-20 rounded-full object-cover"
        />

        <div>

          <h1 className="text-3xl font-bold">
            {seller.name}
          </h1>

          <p className="text-textMuted text-sm mt-1">
            Member since{" "}
            {new Date(seller.createdAt).toLocaleDateString()}
          </p>

          <p className="text-sm mt-2">
            Listings: {products.length}
          </p>

        </div>

      </div>


      {/* PRODUCTS */}

      {products.length === 0 ? (

        <p className="text-textMuted">
          This seller has no active listings.
        </p>

      ) : (

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {products.map((p) => (

            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
            >

              <img
                src={p.images?.[0]}
                alt={p.title}
                className="h-40 w-full object-cover"
              />

              <div className="p-3">

                <h3 className="font-semibold text-sm">
                  {p.title}
                </h3>

                <p className="text-green-600 font-bold mt-1">
                  ₹{p.price}
                </p>

              </div>

            </Link>

          ))}

        </div>

      )}

    </div>

  );

}

export default SellerProfile;
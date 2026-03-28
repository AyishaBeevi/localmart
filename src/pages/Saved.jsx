import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Saved() {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    const fetchSaved = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await API.get(
          "/users/saved-products",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setProducts(res.data);

      } catch (err) {

        console.error(err);

      }

    };

    fetchSaved();

  }, []);

  return (

    <div className="max-w-7xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-8">
        Saved Items
      </h1>

      {products.length === 0 && (
        <p className="text-textMuted">
          No saved products yet
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {products.map((product) => (

          <Link
            key={product.slug}
            to={`/product/${product.slug}`}
            className="border rounded-xl overflow-hidden hover:shadow-md"
          >

            <img
              src={product.images?.[0]}
              alt={product.title}
              className="w-full h-40 object-cover"
            />

            <div className="p-3">

              <p className="font-semibold truncate">
                {product.title}
              </p>

              <p className="text-green-600 font-bold">
                ₹{product.price}
              </p>

            </div>

          </Link>

        ))}

      </div>

    </div>

  );

}

export default Saved;
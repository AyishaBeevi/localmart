import { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function MyListings() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyProducts = async () => {
      const res = await API.get("/products/my/listings");
      setProducts(res.data);
    };

    fetchMyProducts();
  }, []);

  // const markSold = async (id) => {
  //   await API.put(`/products/${id}/sold`);
  //   window.location.reload();
  // };
const markSold = async (id) => {
  try {
    await API.put(`/products/${id}/sold`);

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, status: "sold" } : p
      )
    );

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};
  // const relist = async (id) => {
  //   await API.put(`/products/${id}/active`);
  //   window.location.reload();
  // };

  const relist = async (id) => {
  try {
    await API.put(`/products/${id}/active`);

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, status: "active" } : p
      )
    );

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};


const deleteProduct = async (id) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <p>Delete this product?</p>

      <div className="flex gap-2">
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={async () => {
            toast.dismiss(t.id);

            try {
              const res = await API.delete(`/products/${id}`);

              if (res.status === 200) {
                toast.success("Product deleted");
                setProducts(prev => prev.filter(p => p._id !== id));
              } else {
                toast.error("Delete failed");
              }

            } catch (err) {
              console.error(err.response || err);
              toast.error(err.response?.data?.message || "Something went wrong");
            }
          }}
        >
          Yes
        </button>

        <button
          className="bg-gray-300 px-3 py-1 rounded"
          onClick={() => toast.dismiss(t.id)}
        >
          Cancel
        </button>
      </div>
    </div>
  ));
};

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

    {/* HEADER */}
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h2 className="text-3xl font-bold tracking-tight">
        My Listings
      </h2>

      <p className="text-sm text-textMuted">
        Manage your products
      </p>
    </div>

    {products.length === 0 && (
      <div className="text-center py-20 text-textMuted">
        No listings yet
      </div>
    )}

    {/* GRID */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {products.map((p) => {
        const sold = p.status === "sold";

        return (
          <div
            key={p._id}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
          >

            {/* IMAGE */}
            <div className="relative overflow-hidden">

              <img
                src={p.images?.[0]}
                className="h-52 sm:h-44 w-full object-cover group-hover:scale-105 transition duration-300"
                alt="product"
              />

              {/* SOLD BADGE */}
              {sold && (
                <span className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  SOLD
                </span>
              )}

              {/* APPROVAL BADGE */}
              <span
                className={`absolute top-2 right-2 text-[10px] px-2 py-1 rounded font-medium
                ${
                  p.approvalStatus === "approved"
                    ? "bg-green-500/90 text-white"
                    : p.approvalStatus === "pending"
                    ? "bg-yellow-400 text-black"
                    : "bg-red-500 text-white"
                }`}
              >
                {p.approvalStatus}
              </span>

            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col flex-1">

              <h3 className="font-semibold text-sm line-clamp-1">
                {p.title}
              </h3>

              <p className="text-brand font-bold text-lg mt-1">
                ₹{p.price}
              </p>

              <p className="text-xs text-textMuted">
                📍 {p.location}
              </p>

              {/* REJECTION */}
              {p.approvalStatus === "rejected" && (
                <p className="text-xs text-red-500 mt-2">
                  {p.rejectionReason || "Rejected"}
                </p>
              )}

              {/* ACTIONS */}
              <div className="mt-auto pt-4 flex flex-wrap gap-2">

                {!sold && (
                  <button
                    onClick={() => markSold(p._id)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 rounded-lg transition"
                  >
                    Mark Sold
                  </button>
                )}

                {sold && (
                  <button
                    onClick={() => relist(p._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg transition"
                  >
                    Relist
                  </button>
                )}

                {p.approvalStatus === "rejected" && (
                  <button
                    onClick={() =>
                      navigate(`/edit-product/${p.slug}`)
                    }
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-lg transition"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => deleteProduct(p._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg transition"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  </div>
);
}

export default MyListings;
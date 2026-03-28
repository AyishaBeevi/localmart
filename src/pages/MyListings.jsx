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

  const markSold = async (id) => {
    await API.put(`/products/${id}/sold`);
    window.location.reload();
  };

  const relist = async (id) => {
    await API.put(`/products/${id}/active`);
    window.location.reload();
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
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">
        My Listings
      </h2>

      {products.length === 0 && (
        <p>No listings yet</p>
      )}

      <div className="grid grid-cols-4 gap-6">
        {products.map((p) => {
          const sold = p.status === "sold";

          return (
            <div
              key={p._id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={p.images?.[0]}
                className="h-40 w-full object-cover"
                alt="product"
              />

              <div className="p-3">
                <h3 className="font-semibold">
                  {p.title}
                </h3>

                <p className="text-green-600 font-bold">
                  ₹{p.price}
                </p>

                <p className="text-sm text-textMuted">
                  {p.location}
                </p>

                
                <p
                  className={`text-xs mt-1 ${
                    p.approvalStatus === "approved"
                      ? "text-green-600"
                      : p.approvalStatus === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {p.approvalStatus?.toUpperCase()}
                </p>

               
                {p.approvalStatus === "rejected" && (
                  <p className="text-xs text-red-500 mt-1">
                    Reason:{" "}
                    {p.rejectionReason ||
                      "Not specified"}
                  </p>
                )}

                <div className="flex gap-2 mt-3 flex-wrap">
                  
                  {!sold && (
                    <button
                      onClick={() => markSold(p._id)}
                      className="bg-yellow-500 text-white px-3 py-1 text-sm rounded"
                    >
                      Mark Sold
                    </button>
                  )}

                  {sold && (
                    <button
                      onClick={() => relist(p._id)}
                      className="bg-green-600 text-white px-3 py-1 text-sm rounded"
                    >
                      Relist
                    </button>
                  )}

                  
                  {p.approvalStatus === "rejected" && (
                    <button
                      onClick={() =>
                        navigate(
                          `/edit-product/${p.slug}`
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 text-sm rounded"
                    >
                      Edit & Resubmit
                    </button>
                  )}

                  {/* DELETE */}
                  <button
                    onClick={() =>
                      deleteProduct(p._id)
                    }
                    className="bg-red-500 text-white px-3 py-1 text-sm rounded"
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
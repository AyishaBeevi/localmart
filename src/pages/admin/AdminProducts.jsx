import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import AdminLayout from "../../layout/AdminLayout";
import { handleError } from "../../utils/errorHandler";

function AdminProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {

    try {

      const res = await API.get(
        "/admin/products",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(res.data);

    } catch {

      toast.error("Failed to load products");

    } finally {

      setLoading(false);

    }

  };

  const approveProduct = async (id) => {

  try {

    await API.put(
      `/admin/products/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setProducts(prev =>
      prev.map(p =>
        p._id === id
          ? { ...p, approvalStatus: "approved" }
          : p
      )
    );

    toast.success("Product approved");

  } catch (err) {

    handleError(err);
    toast.error("Approval failed");

  }

};

  const deleteProduct = (id) => {

  toast.custom((t) => (

    <div className="bg-white border shadow-lg rounded-lg p-4 w-80">

      <p className="text-sm font-medium mb-3">
        Delete this product permanently?
      </p>

      <div className="flex justify-end gap-2">

        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 text-sm border rounded"
        >
          Cancel
        </button>

        <button
  onClick={async () => {
    toast.dismiss(t.id);

    try {
      const res = await API.delete(
        `/admin/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("SUCCESS:", res.data);

      setProducts(prev => prev.filter(p => p._id !== id));

      toast.success("Product removed");

    } catch (err) {
      console.log("ERROR STATUS:", err.response?.status);
      console.log("ERROR DATA:", err.response?.data);

      toast.error(err.response?.data?.message || "Delete failed");
    }
  }}
  className="px-3 py-1 text-sm bg-red-600 text-white rounded"
>
  Delete
</button>

      </div>

    </div>

  ));

};
  const rejectProduct = async (id) => {

    try {

      await API.put(
  `/admin/products/${id}/reject`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);

setProducts(prev =>
  prev.map(p =>
    p._id === id ? { ...p, approvalStatus: "rejected" } : p
  )
);

toast.success("Product rejected");

    } catch {

      toast.error("Reject failed");

    }

  };

  const getStatusBadge = (status) => {

    if (status === "approved")
      return "bg-green-100 text-green-700";

    if (status === "rejected")
      return "bg-red-100 text-red-700";

    return "bg-yellow-100 text-yellow-700";

  };

  return (

    <AdminLayout>

      <h1 className="text-xl md:text-2xl font-bold mb-6">
        Product Moderation
      </h1>

      <div className="bg-white shadow-sm border rounded-xl overflow-x-auto">

        {loading ? (

          <div className="p-8 text-center text-textMuted">
            Loading products...
          </div>

        ) : (

          <table className="min-w-[750px] w-full text-sm">

            <thead className="bg-gray-100 text-gray-600">

              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Seller</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>

            </thead>

            <tbody>

              {products.map(product => {

                const isApproved = product.approvalStatus === "approved";
                const isRejected = product.approvalStatus === "rejected";

                return (

                  <tr
                    key={product._id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4 flex items-center gap-3">

                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.title}
                        className="w-12 h-12 rounded object-cover border"
                      />

                      <div>

                        <div className="font-medium">
                          {product.title}
                        </div>

                        <div className="text-xs text-textMuted">
                          ID: {product.slug ? product.slug.slice(-6) : product._id.slice(-6)}
                        </div>

                      </div>

                    </td>

                    <td className="p-4">
                      ₹{product.price.toLocaleString()}
                    </td>

                    <td className="p-4">
                      {product.user?.name || "Unknown"}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(product.approvalStatus)}`}
                      >
                        {product.approvalStatus}
                      </span>

                    </td>

                    <td className="p-4 flex gap-3">

                      {/* APPROVE */}

                      <button
                        onClick={() => approveProduct(product._id)}
                        disabled={isApproved}
                        className={`text-xs ${
                          isApproved
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-green-600 hover:underline"
                        }`}
                      >
                        Approve
                      </button>

                      {/* REJECT */}

                      <button
                        onClick={() => rejectProduct(product._id)}
                        disabled={isRejected}
                        className={`text-xs ${
                          isRejected
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-yellow-600 hover:underline"
                        }`}
                      >
                        Reject
                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Remove
                      </button>

                      <button
  onClick={() => setSelectedProduct(product)}
  className="text-blue-600 text-xs hover:underline"
>
  View
</button>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

          

        )}

      </div>

      {selectedProduct && (
  <div className="fixed inset-0 bg-brand/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl p-6 w-[90%] max-w-2xl relative">

      {/* CLOSE */}
      <button
        onClick={() => setSelectedProduct(null)}
        className="absolute top-3 right-3 text-textMuted"
      >
        ✕
      </button>

      {/* TITLE */}
      <h2 className="text-xl font-bold mb-4">
        {selectedProduct.title}
      </h2>

      {/* IMAGE */}
      <img
        src={selectedProduct.images?.[0]}
        className="w-full h-60 object-cover rounded mb-4"
        alt="product"
      />

      {/* DETAILS */}
      <div className="space-y-2 text-sm">

        <p><strong>Price:</strong> ₹{selectedProduct.price}</p>

        <p><strong>Category:</strong> {selectedProduct.category}</p>

        <p><strong>Location:</strong> {selectedProduct.location}</p>

        <p>
          <strong>Seller:</strong>{" "}
          {selectedProduct.user?.name}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {selectedProduct.approvalStatus}
        </p>

        <p>
          <strong>Description:</strong><br />
          {selectedProduct.description}
        </p>

      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mt-6">

        <button
          onClick={() => {
            approveProduct(selectedProduct._id);
            setSelectedProduct(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Approve
        </button>

        <button
          onClick={() => {
            rejectProduct(selectedProduct._id);
            setSelectedProduct(null);
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Reject
        </button>

      </div>

    </div>
  </div>
)}

    </AdminLayout>

  );

}

export default AdminProducts;
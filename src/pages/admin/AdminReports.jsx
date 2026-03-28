import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminLayout from "../../layout/AdminLayout";
import { handleError } from "../../utils/errorHandler";

function AdminReports() {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
  const toastId = toast.loading("Loading reports...");

  try {
    const res = await API.get(
      "/admin/reports",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setReports(res.data);
    toast.success("Reports loaded", { id: toastId });

  } catch (err) {
    handleError(err);
    toast.error("Failed to load reports", { id: toastId });
  } finally {
    setLoading(false);
  }
};

 const deleteProduct = async (productId) => {
  const confirmDelete = (productId) => {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">
        Remove this listing?
      </p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            toast.dismiss(t.id);
          }}
          className="px-3 py-1 text-sm border rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            toast.dismiss(t.id);
            deleteProduct(productId);
          }}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  ));
};

  const toastId = toast.loading("Removing listing...");

  try {
    await API.delete(
      `/admin/products/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Listing removed", { id: toastId });

    fetchReports();

  } catch (err) {
    handleError(err);
    toast.error("Delete failed", { id: toastId });
  }
};

 const clearReport = async (reportId) => {
  const toastId = toast.loading("Clearing report...");

  try {
    await API.delete(
      `/admin/reports/${reportId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReports(prev => prev.filter(r => r._id !== reportId));

    toast.success("Report cleared", { id: toastId });

  } catch (err) {
    handleError(err);
    toast.error("Failed to clear report", { id: toastId });
  }
};

  const getReasonColor = (reason) => {

    if (reason === "Scam") return "bg-red-100 text-red-700";
    if (reason === "Spam") return "bg-yellow-100 text-yellow-700";
    if (reason === "Fake listing") return "bg-orange-100 text-orange-700";

    return "bg-gray-100 text-textDark";

  };


  return (

    <AdminLayout>

      <h1 className="text-xl md:text-2xl font-bold mb-6">
        Reported Listings
      </h1>

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">

        {loading ? (

          <div className="p-8 text-center text-textMuted">
            Loading reports...
          </div>

        ) : (

          <table className="min-w-[750px] w-full text-sm">

            <thead className="bg-gray-100 text-gray-600">

              <tr>

                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Reason</th>
                <th className="p-4 text-left">Details</th>
                <th className="p-4 text-left">Reported By</th>
                <th className="p-4 text-left">Action</th>

              </tr>

            </thead>

            <tbody>

              {reports.map(report => (

                <tr
                  key={report._id}
                  className="border-t hover:bg-gray-50"
                >

                  {/* PRODUCT */}

                  <td className="p-4 flex items-center gap-3">

                    <img
                      src={report.product?.images?.[0] || "/placeholder.png"}
                      alt="product"
                      className="w-12 h-12 rounded object-cover border"
                    />

                    <span className="font-medium">
                      {report.product?.title || "Deleted"}
                    </span>

                  </td>


                  {/* REASON */}

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getReasonColor(report.reason)}`}
                    >
                      {report.reason}
                    </span>

                  </td>


                  {/* DETAILS */}

                  <td className="p-4 text-gray-600 max-w-xs">
                    {report.details || "-"}
                  </td>


                  {/* REPORTER */}

                  <td className="p-4">
                    {report.user?.name || "Unknown"}
                  </td>


                  {/* ACTIONS */}

                  <td className="p-4 flex gap-4">

                    <button
                      onClick={() => deleteProduct(report.product?._id)} 
                      className="text-red-600 text-xs font-medium hover:text-red-800"
                    >
                      Remove Listing
                    </button>

                    <button
                      onClick={() => clearReport(report._id)}
                      className="text-gray-600 text-xs font-medium hover:text-black"
                    >
                      Clear Report
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </AdminLayout>

  );

}

export default AdminReports;
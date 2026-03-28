import React, { useState } from "react";
import API from "../utils/api";
import { toast } from "react-hot-toast";

const UpgradeCard = ({ title, price, features, highlight, isActive }) => {

  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {

      if (loading) return; // 🔒 prevent double click
      setLoading(true);

      toast.dismiss();

      // 🔥 STEP 1: CREATE ORDER
      const { data: order } = await API.post("/payment/create-order");

      if (!order?.id) {
        throw new Error("Order creation failed");
      }

      const options = {
        key: "rzp_test_RU6GbctrLJ55L1",
        amount: order.amount,
        currency: order.currency,
        name: "LocalMart",
        description: "Seller Subscription",
        order_id: order.id,

        handler: async function (response) {
          try {

            toast.dismiss();

            // 🔥 STEP 2: VERIFY PAYMENT
            await API.post("/payment/verify-payment", response);

            toast.success("You're now a seller 🚀", {
              duration: 3000,
            });

            // ✅ smooth redirect
            setTimeout(() => {
              localStorage.setItem("refreshUser", "true");
window.location.href = "/";
            }, 1500);

          } catch (err) {

            console.error("VERIFY ERROR:", err);

            const msg =
              err.response?.data?.message ||
              "Payment verification failed";

            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            toast.dismiss();
            toast.error("Payment cancelled");
            setLoading(false);
          }
        },

        theme: {
          color: "#000"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {

      console.error("CREATE ORDER ERROR:", err);

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Payment failed";

      toast.dismiss();
      toast.error(msg);

      setLoading(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl shadow-md bg-white border transition
      ${highlight ? "border-black scale-105" : "border-border"}`}
    >

      <h2 className="text-2xl font-semibold mb-2">{title}</h2>

      <p className="text-3xl font-bold mb-4">{price}</p>

      <ul className="mb-6 space-y-2 text-gray-600">
        {features.map((f, i) => (
          <li key={i}>✔ {f}</li>
        ))}
      </ul>

      {isActive ? (
        <button className="w-full bg-gray-300 text-textDark py-2 rounded-lg cursor-not-allowed">
          Current Plan
        </button>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upgrade Now"}
        </button>
      )}

    </div>
  );
};

export default UpgradeCard;
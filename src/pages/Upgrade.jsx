import React from "react";
import { motion } from "framer-motion";
import UpgradeCard from "../components/UpgradeCard";

const Upgrade = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-4"
      >
        Become a Seller
      </motion.h1>

      <p className="text-gray-600 mb-10 text-center max-w-lg">
        Stop being limited. Upgrade your account and start selling without restrictions.
      </p>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

        {/* FREE PLAN */}
        <UpgradeCard
          title="Free Plan"
          price="₹0"
          features={[
            "1 product listing",
            "Basic visibility",
            "No seller badge"
          ]}
          isActive
        />

        {/* SELLER PLAN */}
        <UpgradeCard
          title="Seller Plan"
          price="₹199/month"
          features={[
            "Unlimited listings",
            "Priority visibility",
            "Verified seller badge"
          ]}
          highlight
        />

      </div>
    </div>
  );
};

export default Upgrade;
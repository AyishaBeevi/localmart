import React from "react";

const SellerBadge = ({ subscription }) => {

  if (subscription !== "seller") return null;

  return (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
      ✔ Verified Seller
    </span>
  );
};

export default SellerBadge;
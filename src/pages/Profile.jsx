

import { useEffect, useState } from "react";
import API from "../utils/api";
import { Pencil, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleError } from "../utils/errorHandler";

function Profile() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [stats, setStats] = useState({
    listings: 0,
    sold: 0,
    saved: 0,
  });

  const navigate = useNavigate();

  /* ---------------- FETCH ---------------- */
  const fetchData = async () => {
    try {
      const userRes = await API.get("/auth/me");
      const userData = userRes.data;

      setUser(userData);
      setName(userData.name);
      setImagePreview(userData.avatar);

      const productRes = await API.get("/products/my/listings");
      const myProducts = productRes.data;

      setProducts(myProducts);

      const soldCount = myProducts.filter(
        (p) => p.status === "sold"
      ).length;

      setStats({
        listings: myProducts.length,
        sold: soldCount,
        saved: userData.savedProducts?.length || 0,
      });
    } catch (err) {
  handleError(err, "Failed to load profile");
}
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  /* ---------------- SUBSCRIPTION ---------------- */
  const now = new Date();

  const expiryDate = user.subscriptionExpiry
    ? new Date(user.subscriptionExpiry)
    : null;

  const isActive =
    user.subscription === "seller" &&
    expiryDate &&
    expiryDate > now;

  let daysLeft = 0;

  if (expiryDate) {
    const diff = expiryDate.getTime() - now.getTime();
    daysLeft =
      diff > 0
        ? Math.ceil(diff / (1000 * 60 * 60 * 24))
        : 0;
  }

  /* ---------------- PROFILE COMPLETION ---------------- */
  const completionFields = [
    user.name,
    user.email,
    user.avatar,
  ];

  const completion =
    Math.floor(
      (completionFields.filter(Boolean).length /
        completionFields.length) *
        100
    ) || 0;

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      await API.put("/auth/update", formData);

      setEditing(false);
      setImageFile(null);
      fetchData();
    } catch (err) {
      handleError(err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between flex-wrap gap-6">
          <div className="flex gap-6">
            {/* AVATAR */}
            <div className="relative">
              <img
                src={
                  imagePreview ||
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}`
                }
                className="w-24 h-24 rounded-full object-cover border"
                alt="avatar"
              />

              {editing && (
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setImageFile(file);
                    setImagePreview(
                      URL.createObjectURL(file)
                    );
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>

            {/* INFO */}
            <div>
              {editing ? (
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="border px-3 py-2 rounded text-lg font-semibold"
                />
              ) : (
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {user.name}

                  {user.subscription === "seller" && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isActive
                        ? "Active Seller"
                        : "Expired"}
                    </span>
                  )}
                </h2>
              )}

              <p className="text-textMuted text-sm">
                {user.email}
              </p>

              <div className="flex items-center gap-4 text-sm text-textMuted mt-2">
                <span>
                  Joined{" "}
                  {new Date(
                    user.createdAt
                  ).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} /> 4.8 Rating
                </span>
              </div>

              {/* PROGRESS */}
              <div className="mt-3">
                <div className="w-44 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-brand rounded"
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-textMuted mt-1">
                  Profile {completion}% complete
                </p>
              </div>
            </div>
          </div>

          {/* ACTION */}
          {editing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-brand text-white px-5 py-2 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Pencil size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-white border rounded-xl p-6 text-center hover:shadow">
          <p className="text-3xl font-bold">
            {stats.listings}
          </p>
          <p className="text-textMuted text-sm mt-1">
            Listings
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 text-center hover:shadow">
          <p className="text-3xl font-bold">
            {stats.sold}
          </p>
          <p className="text-textMuted text-sm mt-1">
            Sold
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 text-center hover:shadow">
          <p className="text-3xl font-bold">
            {stats.saved}
          </p>
          <p className="text-textMuted text-sm mt-1">
            Saved
          </p>
        </div>
      </div>

      {/* SUBSCRIPTION */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2">
          Subscription
        </h2>

        {user.subscription === "seller" ? (
          <>
            <p
              className={`font-medium ${
                isActive
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {isActive
                ? "Seller Plan Active"
                : "Expired"}
            </p>

            {isActive && (
              <p className="text-gray-600">
                {daysLeft} days remaining
              </p>
            )}

            {!isActive && (
              <button
                onClick={() => navigate("/upgrade")}
                className="mt-3 bg-brand text-white px-4 py-2 rounded-lg"
              >
                Renew Subscription
              </button>
            )}
          </>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Free plan
            </p>

            <button
              onClick={() => navigate("/upgrade")}
              className="bg-brand text-white px-4 py-2 rounded-lg"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      {/* LISTINGS */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Recent Listings
          </h2>

          <button
            onClick={() => navigate("/my-listings")}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-textMuted">
            No listings yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 8).map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  if (
                    p.approvalStatus !== "approved"
                  )
                    return;
                  navigate(`/product/${p._id}`);
                }}
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition ${
                  p.approvalStatus !== "approved"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <img
                  src={p.images?.[0]}
                  className="h-40 w-full object-cover"
                  alt="product"
                />

                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-1">
                    {p.title}
                  </p>

                  <p className="text-green-600 font-semibold mt-1">
                    ₹{p.price}
                  </p>

                  {/* STATUS */}
                  {p.approvalStatus === "pending" && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Pending
                    </span>
                  )}

                  {p.approvalStatus === "rejected" && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      Rejected
                    </span>
                  )}

                  {p.status === "sold" && (
                    <span className="text-xs text-red-500 block">
                      Sold
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
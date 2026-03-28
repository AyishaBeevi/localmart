
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Bell, User, Search, Heart } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import NotificationDropdown from "./NotificationDropdown";
import socket from "../socket";
import toast from "react-hot-toast";
import API from "../utils/api";

function Navbar({ keyword, setKeyword }) {

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [messageUnread, setMessageUnread] = useState(0);
  const [notificationUnread, setNotificationUnread] = useState(0);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  /* ---------------- SUBSCRIPTION LOGIC (FIXED) ---------------- */
  const now = new Date();

  const expiryDate = user?.subscriptionExpiry
    ? new Date(user.subscriptionExpiry)
    : null;

  const isSeller = user?.subscription === "seller";

  const isExpired =
    isSeller &&
    expiryDate &&
    expiryDate < now;

  /* ---------------- DECODE TOKEN ---------------- */
  let userId = null;
  let role = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id || payload._id;
      role = payload.role;
    } catch {}
  }

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    if (!token) return;

    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUser(res.data))
      .catch(() => {});
  }, [token]);

  /* ---------------- UNREAD ---------------- */
  const fetchMessageUnread = async () => {
    try {
      const res = await API.get(
        "/chat/unread",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageUnread(res.data.count);
    } catch {}
  };

  const fetchNotificationUnread = async () => {
    try {
      const res = await API.get(
        "/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotificationUnread(res.data.filter(n => !n.read).length);
    } catch {}
  };

  useEffect(() => {
    if (!token) return;
    fetchMessageUnread();
    fetchNotificationUnread();
  }, [token]);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!token || !userId) return;

    socket.emit("addUser", userId);

    socket.on("receiveMessage", (msg) => {
      fetchMessageUnread();

      toast.custom((t) => (
        <div className="bg-white border shadow-lg rounded-lg p-4 w-72 flex gap-3">
          <div>💬</div>
          <div>
            <p className="text-sm font-semibold">New message</p>
            <button
              onClick={() => {
                navigate(`/chat/${msg.conversationId}`);
                toast.dismiss(t.id);
              }}
              className="text-xs text-blue-600"
            >
              Open chat
            </button>
          </div>
        </div>
      ));
    });

    socket.on("newNotification", () => {
      setNotificationUnread(prev => prev + 1);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("newNotification");
    };
  }, [token, userId]);

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- SEARCH ---------------- */
  const handleSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/?q=${keyword}`);
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const Badge = ({ count }) => {
    if (!count) return null;

    return (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
        {count > 99 ? "99+" : count}
      </span>
    );
  };
return (
  <nav className="sticky top-0 z-50 bg-bg border-b border-border shadow-sm">

    <div className="max-w-7xl mx-auto px-6">

      <div className="flex items-center justify-between h-16">

        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold tracking-tight text-textDark">
          🧺 LocalMart
        </Link>

        {/* DESKTOP SEARCH */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-10">
          <div className="flex w-full items-center bg-white border border-border rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-brand transition">
            <Search size={18} className="ml-5 text-textMuted" />

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 px-4 py-2 bg-transparent outline-none text-sm text-textDark"
            />

            <button
              onClick={handleSearch}
              className="bg-brand text-white px-6 py-2 text-sm font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {isLoggedIn ? (
            <>
              {/* ICON GROUP */}
              <div className="flex items-center gap-5 text-textMuted">

                <Link to="/saved" className="hover:text-textDark transition">
                  <Heart size={22} />
                </Link>

                {/* NOTIFICATIONS */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(prev => !prev)}
                    className="hover:text-textDark relative transition"
                  >
                    <Bell size={22} />
                    <Badge count={notificationUnread} />
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-4">
                      <NotificationDropdown refreshUnread={fetchNotificationUnread} />
                    </div>
                  )}
                </div>

                {/* CHAT */}
                <Link to="/chat" className="relative hover:text-textDark transition">
                  <MessageCircle size={22} />
                  <Badge count={messageUnread} />
                </Link>
              </div>

              {/* ACTION GROUP */}
              <div className="flex items-center gap-3">

                <Link
                  to={isExpired ? "/profile" : "/sell"}
                  onClick={(e) => {
                    if (isExpired) {
                      e.preventDefault();
                      toast.error("Subscription expired. Renew to sell.");
                    }
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                    isExpired
                      ? "bg-border text-textMuted cursor-not-allowed"
                      : "bg-brand text-white hover:opacity-90"
                  }`}
                >
                  + Sell
                </Link>

                {isSeller && !isExpired && (
                  <Link
                    to="/profile"
                    className="text-xs bg-seller text-white px-3 py-1 rounded-full font-medium"
                  >
                    ⭐ Seller
                  </Link>
                )}

                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-xs bg-brand text-white px-3 py-1 rounded-full"
                  >
                    Admin
                  </Link>
                )}

                {/* PROFILE */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(prev => !prev)}
                    className="text-textMuted hover:text-textDark transition"
                  >
                    <User size={24} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-14 w-52 bg-white rounded-xl shadow-xl border border-border">

                      <Link to="/profile" className="block px-4 py-3 text-sm hover:bg-bg">
                        Profile
                      </Link>

                      <Link to="/my-listings" className="block px-4 py-3 text-sm hover:bg-bg">
                        My Listings
                      </Link>

                      <Link to="/settings" className="block px-4 py-3 text-sm hover:bg-bg">
                        Settings
                      </Link>

                      <div className="border-t border-border"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-bg"
                      >
                        Logout
                      </button>

                    </div>
                  )}
                </div>

              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-textDark">
                Login
              </Link>

              <Link
                to="/register"
                className="bg-brand text-white px-5 py-2 rounded-full text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden pb-4">
        <div className="flex items-center bg-white border border-border rounded-full overflow-hidden">
          <Search size={18} className="ml-4 text-textMuted" />

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-textDark"
          />

          <button
            onClick={handleSearch}
            className="bg-brand text-white px-4 py-2 text-sm"
          >
            Go
          </button>
        </div>
      </div>

    </div>
  </nav>
);
}

export default Navbar;
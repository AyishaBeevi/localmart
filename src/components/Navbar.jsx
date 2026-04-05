
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
    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center 
    text-[10px] font-semibold 
    bg-gradient-to-r from-red-500 to-pink-500 text-white 
    rounded-full px-1 shadow-md border border-white dark:border-black">
      {count > 99 ? "99+" : count}
    </span>
  );
};


return (
  <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/60 border-b border-white/30 dark:border-white/10 shadow-sm">

    {/* 🔥 subtle gradient glow */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/20 via-pink-200/10 to-blue-200/20 dark:from-purple-900/20 dark:via-pink-900/10 dark:to-blue-900/20 blur-2xl" />

    <div className="max-w-7xl mx-auto px-6">

      <div className="flex items-center justify-between h-16">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight 
          bg-gradient-to-r from-black to-gray-500 
          dark:from-white dark:to-gray-400 
          bg-clip-text text-transparent"
        >
          🧺 LocalMart
        </Link>

        {/* SEARCH */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-10">
          <div className="flex w-full items-center 
            backdrop-blur-xl 
            bg-white/60 dark:bg-white/5 
            border border-white/30 dark:border-white/10 
            rounded-full overflow-hidden 
            focus-within:ring-2 focus-within:ring-purple-400/40 
            transition">

            <Search size={18} className="ml-5 text-gray-500 dark:text-gray-400" />

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 px-4 py-2 bg-transparent outline-none text-sm text-black dark:text-white placeholder:text-gray-400"
            />

            <button
              onClick={handleSearch}
              className="px-6 py-2 text-sm font-medium 
              bg-gradient-to-r from-purple-500 to-blue-500 
              text-white hover:opacity-90 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {isLoggedIn ? (
            <>
              {/* ICONS */}
              <div className="flex items-center gap-5 text-gray-500 dark:text-gray-400">

                <Link to="/saved" className="hover:text-black dark:hover:text-white transition">
                  <Heart size={22} />
                </Link>

                {/* NOTIFICATIONS */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(prev => !prev)}
                    className="hover:text-black dark:hover:text-white relative transition"
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
                <Link to="/chat" className="relative hover:text-black dark:hover:text-white transition">
                  <MessageCircle size={22} />
                  <Badge count={messageUnread} />
                </Link>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3">

                <Link
                  to={isExpired ? "/profile" : "/sell"}
                  onClick={(e) => {
                    if (isExpired) {
                      e.preventDefault();
                      toast.error("Subscription expired. Renew to sell.");
                    }
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition backdrop-blur
                  ${
                    isExpired
                      ? "bg-gray-300/50 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
                  }`}
                >
                  + Sell
                </Link>

                {isSeller && !isExpired && (
                  <Link
                    to="/profile"
                    className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full font-medium"
                  >
                    ⭐ Seller
                  </Link>
                )}

                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full"
                  >
                    Admin
                  </Link>
                )}

                {/* PROFILE */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(prev => !prev)}
                    className="hover:text-black dark:hover:text-white transition"
                  >
                    <User size={24} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-52 z-50 
  backdrop-blur-xl 
  bg-gradient-to-b from-white/95 to-white/90 
  dark:from-black/90 dark:to-black/80
  text-black dark:text-white
  rounded-xl 
  shadow-2xl shadow-black/20 dark:shadow-black/60
  ring-1 ring-black/5 dark:ring-white/10
  border border-white/30 dark:border-white/10">

                      <Link to="/profile" className="block px-4 py-3 text-sm hover:bg-white/20 dark:hover:bg-white/10">
                        Profile
                      </Link>

                      <Link to="/my-listings" className="block px-4 py-3 text-sm hover:bg-white/20 dark:hover:bg-white/10">
                        My Listings
                      </Link>

                      <Link to="/settings" className="block px-4 py-3 text-sm hover:bg-white/20 dark:hover:bg-white/10">
                        Settings
                      </Link>

                      <div className="border-t border-white/20"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/20 dark:hover:bg-white/10"
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
              <Link to="/login" className="text-sm font-medium text-black dark:text-white">
                Login
              </Link>

              <Link
                to="/register"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden pb-4">
        <div className="flex items-center 
          backdrop-blur-xl 
          bg-white/60 dark:bg-white/5 
          border border-white/30 dark:border-white/10 
          rounded-full overflow-hidden">

          <Search size={18} className="ml-4 text-gray-500" />

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-black dark:text-white"
          />

          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-sm"
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

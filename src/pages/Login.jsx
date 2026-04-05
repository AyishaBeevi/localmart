import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import API from "../utils/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">

      <Toaster />

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] 
      bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 
      dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 
      opacity-10 blur-3xl rounded-full -z-10" />

      {/* 🔥 CARD */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md 
        bg-white/80 dark:bg-black/60 
        backdrop-blur-xl 
        border border-white/30 dark:border-white/10 
        rounded-3xl shadow-2xl p-8"
      >

        {/* HEADER */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-black dark:text-white">
            Welcome back
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Login to continue
          </p>
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl 
            bg-white/90 dark:bg-white/5 
            border border-gray-200 dark:border-white/10 
            text-black dark:text-white 
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-purple-400/40 
            transition"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl 
            bg-white/90 dark:bg-white/5 
            border border-gray-200 dark:border-white/10 
            text-black dark:text-white 
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-purple-400/40 
            transition"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          className="w-full py-3 rounded-xl font-semibold text-white 
          bg-gradient-to-r from-purple-500 to-blue-500 
          hover:opacity-90 active:scale-[0.98] 
          transition-all duration-200 shadow-lg"
        >
          Login
        </button>

        {/* FOOTER */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          No account?{" "}
          <Link
            to="/register"
            className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            Register
          </Link>
        </p>

      </motion.form>
    </div>
  );
}

export default Login;
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <motion.footer
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }}
      className="relative w-full mt-24 overflow-hidden"
    >

      {/* 🔥 CURSOR GLOW (follows mouse) */}
      <div
        className="absolute w-[600px] h-[600px] pointer-events-none blur-3xl opacity-20 -z-10 transition"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)"
        }}
      />

      {/* 🔥 ANIMATED BACKGROUND */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px]
      bg-gradient-to-r from-purple-200 via-pink-100 to-blue-200
      opacity-30 blur-3xl rounded-full -z-10 animate-gradientMove" />

      {/* 🔥 GLASS CONTAINER */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200 
      shadow-[0_-20px_60px_rgba(0,0,0,0.08)]">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } }
          }}
          className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-12"
        >

          {/* BRAND */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 }
            }}
            className="md:col-span-2 transition hover:-translate-y-1"
          >
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🧺
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                LocalMart
              </span>
            </h2>

            <p className="mt-4 text-gray-500 text-sm max-w-sm">
              Buy and sell locally with trust. A premium marketplace experience
              built for simplicity, safety, and speed.
            </p>

            <div className="flex gap-4 mt-6">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white shadow-sm border hover:shadow-lg cursor-pointer transition"
                >
                  <Icon className="w-5 h-5 text-gray-600 hover:text-purple-600 transition" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* EXPLORE */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
            className="transition hover:-translate-y-1"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Explore</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Home", link: "/" },
                { name: "Categories", link: "/" },
                { name: "Sell Product", link: "/sell" },
                { name: "My Profile", link: "/profile" },
              ].map((item) => (
                <li key={item.name}>
                  <Link className="text-gray-500 hover:text-purple-600 transition relative group">
                    {item.name}
                    <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-purple-500 group-hover:w-full transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* SUPPORT */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
            className="transition hover:-translate-y-1"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Help Center", link: "/help" },
                { name: "Safety Tips", link: "/safety" },
                { name: "Terms & Conditions", link: "/terms" },
                { name: "Privacy Policy", link: "/privacy" },
              ].map((item) => (
                <li key={item.name}>
                  <Link className="text-gray-500 hover:text-purple-600 transition relative group">
                    {item.name}
                    <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-purple-500 group-hover:w-full transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* NEWSLETTER */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
            className="transition hover:-translate-y-1"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Stay Updated</h3>

            <p className="text-sm text-gray-500 mb-4">
              Get product updates and deals.
            </p>

            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm 
            focus-within:ring-2 focus-within:ring-purple-400/40 transition-all hover:shadow-md">

              <Mail className="ml-3 text-gray-400 w-4 h-4" />

              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm outline-none"
              />

              <button className="px-4 py-2 text-sm font-medium 
              bg-gradient-to-r from-purple-500 to-blue-500 
              text-white hover:opacity-90 active:scale-95 transition">
                Join
              </button>
            </div>
          </motion.div>

        </motion.div>

        {/* BOTTOM */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-200 bg-white/60 backdrop-blur"
        >
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <p>© {new Date().getFullYear()} LocalMart. All rights reserved.</p>

            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/terms" className="hover:text-purple-600 transition">Terms</Link>
              <Link to="/privacy" className="hover:text-purple-600 transition">Privacy</Link>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.footer>
  );
}
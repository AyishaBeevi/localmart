import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function AdminSidebar() {

  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItem = (path, label) => (
    <Link
      to={path}
      onClick={() => setOpen(false)}
      className={`block px-3 py-2 rounded-md text-sm transition
      ${
        location.pathname === path
          ? "bg-gray-800 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between bg-brand text-white px-4 py-3">

        <span className="font-semibold">Admin Panel</span>

        <button
          onClick={() => setOpen(!open)}
          className="text-xl"
        >
          ☰
        </button>

      </div>

      {/* SIDEBAR */}
      <aside
        className={`bg-brand text-white w-64 min-h-screen p-6
        fixed md:static top-0 left-0 z-40
        transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >

        <h2 className="text-xl font-bold mb-8">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-2">

          {navItem("/admin", "Dashboard")}
          {navItem("/admin/users", "Users")}
          {navItem("/admin/products", "Products")}
          {navItem("/admin/reports", "Reports")}

        </nav>

      </aside>
    </>
  );
}

export default AdminSidebar;
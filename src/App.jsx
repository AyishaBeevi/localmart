import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import ProductPage from "./pages/ProductPage";
import CreateProduct from "./pages/CreateProduct";
// import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import socket from "./socket";
import MyListings from "./pages/MyListings";
import SellerProfile
 from "./pages/SellerProfile";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotificationDropdown from "./components/NotificationDropdown";
import Saved
 from "./pages/Saved";
 import AdminRoute from "./components/AdminRoute";
 import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminReports from "./pages/admin/AdminReports";
import Upgrade from "./pages/Upgrade";
import Analytics from "./pages/Analytics";
import EditProduct from "./pages/EditProduct";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { useLocation } from "react-router-dom";


function App() {

  const [keyword, setKeyword] = useState("");
  
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      if (userId) {
        socket.emit("addUser", userId);
      }

    } catch (error) {
      console.error("Invalid token");
    }

  }, []);


  return (
    <Router>

      <Navbar keyword={keyword} setKeyword={setKeyword} />
      <ScrollToTop />

      <Routes>
        

        <Route
          path="/"
          element={<Home keyword={keyword} />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/product/:slug" element={<ProductPage />} />

        <Route path="/sell" element={<CreateProduct />} />

        {/* <Route path="/dashboard" element={<Dashboard />} /> */}

        {/* CHAT ROUTES */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<Chat />} />

        <Route path="/my-listings" element={<MyListings />} />

        <Route path="/seller/:id" element={<SellerProfile />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/notifications" element={<NotificationDropdown />} />

        <Route path="/saved" element={<Saved />} />

        <Route path="/upgrade" element={<Upgrade />} />

        <Route path="/edit-product/:id" element={<EditProduct />} />

        <Route
 path="/admin"
 element={
   <AdminRoute>
     <AdminDashboard/>
   </AdminRoute>
 }
/>

<Route
 path="/admin/users"
 element={
   <AdminRoute>
     <AdminUsers/>
   </AdminRoute>
 }
/>

<Route
 path="/admin/products"
 element={
   <AdminRoute>
     <AdminProducts/>
   </AdminRoute>
 }
/>

<Route
 path="/admin/reports"
 element={
   <AdminRoute>
     <AdminReports/>
   </AdminRoute>
 }
/>

<Route path="/analytics" element={<Analytics />} />
      </Routes>

 <Footer />
    </Router>
  );
}

export default App;
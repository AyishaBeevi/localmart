import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  
  <AuthProvider>
    
    <Toaster position="top-center"  toastOptions={{
        duration: 7000 }} reverseOrder={false} />
        <HelmetProvider><App /></HelmetProvider>
    
  </AuthProvider>
)
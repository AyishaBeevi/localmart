import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  
  <AuthProvider>
    
   <Toaster
  position="top-center"
  reverseOrder={false}
  toastOptions={{
    duration: 7000,
    style: {
      zIndex: 9999,
      pointerEvents: "auto",
    },
  }}
/>
        <HelmetProvider><App /></HelmetProvider>
    
  </AuthProvider>
)
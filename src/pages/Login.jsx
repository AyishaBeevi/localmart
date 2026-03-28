import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Toaster,toast } from "react-hot-toast";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await API.post(
        "/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      navigate("/");

    } catch (err) {
      toast.error("Login failed");
    }
  };

  return (

    <div className="flex justify-center items-center h-screen">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 shadow-lg rounded-lg w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="w-full bg-brand text-white py-2 rounded">
          Login
        </button>

        <p className="mt-4 text-center">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>

      </form>

    </div>
  );
}

export default Login;
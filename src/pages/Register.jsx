import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      await API.post(
        "/auth/register",
        { name, email, password }
      );

      navigate("/login");

    } catch {
      toast.error("Registration failed");
    }

  };

  return (

    <div className="flex justify-center items-center h-screen">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 shadow-lg rounded-lg w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Register
        </h2>

        <input
          placeholder="Name"
          className="w-full border p-2 mb-4 rounded"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
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
          Register
        </button>

        <p className="mt-4 text-center">
          Already have an account? 
          <Link to="/login" className="text-blue-600"> Login</Link>
        </p>

      </form>

    </div>
  );
}

export default Register;
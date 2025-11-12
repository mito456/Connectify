import React, { useState } from "react";
import API from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Logging in with:", form);
      const res = await API.post("/auth/login", form);
      console.log("Login response:", res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Dispatch custom event to notify App component
      window.dispatchEvent(new Event("tokenChange"));
      
      console.log("Navigating to /feed");
      navigate("/feed");
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.msg || err.message || "Error logging in";
      alert(errorMsg);
    }
  };

  return (
    <div className="form-container">
      <h2>🔐 Welcome Back!</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="📧 Email or @username" onChange={handleChange} required />
        <input name="password" type="password" placeholder="🔑 Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;

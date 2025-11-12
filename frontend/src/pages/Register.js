import React, { useState } from "react";
import API from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      // Store the token and user info from registration response
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Dispatch custom event to notify App component
      window.dispatchEvent(new Event("tokenChange"));
      
      alert("Registered successfully!");
      navigate("/feed");
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.msg || err.message || "Error occurred";
      alert(errorMsg);
    }
  };

  return (
    <div className="form-container">
      <h2>🚀 Join Connectify!</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="👤 Full Name" onChange={handleChange} required />
        <input name="username" placeholder="@username (optional)" onChange={handleChange} />
        <input name="email" placeholder="📧 Email Address" onChange={handleChange} required />
        <input name="password" type="password" placeholder="🔑 Password" onChange={handleChange} required />
        <button type="submit">Create Account</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;

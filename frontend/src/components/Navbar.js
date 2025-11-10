import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/feed">Feed</Link>
      <Link to="/chat">Chat</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default Navbar;

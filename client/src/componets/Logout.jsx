
import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Logout.css";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        { withCredentials: true }
      );

      console.log("Logout successful:", res.data);
    } catch (err) {
      console.error(
        "Logout API error:",
        err.response?.data || err.message
      );
    } finally {
      // Clear frontend authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Reset student navigation state
      sessionStorage.removeItem("studentActiveTab");

      // Replace history entry instead of adding another one
      navigate("/login", { replace: true });
    }
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;

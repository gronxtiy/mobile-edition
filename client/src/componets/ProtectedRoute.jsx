import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    console.log("🔵 ProtectedRoute running");
    console.log("🔵 API URL:", import.meta.env.VITE_API_URL);
    console.log("🔵 Allowed role:", allowedRole);

    axios.get(
      `${import.meta.env.VITE_API_URL}/api/${allowedRole}/dashboard`,
      {
        withCredentials: true
      }
    )
    .then((res) => {
      console.log("✅ Dashboard auth success:", res.data);
      setAuthorized(true);
    })
    .catch((err) => {
      console.log(
        "❌ Auth error:",
        err.response?.data || err.message
      );
      setAuthorized(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [allowedRole]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

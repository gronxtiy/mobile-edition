
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");

    // No token means no dashboard access
    if (!token) {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/${allowedRole}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          cache: "no-store",
        }
      );

      // Ensure the same token is still present after the request
      if (localStorage.getItem("token") !== token) {
        setAuthorized(false);
        return;
      }

      console.log("Dashboard auth success:", res.data);
      setAuthorized(true);
    } catch (err) {
      console.error(
        "Authentication error:",
        err.response?.data || err.message
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, [allowedRole]);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const verify = async () => {
      const currentRequest = ++requestId;
      const token = localStorage.getItem("token");

      if (!token) {
        if (active && currentRequest === requestId) {
          setAuthorized(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        await axios.get(
          `${import.meta.env.VITE_API_URL}/api/${allowedRole}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            cache: "no-store",
          }
        );

        if (
          active &&
          currentRequest === requestId &&
          localStorage.getItem("token") === token
        ) {
          setAuthorized(true);
        }
      } catch (err) {
        if (active && currentRequest === requestId) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          setAuthorized(false);
        }
      } finally {
        if (active && currentRequest === requestId) {
          setLoading(false);
        }
      }
    };

    verify();

    const handlePageShow = () => {
      verify();
    };

    const handleStorage = (event) => {
      if (event.key === "token" && !event.newValue) {
        setAuthorized(false);
        setLoading(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("storage", handleStorage);

    return () => {
      active = false;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("storage", handleStorage);
    };
  }, [allowedRole]);

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!authorized || !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

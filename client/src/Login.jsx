
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

axios.defaults.withCredentials = true;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("✅ LOGIN SUCCESS:", result.data);

      if (result.data && result.data.user) {


        console.log("🔑 TOKEN FROM BACKEND:", result.data.token);

          // Save JWT token
  localStorage.setItem(
    "token",
    result.data.token
  );

        // Save user information only
        localStorage.setItem(
          "user",
          JSON.stringify(result.data.user)
        );

        localStorage.setItem(
          "role",
          result.data.role
        );

        // Student
        if (result.data.role === "student") {

          sessionStorage.setItem(
            "studentActiveTab",
            "Home"
          );

          navigate("/student/student", {
            replace: true,
          });

        }

        // Recruiter
        else if (result.data.role === "recruiter") {

          navigate("/recruiter/sidebar", {
            replace: true,
          });

        }

        // Unknown role
        else {

          navigate("/home", {
            replace: true,
          });

        }

      } else {

        alert("Login failed.");

      }

    } catch (err) {

      console.error(
        "❌ LOGIN ERROR:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
        "Something went wrong during login."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login-wrapper d-flex justify-content-center align-items-center">

      <div className="login-card bg-white shadow-lg rounded-4">

        <h3 className="text-center fw-bold mb-4">
          Welcome Back
        </h3>

        <form onSubmit={handleLogin}>

          <label className="form-label fw-semibold">
            Email
          </label>

          <input
            type="email"
            className="form-control form-control-lg mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="form-label fw-semibold">
            Password
          </label>

          <input
            type="password"
            className="form-control form-control-lg mb-2"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="text-end mb-3">
            <Link
              to="/forgotpassword"
              className="small text-decoration-none"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-4 mb-0">
            Don’t have an account?{" "}
            <Link
              to="/selectrole"
              className="fw-semibold text-decoration-none"
            >
              Register
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
};

export default Login;

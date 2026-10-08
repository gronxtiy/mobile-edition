
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  // =====================================================
  // REGISTER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!passwordRegex.test(password)) {
      setMessage(
        "❌ Password must contain uppercase, lowercase, special character and be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    if (!name.trim() || !email.trim()) {
      setMessage("❌ Please enter your name and email.");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      console.log("========== STUDENT REGISTER ==========");
      console.log("Name:", name);
      console.log("Email:", normalizedEmail);
      console.log("API:", `${API}/register`);

      /*
       * IMPORTANT:
       * Registration is a PUBLIC endpoint.
       *
       * We intentionally do not send Authorization/Bearer token.
       */

      const res = await axios.post(
        `${API}/register`,
        {
          name: name.trim(),
          email: normalizedEmail,
          password,
          confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("REGISTER RESPONSE:", res.data);

      setEmail(normalizedEmail);

      setMessage(
        "📩 OTP sent to your email. Please check your inbox and spam folder."
      );

      setShowOtpBox(true);

    } catch (err) {
      console.error("REGISTER ERROR:", err);

      if (err.response) {
        console.error("STATUS:", err.response.status);
        console.error("DATA:", err.response.data);

        setMessage(
          "❌ " +
            (err.response.data?.message ||
              "Registration failed.")
        );
      } else {
        setMessage(
          "❌ Cannot connect to the server. Please check your API URL."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setMessage("❌ Please enter the OTP.");
      return;
    }

    if (otp.trim().length !== 6) {
      setMessage("❌ OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const normalizedEmail = email.trim().toLowerCase();

      console.log("========== VERIFY OTP ==========");
      console.log("Email:", normalizedEmail);
      console.log("OTP:", otp);

      const res = await axios.post(
        `${API}/api/student/verify-otp`,
        {
          email: normalizedEmail,
          otp: otp.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("VERIFY RESPONSE:", res.data);

      setMessage("✅ Account verified successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("OTP VERIFY ERROR:", err);

      if (err.response) {
        setMessage(
          "❌ " +
            (err.response.data?.message ||
              "OTP verification failed.")
        );
      } else {
        setMessage(
          "❌ Cannot connect to the server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setMessage("❌ Email is missing.");
      return;
    }

    try {
      setResending(true);
      setMessage("");

      const normalizedEmail = email.trim().toLowerCase();

      console.log("========== RESEND OTP ==========");
      console.log("Email:", normalizedEmail);

      const res = await axios.post(
        `${API}/api/student/resend-otp`,
        {
          email: normalizedEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("RESEND RESPONSE:", res.data);

      setMessage(
        "📩 New OTP sent successfully. Please check your email."
      );

    } catch (err) {
      console.error("RESEND OTP ERROR:", err);

      if (err.response) {
        setMessage(
          "❌ " +
            (err.response.data?.message ||
              "Failed to resend OTP.")
        );
      } else {
        setMessage(
          "❌ Cannot connect to the server."
        );
      }
    } finally {
      setResending(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background:
          "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          width: "380px",
          borderRadius: "15px",
        }}
      >

        <h2 className="text-center fw-bold mb-4">
          Register
        </h2>

        {!showOtpBox ? (

          // =================================================
          // REGISTER FORM
          // =================================================

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email"
                className="form-control"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3 position-relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                className="form-control"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={loading}
              />

              <span
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </span>

            </div>

            <div className="mb-3">
              <input
                type="password"
                placeholder="Confirm Password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? "Sending OTP..."
                : "Register"}
            </button>

          </form>

        ) : (

          // =================================================
          // OTP FORM
          // =================================================

          <div>

            <div className="text-center mb-3">

              <p className="mb-1">
                OTP sent to
              </p>

              <strong>
                {email}
              </strong>

            </div>

            <div className="mb-3">

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="form-control text-center"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                disabled={loading}
              />

            </div>

            <button
              onClick={handleVerifyOtp}
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              className="btn btn-outline-primary w-100 mt-2"
              disabled={resending || loading}
            >
              {resending
                ? "Sending..."
                : "Resend OTP"}
            </button>

            <button
              type="button"
              className="btn btn-link w-100 mt-2"
              onClick={() => {
                setShowOtpBox(false);
                setOtp("");
                setMessage("");
              }}
              disabled={loading || resending}
            >
              ← Back to Registration
            </button>

          </div>
        )}

        {message && (
          <div
            className={`alert mt-3 ${
              message.includes("✅") ||
              message.includes("📩")
                ? "alert-success"
                : "alert-danger"
            }`}
          >
            {message}
          </div>
        )}

        {!showOtpBox && (
          <>
            <p className="text-center mt-3 mb-2">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="btn btn-light border w-100"
            >
              Login
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default Register;

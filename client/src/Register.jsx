import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const OTP_DURATION = 5 * 60 * 1000;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [resending, setResending] =
    useState(false);

  // ======================================================
  // OTP TIMER
  // ======================================================

  const [otpExpiry, setOtpExpiry] =
    useState(null);

  const [remainingTime, setRemainingTime] =
    useState(0);

  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  // ======================================================
  // START TIMER
  // ======================================================

  const startOtpTimer = (expiryTime) => {
    if (!expiryTime) {
      return;
    }

    const expiry =
      Number(expiryTime);

    setOtpExpiry(expiry);

    const seconds = Math.max(
      0,
      Math.ceil(
        (expiry - Date.now()) / 1000
      )
    );

    setRemainingTime(seconds);
  };

  // ======================================================
  // TIMER
  // ======================================================

  useEffect(() => {
    if (!showOtpBox || !otpExpiry) {
      return;
    }

    const timer = setInterval(() => {
      const seconds = Math.max(
        0,
        Math.ceil(
          (otpExpiry - Date.now()) /
            1000
        )
      );

      setRemainingTime(seconds);

      if (seconds <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [showOtpBox, otpExpiry]);

  // ======================================================
  // FORMAT TIMER
  // ======================================================

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds =
      totalSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // ======================================================
  // REGISTER
  // ======================================================

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
      setMessage(
        "❌ Passwords do not match."
      );
      return;
    }

    if (
      !name.trim() ||
      !email.trim()
    ) {
      setMessage(
        "❌ Please enter your name and email."
      );
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail =
        email.trim().toLowerCase();

      console.log(
        "========== STUDENT REGISTER =========="
      );

      console.log(
        "Name:",
        name.trim()
      );

      console.log(
        "Email:",
        normalizedEmail
      );

      console.log(
        "API:",
        `${API}/register`
      );

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
            "Content-Type":
              "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(
        "REGISTER RESPONSE:",
        res.data
      );

      // Save normalized email
      setEmail(normalizedEmail);

      // Clear previous OTP
      setOtp("");

      // Open OTP screen
      setShowOtpBox(true);

      // Start server-controlled timer
      startOtpTimer(
        res.data?.otpExpiry
      );

      setMessage(
        "📩 OTP sent successfully. Please check your email and spam folder."
      );

    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      if (err.response) {
        console.error(
          "STATUS:",
          err.response.status
        );

        console.error(
          "DATA:",
          err.response.data
        );

        setMessage(
          "❌ " +
            (
              err.response.data
                ?.message ||
              "Registration failed."
            )
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

  // ======================================================
  // VERIFY OTP
  // ======================================================

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setMessage(
        "❌ Please enter the OTP."
      );
      return;
    }

    if (otp.trim().length !== 6) {
      setMessage(
        "❌ OTP must be 6 digits."
      );
      return;
    }

    // Frontend check
    if (
      !otpExpiry ||
      Date.now() >= otpExpiry
    ) {
      setMessage(
        "❌ OTP expired. Please click Resend OTP."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const normalizedEmail =
        email.trim().toLowerCase();

      console.log(
        "========== VERIFY OTP =========="
      );

      console.log(
        "Email:",
        normalizedEmail
      );

      const res = await axios.post(
        `${API}/api/student/verify-otp`,
        {
          email: normalizedEmail,
          otp: otp.trim(),
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(
        "VERIFY RESPONSE:",
        res.data
      );

      // Stop timer
      setRemainingTime(0);
      setOtpExpiry(null);

      setMessage(
        "✅ Account verified successfully!"
      );

      // Go to login
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(
        "OTP VERIFY ERROR:",
        err
      );

      if (err.response) {
        setMessage(
          "❌ " +
            (
              err.response.data
                ?.message ||
              "OTP verification failed."
            )
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

  // ======================================================
  // RESEND OTP
  // ======================================================

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setMessage(
        "❌ Email is missing."
      );
      return;
    }

    // ====================================================
    // IMPORTANT FRONTEND PROTECTION
    // ====================================================

    if (
      otpExpiry &&
      Date.now() < otpExpiry
    ) {
      const seconds = Math.ceil(
        (otpExpiry - Date.now()) /
          1000
      );

      setMessage(
        `⏳ Please wait ${formatTime(
          seconds
        )} before requesting a new OTP.`
      );

      return;
    }

    try {
      setResending(true);
      setMessage("");

      const normalizedEmail =
        email.trim().toLowerCase();

      console.log(
        "========== RESEND OTP =========="
      );

      console.log(
        "Email:",
        normalizedEmail
      );

      const res = await axios.post(
        `${API}/api/student/resend-otp`,
        {
          email: normalizedEmail,
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(
        "RESEND RESPONSE:",
        res.data
      );

      // Clear old OTP input
      setOtp("");

      // Start NEW 5-minute timer
      startOtpTimer(
        res.data?.otpExpiry
      );

      setMessage(
        "📩 New OTP sent successfully. The previous OTP is no longer valid."
      );

    } catch (err) {
      console.error(
        "RESEND OTP ERROR:",
        err
      );

      if (err.response) {
        setMessage(
          "❌ " +
            (
              err.response.data
                ?.message ||
              "Failed to resend OTP."
            )
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

  // ======================================================
  // BACK TO REGISTRATION
  // ======================================================

  const handleBackToRegistration =
    () => {
      setShowOtpBox(false);

      setOtp("");

      setMessage("");

      setOtpExpiry(null);

      setRemainingTime(0);
    };

  // ======================================================
  // UI
  // ======================================================

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

          // ==================================================
          // REGISTER FORM
          // ==================================================

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name"
                className="form-control"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
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
                  setPassword(
                    e.target.value
                  )
                }
                required
                disabled={loading}
              />

              <span
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: "10px",
                  top: "10px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {showPassword
                  ? "🙈"
                  : "👁"}
              </span>

            </div>

            <div className="mb-3">
              <input
                type="password"
                placeholder="Confirm Password"
                className="form-control"
                value={
                  confirmPassword
                }
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

          // ==================================================
          // OTP FORM
          // ==================================================

          <div>

            <div className="text-center mb-3">

              <p className="mb-1">
                OTP sent to
              </p>

              <strong>
                {email}
              </strong>

            </div>

            {/* =================================================
                TIMER
            ================================================= */}

            <div className="text-center mb-3">

              {remainingTime > 0 ? (

                <>
                  <div
                    style={{
                      fontSize:
                        "28px",
                      fontWeight:
                        "bold",
                    }}
                  >
                    {formatTime(
                      remainingTime
                    )}
                  </div>

                  <small className="text-muted">
                    OTP expires in
                  </small>
                </>

              ) : (

                <div
                  className="text-danger fw-bold"
                >
                  OTP expired
                </div>

              )}

            </div>

            {/* =================================================
                OTP INPUT
            ================================================= */}

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

            {/* =================================================
                VERIFY BUTTON
            ================================================= */}

            <button
              onClick={handleVerifyOtp}
              className="btn btn-success w-100"
              disabled={
                loading ||
                resending ||
                remainingTime <= 0
              }
            >
              {loading
                ? "Verifying..."
                : remainingTime <= 0
                ? "OTP Expired"
                : "Verify OTP"}
            </button>

            {/* =================================================
                RESEND BUTTON
            ================================================= */}

            {remainingTime <= 0 && (
              <button
                type="button"
                onClick={
                  handleResendOtp
                }
                className="btn btn-outline-primary w-100 mt-2"
                disabled={
                  resending ||
                  loading
                }
              >
                {resending
                  ? "Sending New OTP..."
                  : "Resend OTP"}
              </button>
            )}

            {/* =================================================
                BACK
            ================================================= */}

            <button
              type="button"
              className="btn btn-link w-100 mt-2"
              onClick={
                handleBackToRegistration
              }
              disabled={
                loading ||
                resending
              }
            >
              ← Back to Registration
            </button>

          </div>
        )}

        {/* ====================================================
            MESSAGE
        ==================================================== */}

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

        {/* ====================================================
            LOGIN LINK
        ==================================================== */}

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

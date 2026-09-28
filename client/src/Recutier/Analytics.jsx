import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  TrendingUp,
  Clock,
  Award,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";

import "./Analytics.css";

// ======================================================
// API
// ======================================================

const API = (
  import.meta.env.VITE_API_URL ||
  "https://gronxtiy-backend.onrender.com"
).replace(/\/+$/, "");

const ANALYTICS_URL =
  `${API}/api/recruiter/analytics`;

// ======================================================
// COLORS
// ======================================================

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

// ======================================================
// FORMAT NUMBER
// ======================================================

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString();
};

// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ======================================================
// STATUS LABEL
// ======================================================

const getStatusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "selected":
    case "hired":
      return "status-success";

    case "shortlisted":
      return "status-shortlisted";

    case "reviewing":
      return "status-reviewing";

    case "rejected":
      return "status-rejected";

    default:
      return "status-default";
  }
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Analytics() {
  const [stats, setStats] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  // ====================================================
  // FETCH ANALYTICS
  // ====================================================

  const fetchAnalytics = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      console.log(
        "ANALYTICS API:",
        API
      );

      console.log(
        "ANALYTICS URL:",
        ANALYTICS_URL
      );

      const response =
        await axios.get(
          ANALYTICS_URL,
          {
            withCredentials: true,
          }
        );

      console.log(
        "Analytics response:",
        response.data
      );

      setStats(
        response.data
      );
    } catch (err) {
      console.error(
        "Analytics fetch error:",
        err
      );

      console.error(
        "Analytics request URL:",
        ANALYTICS_URL
      );

      console.error(
        "Analytics status:",
        err.response?.status
      );

      console.error(
        "Analytics response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />

          <p>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <div className="analytics-error-icon">
            <XCircle size={32} />
          </div>

          <h2>
            Unable to load analytics
          </h2>

          <p>{error}</p>

          <button
            className="analytics-retry-btn"
            onClick={() =>
              fetchAnalytics()
            }
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // DATA
  // ====================================================

  const totalApplications =
    Number(
      stats?.totalApplications || 0
    );

  const totalJobs =
    Number(
      stats?.totalJobs || 0
    );

  const publishedJobs =
    Number(
      stats?.publishedJobs || 0
    );

  const aiMatches =
    Number(
      stats?.aiMatches || 0
    );

  const shortlisted =
    Number(
      stats?.shortlisted || 0
    );

  const reviewing =
    Number(
      stats?.reviewing || 0
    );

  const rejected =
    Number(
      stats?.rejected || 0
    );

  const selected =
    Number(
      stats?.selected || 0
    );

  const hired =
    Number(
      stats?.hired || 0
    );

  const applicationsOverTime =
    Array.isArray(
      stats?.applicationsOverTime
    )
      ? stats.applicationsOverTime
      : [];

  const sourceBreakdown =
    Array.isArray(
      stats?.sourceBreakdown
    )
      ? stats.sourceBreakdown
      : [];

  const sourcePerformance =
    Array.isArray(
      stats?.sourcePerformance
    )
      ? stats.sourcePerformance
      : [];

  const departmentBreakdown =
    Array.isArray(
      stats?.departmentBreakdown
    )
      ? stats.departmentBreakdown
      : [];

  const recentApplications =
    Array.isArray(
      stats?.recentApplications
    )
      ? stats.recentApplications
      : [];

  const timeToHire =
    stats?.timeToHire || {
      average: null,
      fastest: null,
      slowest: null,
    };

  // ====================================================
  // KPI DATA
  // ====================================================

  const averageTime =
    timeToHire.average !== null &&
    timeToHire.average !== undefined
      ? `${timeToHire.average} days`
      : "N/A";

  const fastestTime =
    timeToHire.fastest !== null &&
    timeToHire.fastest !== undefined
      ? `${timeToHire.fastest} days`
      : "N/A";

  const slowestTime =
    timeToHire.slowest !== null &&
    timeToHire.slowest !== undefined
      ? `${timeToHire.slowest} days`
      : "N/A";

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="analytics-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="analytics-header">

        <div className="analytics-header-left">
          <div className="analytics-title-icon">
            <TrendingUp size={24} />
          </div>

          <div>
            <h1>
              Analytics
            </h1>

            <p>
              Hiring performance and insights
            </p>
          </div>
        </div>

        <button
          className="analytics-refresh-btn"
          onClick={() =>
            fetchAnalytics(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "analytics-refresh-spin"
                : ""
            }
          />

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>

      </div>

      {/* =================================================
          OVERVIEW CARDS
      ================================================= */}

      <div className="analytics-overview-grid">

        <div className="analytics-overview-card blue">
          <div className="analytics-overview-icon">
            <Clock size={22} />
          </div>

          <div>
            <span>
              Average Time to Hire
            </span>

            <strong>
              {averageTime}
            </strong>
          </div>
        </div>

        <div className="analytics-overview-card green">
          <div className="analytics-overview-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>
              Fastest Hire
            </span>

            <strong>
              {fastestTime}
            </strong>
          </div>
        </div>

        <div className="analytics-overview-card orange">
          <div className="analytics-overview-icon">
            <Award size={22} />
          </div>

          <div>
            <span>
              Slowest Hire
            </span>

            <strong>
              {slowestTime}
            </strong>
          </div>
        </div>

      </div>

      {/* =================================================
          GRAPH ROW
      ================================================= */}

      <div className="analytics-two-column">

        {/* APPLICATIONS GRAPH */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>
                Applications & Hires Over Time
              </h2>

              <p>
                Application and hiring trends
              </p>
            </div>
          </div>

          {applicationsOverTime.length >
          0 ? (
            <div className="analytics-chart-wrapper">

              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <LineChart
                  data={
                    applicationsOverTime
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    stroke="#6b7280"
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#ffffff",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius:
                        "10px",
                      boxShadow:
                        "0 5px 20px rgba(0,0,0,0.08)",
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      fill: "#3b82f6",
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="hired"
                    name="Hired"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      fill: "#10b981",
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>
          ) : (
            <EmptyChart
              message="No application data available yet"
            />
          )}

        </div>

        {/* SOURCE PIE */}

        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>
                Application Sources
              </h2>

              <p>
                Where candidates come from
              </p>
            </div>
          </div>

          {sourceBreakdown.length >
          0 ? (
            <div className="analytics-chart-wrapper">

              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <PieChart>

                  <Pie
                    data={
                      sourceBreakdown
                    }
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="48%"
                    outerRadius={105}
                    innerRadius={55}
                    paddingAngle={3}
                    label={({
                      source,
                      percent,
                    }) =>
                      `${source} ${(
                        percent * 100
                      ).toFixed(0)}%`
                    }
                  >

                    {sourceBreakdown.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={`source-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            </div>
          ) : (
            <EmptyChart
              message="No source data available yet"
            />
          )}

        </div>

      </div>

      {/* =================================================
          DEPARTMENT GRAPH
      ================================================= */}

      <div className="analytics-card analytics-full-card">

        <div className="analytics-card-header">
          <div>
            <h2>
              Hiring by Department
            </h2>

            <p>
              Applications and hires by department
            </p>
          </div>
        </div>

        {departmentBreakdown.length >
        0 ? (
          <div className="analytics-chart-wrapper">

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <BarChart
                data={
                  departmentBreakdown
                }
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="department"
                  stroke="#6b7280"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  stroke="#6b7280"
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="applications"
                  name="Applications"
                  fill="#3b82f6"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  maxBarSize={55}
                />

                <Bar
                  dataKey="hired"
                  name="Hired"
                  fill="#10b981"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  maxBarSize={55}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        ) : (
          <EmptyChart
            message="No department data available yet"
          />
        )}

      </div>

      {/* =================================================
          SOURCE PERFORMANCE
      ================================================= */}

      <div className="analytics-card analytics-full-card">

        <div className="analytics-card-header">
          <div>
            <h2>
              Source Performance
            </h2>

            <p>
              Candidate conversion by source
            </p>
          </div>
        </div>

        {sourcePerformance.length >
        0 ? (
          <div className="source-performance-list">

            {sourcePerformance.map(
              (
                source,
                index
              ) => {

                const conversionRate =
                  Math.min(
                    Number(
                      source.conversionRate ||
                        0
                    ),
                    100
                  );

                return (
                  <div
                    className="source-performance-item"
                    key={`${source.source}-${index}`}
                  >

                    <div className="source-performance-top">

                      <div className="source-name">
                        {source.source}
                      </div>

                      <div className="source-numbers">
                        <strong>
                          {source.hired}
                        </strong>

                        <span>
                          /
                        </span>

                        <span>
                          {
                            source.applications
                          }
                        </span>
                      </div>

                    </div>

                    <div className="source-performance-bar">

                      <div
                        className="source-performance-fill"
                        style={{
                          width: `${conversionRate}%`,
                        }}
                      />

                    </div>

                    <div className="source-performance-bottom">

                      <span>
                        {source.hired} hired
                      </span>

                      <strong>
                        {Number(
                          source.conversionRate ||
                            0
                        ).toFixed(1)}
                        % conversion
                      </strong>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        ) : (
          <div className="analytics-empty-state">
            No source performance data available
          </div>
        )}

      </div>

      {/* =================================================
          RECRUITMENT SUMMARY
      ================================================= */}

      <div className="analytics-card analytics-full-card">

        <div className="analytics-card-header">
          <div>
            <h2>
              Recruitment Summary
            </h2>

            <p>
              Current recruitment pipeline
            </p>
          </div>
        </div>

        <div className="analytics-summary-grid">

          <SummaryCard
            icon={<Users size={21} />}
            title="Applications"
            value={totalApplications}
            className="blue"
          />

          <SummaryCard
            icon={<Search size={21} />}
            title="AI Matches"
            value={aiMatches}
            className="purple"
          />

          <SummaryCard
            icon={<Briefcase size={21} />}
            title="Published Jobs"
            value={publishedJobs}
            className="green"
          />

          <SummaryCard
            icon={<Briefcase size={21} />}
            title="Total Jobs"
            value={totalJobs}
            className="orange"
          />

          <SummaryCard
            icon={<TrendingUp size={21} />}
            title="Reviewing"
            value={reviewing}
            className="blue"
          />

          <SummaryCard
            icon={<Award size={21} />}
            title="Shortlisted"
            value={shortlisted}
            className="purple"
          />

          <SummaryCard
            icon={<CheckCircle size={21} />}
            title="Hired"
            value={hired}
            className="green"
          />

          <SummaryCard
            icon={<XCircle size={21} />}
            title="Rejected"
            value={rejected}
            className="red"
          />

        </div>

      </div>

      {/* =================================================
          RECENT APPLICATIONS
      ================================================= */}

      <div className="analytics-card analytics-full-card">

        <div className="analytics-card-header">
          <div>
            <h2>
              Recent Applications
            </h2>

            <p>
              Latest candidates who applied
            </p>
          </div>
        </div>

        {recentApplications.length >
        0 ? (
          <div className="recent-applications-table-wrapper">

            <table className="recent-applications-table">

              <thead>
                <tr>
                  <th>
                    Candidate
                  </th>

                  <th>
                    Job
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Applied
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentApplications.map(
                  (application) => {

                    const snapshot =
                      application.studentSnapshot ||
                      {};

                    const candidateName =
                      snapshot.name ||
                      snapshot.fullName ||
                      snapshot.profileName ||
                      "Candidate";

                    return (
                      <tr
                        key={
                          application._id
                        }
                      >

                        <td>
                          <div className="candidate-cell">

                            {snapshot.photo ||
                            snapshot.profilePhoto ||
                            snapshot.image ? (
                              <img
                                src={
                                  snapshot.photo ||
                                  snapshot.profilePhoto ||
                                  snapshot.image
                                }
                                alt={
                                  candidateName
                                }
                              />
                            ) : (
                              <div className="candidate-avatar">
                                {candidateName
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>
                            )}

                            <span>
                              {
                                candidateName
                              }
                            </span>

                          </div>
                        </td>

                        <td>
                          {
                            application.jobTitle ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            application.jobDepartment ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            application.jobLocation ||
                            "-"
                          }
                        </td>

                        <td>
                          <span
                            className={`application-status ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {
                              application.status ||
                              "pending"
                            }
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            application.appliedAt
                          )}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        ) : (
          <div className="analytics-empty-state">
            No applications available yet
          </div>
        )}

      </div>

    </div>
  );
}

// ======================================================
// EMPTY CHART
// ======================================================

function EmptyChart({
  message,
}) {
  return (
    <div className="analytics-empty-chart">
      <TrendingUp size={30} />

      <span>
        {message}
      </span>
    </div>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
  icon,
  title,
  value,
  className,
}) {
  return (
    <div
      className={`analytics-summary-card ${className}`}
    >
      <div className="analytics-summary-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {formatNumber(value)}
        </strong>
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Star,
  X,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Play,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Clock3,
} from "lucide-react";
import "./VideoProfiles.css";

const API_BASE = import.meta.env.VITE_API_URL;

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getAppliedTime(dateString) {
  if (!dateString) return "";

  const appliedDate = new Date(dateString);

  if (Number.isNaN(appliedDate.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now - appliedDate;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${Math.max(minutes, 0)}m ago`;
  }

  if (hours < 24) {
    return `${Math.max(hours, 0)}h ago`;
  }

  return `${Math.max(days, 0)}d ago`;
}

export default function VideoProfiles() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selectedJobId, setSelectedJobId] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [resumeOpen, setResumeOpen] = useState(false);

  const videoRef = useRef(null);

  // =========================================================
  // FETCH RECRUITER JOBS
  // =========================================================

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);

        const res = await axios.get(
          `${API_BASE}/api/recruiter/my-jobs`,
          {
            withCredentials: true,
          }
        );

        const list = Array.isArray(res.data)
          ? res.data
          : [];

        setJobs(list);

        if (list.length > 0) {
          setSelectedJobId(list[0]._id);
        }
      } catch (error) {
        console.error(
          "Fetch recruiter jobs error:",
          error
        );

        alert(
          error.response?.data?.message ||
            "Failed to fetch jobs"
        );
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // =========================================================
  // FETCH APPLICANTS
  // =========================================================

  useEffect(() => {
    if (!selectedJobId) {
      setApplications([]);
      setCurrentIndex(0);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoadingApplications(true);

        let list = [];

        // -----------------------------------------------------
        // FIRST TRY RECOMMENDER
        // -----------------------------------------------------

        try {
          const res = await axios.get(
            `${API_BASE}/api/recommender/applicants/${selectedJobId}`,
            {
              withCredentials: true,
            }
          );

          list = Array.isArray(res.data)
            ? res.data
            : [];
        } catch (recommenderError) {
          console.warn(
            "Recommender unavailable. Using normal applications.",
            recommenderError?.message
          );

          // ---------------------------------------------------
          // FALLBACK TO NORMAL APPLICATIONS
          // ---------------------------------------------------

          const res = await axios.get(
            `${API_BASE}/api/recruiter/job/${selectedJobId}/applications`,
            {
              withCredentials: true,
            }
          );

          list = Array.isArray(res.data)
            ? res.data
            : [];
        }

        setApplications(list);
        setCurrentIndex(0);
      } catch (error) {
        console.error(
          "Fetch applications error:",
          error
        );

        setApplications([]);
        setCurrentIndex(0);

        alert(
          error.response?.data?.message ||
            "Failed to fetch applicants"
        );
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [selectedJobId]);

  // =========================================================
  // SELECTED JOB
  // =========================================================

  const selectedJob = useMemo(() => {
    return (
      jobs.find(
        (job) => job._id === selectedJobId
      ) || null
    );
  }, [jobs, selectedJobId]);

  // =========================================================
  // ACTIVE APPLICANTS
  // =========================================================

  const visibleApplicants = useMemo(() => {
    return applications.filter(
      (application) =>
        application.status !== "rejected"
    );
  }, [applications]);

  // =========================================================
  // CURRENT APPLICANT
  // =========================================================

  const candidate =
    visibleApplicants[currentIndex] || null;

  // =========================================================
  // IMPORTANT
  // SAME FIELD AS RECRUITER APPLICATIONS
  // =========================================================

  const applicantProfile =
    candidate?.studentSnapshot || {};

  const candidateVideo =
    applicantProfile.introVideoUrl || "";

  const candidateName =
    applicantProfile.name || "Student";

  const candidateHeadline =
    applicantProfile.headline ||
    "No headline added";

  const candidateImage =
    applicantProfile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      candidateName
    )}&background=random`;

  const candidateSkills = safeArray(
    applicantProfile.skills
  );

  const mainSkills = safeArray(
    applicantProfile.mainSkills
  );

  const experience = safeArray(
    applicantProfile.experience
  );

  const education = safeArray(
    applicantProfile.education
  );

  // =========================================================
  // RESET VIDEO WHEN CANDIDATE CHANGES
  // =========================================================

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, [candidateVideo, currentIndex]);

  // =========================================================
  // NEXT CANDIDATE
  // =========================================================

  const handleNext = () => {
    if (visibleApplicants.length <= 1) {
      return;
    }

    setCurrentIndex(
      (prev) =>
        (prev + 1) %
        visibleApplicants.length
    );
  };

  // =========================================================
  // PREVIOUS CANDIDATE
  // =========================================================

  const handlePrevious = () => {
    if (visibleApplicants.length <= 1) {
      return;
    }

    setCurrentIndex(
      (prev) =>
        (prev -
          1 +
          visibleApplicants.length) %
        visibleApplicants.length
    );
  };

  // =========================================================
  // KEYBOARD
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNext();
      }

      if (event.key === "ArrowLeft") {
        handlePrevious();
      }

      if (event.key === "Escape") {
        setResumeOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [visibleApplicants.length]);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateApplicationStatus = async (
    applicationId,
    status
  ) => {
    if (!applicationId || updatingStatus) {
      return false;
    }

    try {
      setUpdatingStatus(true);

      const res = await axios.put(
        `${API_BASE}/api/recruiter/application/${applicationId}/status`,
        {
          status,
        },
        {
          withCredentials: true,
        }
      );

      const updatedApplication =
        res.data?.application;

      if (!updatedApplication) {
        throw new Error(
          "Application update response missing"
        );
      }

      setApplications((prev) =>
        prev.map((item) =>
          item._id === applicationId
            ? {
                ...item,
                status:
                  updatedApplication.status,
              }
            : item
        )
      );

      return true;
    } catch (error) {
      console.error(
        "Update application status error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update application status"
      );

      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // SHORTLIST
  // =========================================================

  const handleShortlist = async () => {
    if (!candidate || updatingStatus) {
      return;
    }

    await updateApplicationStatus(
      candidate._id,
      "shortlisted"
    );
  };

  // =========================================================
  // REJECT
  // =========================================================

  const handleReject = async () => {
    if (!candidate || updatingStatus) {
      return;
    }

    const currentId = candidate._id;

    const ok =
      await updateApplicationStatus(
        currentId,
        "rejected"
      );

    if (!ok) {
      return;
    }

    setCurrentIndex((prev) => {
      if (
        prev >=
        visibleApplicants.length - 1
      ) {
        return Math.max(
          0,
          visibleApplicants.length - 2
        );
      }

      return prev;
    });
  };

  // =========================================================
  // MESSAGE
  // =========================================================

  const handleMessage = () => {
    if (!applicantProfile.email) {
      alert("Candidate email is not available.");
      return;
    }

    window.location.href = `mailto:${applicantProfile.email}`;
  };

  // =========================================================
  // RESUME
  // =========================================================

  const handleResume = () => {
    if (!candidate?.atsResumeHtml) {
      alert("Resume is not available.");
      return;
    }

    setResumeOpen(true);
  };

  // =========================================================
  // LOADING JOBS
  // =========================================================

  if (loadingJobs) {
    return (
      <div className="video-profiles-page">
        <div className="video-profiles-loading">
          <div className="video-loading-spinner" />
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO JOBS
  // =========================================================

  if (!jobs.length) {
    return (
      <div className="video-profiles-page">
        <div className="video-profiles-empty">
          <Briefcase size={48} />

          <h2>No jobs posted yet</h2>

          <p>
            Create a job and receive applications
            to view candidate intro videos.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="video-profiles-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="video-profile-topbar">

        <div className="video-profile-title">
          <h1>Video Profiles</h1>

          <span>
            {visibleApplicants.length} candidate
            {visibleApplicants.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        <div className="video-job-selector">
          <label>Select Job</label>

          <select
            value={selectedJobId}
            onChange={(event) => {
              setSelectedJobId(
                event.target.value
              );

              setCurrentIndex(0);
            }}
          >
            {jobs.map((job) => (
              <option
                key={job._id}
                value={job._id}
              >
                {job.title}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* =====================================================
          LOADING APPLICATIONS
      ===================================================== */}

      {loadingApplications ? (
        <div className="video-profiles-loading">
          <div className="video-loading-spinner" />

          <p>
            Loading candidate profiles...
          </p>
        </div>
      ) : visibleApplicants.length === 0 ? (

        /* ===================================================
           NO APPLICANTS
        =================================================== */

        <div className="video-profiles-empty">
          <Play size={48} />

          <h2>No applicants available</h2>

          <p>
            There are no active applicants for{" "}
            <strong>
              {selectedJob?.title ||
                "this job"}
            </strong>
            .
          </p>
        </div>

      ) : (

        /* ===================================================
           PROFILE VIEWER
        =================================================== */

        <div className="video-profile-viewer">

          {/* =================================================
              PROGRESS BARS
          ================================================= */}

          <div className="video-profile-progress">
            {visibleApplicants.map(
              (item, index) => (
                <button
                  key={item._id}
                  className={`video-progress-item ${
                    index === currentIndex
                      ? "active"
                      : ""
                  } ${
                    index < currentIndex
                      ? "completed"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                  }}
                >
                  <span />
                </button>
              )
            )}
          </div>

          {/* =================================================
              MEDIA
          ================================================= */}

          <div className="video-profile-media">

            {candidateVideo ? (

              <video
                key={candidateVideo}
                ref={videoRef}
                src={candidateVideo}
                className="video-profile-video"
                controls
                playsInline
                preload="auto"
                onError={(event) => {
                  console.error(
                    "INTRO VIDEO ERROR:",
                    event.currentTarget.error
                  );

                  console.error(
                    "INTRO VIDEO URL:",
                    candidateVideo
                  );
                }}
              >
                Your browser does not support
                video playback.
              </video>

            ) : (

              <div className="video-profile-no-video">

                <img
                  src={candidateImage}
                  alt={candidateName}
                  className="video-profile-image"
                />

                <div className="video-no-video-message">
                  <div className="no-video-icon">
                    <Play size={30} />
                  </div>

                  <h3>No intro video</h3>

                  <p>
                    This candidate has not
                    uploaded an introduction
                    video.
                  </p>
                </div>

              </div>

            )}

          </div>

          {/* =================================================
              CANDIDATE INFORMATION
          ================================================= */}

          <div className="video-profile-information">

            <div className="video-profile-info-content">

              <h2>
                {candidateName}
              </h2>

              <p className="video-profile-headline">
                {candidateHeadline}
              </p>

              {/* ---------------------------------------------
                  META
              --------------------------------------------- */}

              <div className="video-profile-meta">

                {applicantProfile.location && (
                  <span>
                    <MapPin size={15} />

                    {applicantProfile.location}
                  </span>
                )}

                {applicantProfile.email && (
                  <span>
                    <Mail size={15} />

                    {applicantProfile.email}
                  </span>
                )}

                {candidate.createdAt && (
                  <span>
                    <Clock3 size={15} />

                    Applied{" "}
                    {getAppliedTime(
                      candidate.createdAt
                    )}
                  </span>
                )}

              </div>

              {/* ---------------------------------------------
                  RANK + STATUS
              --------------------------------------------- */}

              <div className="video-profile-badges">

                <div className="video-profile-rank-badge">
                  <Star size={17} />

                  <span>
                    Rank #{currentIndex + 1}
                  </span>
                </div>

                <div
                  className={`video-profile-status-badge status-${candidate.status || "applied"}`}
                >
                  {candidate.status ||
                    "applied"}
                </div>

              </div>

              {/* ---------------------------------------------
                  SUMMARY
              --------------------------------------------- */}

              <div className="video-profile-summary">

                {experience.length > 0 && (
                  <div>
                    <Briefcase size={17} />

                    <span>
                      {experience.length ===
                      1
                        ? "1 experience"
                        : `${experience.length} experiences`}
                    </span>
                  </div>
                )}

                {education.length > 0 && (
                  <div>
                    <GraduationCap
                      size={17}
                    />

                    <span>
                      {education.length ===
                      1
                        ? "1 education"
                        : `${education.length} education entries`}
                    </span>
                  </div>
                )}

              </div>

              {/* ---------------------------------------------
                  SKILLS
              --------------------------------------------- */}

              {(mainSkills.length > 0 ||
                candidateSkills.length >
                  0) && (

                <div className="video-profile-skills">

                  {mainSkills.map(
                    (skill, index) => (
                      <span
                        key={`main-${skill}-${index}`}
                        className="video-skill primary"
                      >
                        {skill}
                      </span>
                    )
                  )}

                  {candidateSkills
                    .filter(
                      (skill) =>
                        !mainSkills.includes(
                          skill
                        )
                    )
                    .slice(0, 10)
                    .map(
                      (skill, index) => (
                        <span
                          key={`skill-${skill}-${index}`}
                          className="video-skill"
                        >
                          {skill}
                        </span>
                      )
                    )}

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              PREVIOUS
          ================================================= */}

          {visibleApplicants.length > 1 && (
            <button
              className="video-profile-navigation video-profile-prev"
              onClick={handlePrevious}
              aria-label="Previous candidate"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* =================================================
              NEXT
          ================================================= */}

          {visibleApplicants.length > 1 && (
            <button
              className="video-profile-navigation video-profile-next"
              onClick={handleNext}
              aria-label="Next candidate"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div className="video-profile-actions">

            {/* SHORTLIST */}

            <button
              className="video-action-btn shortlist"
              onClick={handleShortlist}
              disabled={
                updatingStatus ||
                candidate.status ===
                  "shortlisted"
              }
            >
              <span className="video-action-icon">
                <Star
                  size={24}
                  fill="currentColor"
                />
              </span>

              <span className="video-action-label">
                {candidate.status ===
                "shortlisted"
                  ? "Shortlisted"
                  : "Shortlist"}
              </span>
            </button>

            {/* REJECT */}

            <button
              className="video-action-btn reject"
              onClick={handleReject}
              disabled={
                updatingStatus ||
                candidate.status ===
                  "rejected"
              }
            >
              <span className="video-action-icon">
                <X size={25} />
              </span>

              <span className="video-action-label">
                Reject
              </span>
            </button>

            {/* MESSAGE */}

            <button
              className="video-action-btn message"
              onClick={handleMessage}
            >
              <span className="video-action-icon">
                <MessageSquare size={23} />
              </span>

              <span className="video-action-label">
                Message
              </span>
            </button>

            {/* RESUME */}

            <button
              className="video-action-btn resume"
              onClick={handleResume}
              disabled={
                !candidate.atsResumeHtml
              }
            >
              <span className="video-action-icon">
                <FileText size={23} />
              </span>

              <span className="video-action-label">
                Resume
              </span>
            </button>

          </div>

          {/* =================================================
              COUNTER
          ================================================= */}

          <div className="video-profile-counter">
            {currentIndex + 1} /{" "}
            {visibleApplicants.length}
          </div>

        </div>
      )}

      {/* =====================================================
          RESUME MODAL
      ===================================================== */}

      {resumeOpen &&
        candidate?.atsResumeHtml && (

          <div
            className="video-resume-modal-overlay"
            onClick={() =>
              setResumeOpen(false)
            }
          >

            <div
              className="video-resume-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="video-resume-modal-header">

                <div>
                  <h2>ATS Resume</h2>

                  <p>
                    {candidateName}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setResumeOpen(false)
                  }
                >
                  <X size={24} />
                </button>

              </div>

              <div className="video-resume-content">

                <iframe
                  title={`${candidateName} ATS Resume`}
                  srcDoc={
                    candidate.atsResumeHtml
                  }
                  className="video-resume-frame"
                />

              </div>

            </div>

          </div>

        )}

    </div>
  );
}
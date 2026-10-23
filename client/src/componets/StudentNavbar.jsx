
import React, { useState } from "react";
import { FiSearch, FiHeart, FiPlus } from "react-icons/fi";
import "./StudentNavbar.css";

function StudentNavbar({
  searchText,
  setSearchText,
  feedType,
  setFeedType,
  selectedTags = [],
  setSelectedTags,
  onNotificationClick,
  onCreatePostClick,
}) {
  const [showFilter, setShowFilter] = useState(false);

  const tabs = ["For You", "All", "Trending", "Other"];

  const technologies = [
    "AI/ML",
    "Python",
    "Java",
    "React",
    "Node.js",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
    "Cyber Security",
  ];

  const toggleTechnology = (tech) => {
    if (selectedTags.includes(tech)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== tech));
    } else {
      setSelectedTags([...selectedTags, tech]);
    }
  };

  const handleTabClick = (tab) => {
    if (tab === "Other") {
      setShowFilter((previous) => !previous);
      return;
    }

    setFeedType(tab);
    setShowFilter(false);
  };

  const applyFilters = () => {
    setFeedType("Other");
    setShowFilter(false);
  };

  return (
    <nav className="navbar">
      {/* LINE 1: LOGO + MOBILE ACTIONS */}
      <div className="logo-container">
        <button
          className="mobile-plus-btn"
          type="button"
          onClick={onCreatePostClick}
          aria-label="Create post"
        >
          <FiPlus />
        </button>

        <h1 className="logo-name">Gronxtiy</h1>

        <button
          className="mobile-heart-btn"
          type="button"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <FiHeart />
        </button>
      </div>

      {/* LINE 2: SEARCH */}
      <div className="search-box">
        <FiSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search Posts, Jobs..."
          className="search-input"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      {/* LINE 3: TABS AND FILTER */}
      <div className="nav-tabs-wrapper">
        <div className="nav-links">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={[
                feedType === tab ? "activeTab" : "",
                tab === "Other" && showFilter ? "activeTab" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-expanded={tab === "Other" ? showFilter : undefined}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FILTER DIRECTLY UNDER THE TABS */}
        {showFilter && (
          <div className="filter-dropdown">
            <h3>Select Technologies</h3>

            <div className="filter-grid">
              {technologies.map((tech) => (
                <label key={tech} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tech)}
                    onChange={() => toggleTechnology(tech)}
                  />
                  <span>{tech}</span>
                </label>
              ))}
            </div>

            <button
              className="apply-filter-btn"
              type="button"
              onClick={applyFilters}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default StudentNavbar;

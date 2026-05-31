import React from "react";
import { Link } from "react-router-dom";

export default function CourseCard({
  course,
  isEnrolled = false,
  isDemo = false,
  onEnroll,
  onOpen,
  user,
}) {
  const dashboardPath = user?.role === "instructor" ? "/instructor" : "/student";

  return (
    <article className="course-card">
      <div className="course-card-top">
        <span className="course-chip">{course.category || "Course"}</span>
        <span className="course-icon" aria-hidden="true">
          SF
        </span>
      </div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="course-meta">
        <span>{course.instructor?.name || "Course instructor"}</span>
      </div>
      <div className="card-actions">
        {isDemo && <span className="demo-label">Sample</span>}
        {onOpen && (
          <button className="btn btn-secondary btn-small" onClick={onOpen} type="button">
            View
          </button>
        )}
        {onEnroll ? (
          <button
            className={isEnrolled ? "btn btn-muted btn-small" : "btn btn-primary btn-small"}
            disabled={isEnrolled}
            onClick={onEnroll}
            type="button"
          >
            {isEnrolled ? "Enrolled" : "Enroll"}
          </button>
        ) : !isDemo ? (
          <Link className="btn btn-primary btn-small" to={user ? dashboardPath : "/login"}>
            {user ? "Open" : "Login to enroll"}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

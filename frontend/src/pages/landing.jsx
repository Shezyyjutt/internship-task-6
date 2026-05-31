import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import CourseCard from "../components/CourseCard";
import {
  buildCourseCatalog,
  demoInstructors,
  demoStudents,
  getCatalogStats,
} from "../data/demoData";

export default function Landing({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const visibleCourses = buildCourseCatalog(courses);
  const catalogStats = getCatalogStats(courses);
  const usingSampleData = !loading && catalogStats.hasSampleData;

  useEffect(() => {
    API.get("/courses")
      .then((res) => setCourses(res.data))
      .catch(() => setError("Unable to load courses right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <section className="hero-section">
        <div className="page-container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">SkillForge</span>
            <h1>Practical courses for real growth</h1>
            <p>
              Learn career-ready skills from focused courses, or share your
              expertise with students through a clean instructor workspace
            </p>
            <div className="hero-actions">
              <Link
                className="btn btn-primary"
                to={user ? (user.role === "instructor" ? "/instructor" : "/student") : "/register"}
              >
                {user ? "Open Dashboard" : "Start Free"}
              </Link>
              <a className="btn btn-secondary" href="#courses">Browse Courses</a>
            </div>
          </div>

          <div className="hero-card" aria-label="Course catalog summary">
            <span className="course-chip">Course catalog</span>
            <strong>{visibleCourses.length}</strong>
            <p>{visibleCourses.length === 1 ? "course available" : "courses available"}</p>
            <div className="hero-stats-row">
              <span>{catalogStats.instructors} instructors</span>
              <span>{catalogStats.students} learners</span>
            </div>
          </div>
        </div>
      </section>

      {!loading && (
        <section className="page-container stats-strip" aria-label="SkillForge sample activity">
          <article>
            <strong>{catalogStats.courses}</strong>
            <span>Courses</span>
          </article>
          <article>
            <strong>{catalogStats.students}</strong>
            <span>Students</span>
          </article>
          <article>
            <strong>{catalogStats.instructors}</strong>
            <span>Instructors</span>
          </article>
        </section>
      )}

      <section className="page-container section" id="courses">
        <div className="section-header">
          <div>
            <span className="eyebrow">{usingSampleData ? "Sample catalog" : "Courses"}</span>
            <h2>Available courses</h2>
          </div>
          <Link className="text-link" to={user ? "/student" : "/login"}>
            {user ? "Go to learning" : "Login to enroll"}
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="empty-state">Loading courses...</div>
        ) : visibleCourses.length > 0 ? (
          <div className="course-grid">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isDemo={course.isSample}
                user={user}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No courses available</h3>
            <p>New courses will appear here when instructors publish them</p>
          </div>
        )}
      </section>

      {!loading && usingSampleData && (
        <section className="page-container section">
          <div className="section-header">
            <div>
              <span className="eyebrow">Community</span>
              <h2>Instructors and learners</h2>
            </div>
          </div>
          <div className="people-layout">
            <div className="panel">
              <div className="panel-heading stacked">
                <span className="eyebrow">Instructors</span>
                <h3>Experienced mentors</h3>
              </div>
              <div className="person-list">
                {demoInstructors.slice(0, 10).map((instructor) => (
                  <article className="person-row" key={instructor.id}>
                    <span className="person-avatar">{instructor.name.charAt(0)}</span>
                    <div>
                      <strong>{instructor.name}</strong>
                      <p>{instructor.skills.slice(0, 2).join(" • ")}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading stacked">
                <span className="eyebrow">Students</span>
                <h3>Active learners</h3>
              </div>
              <div className="learner-cloud">
                {demoStudents.map((student) => (
                  <span key={student.id}>{student.name}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

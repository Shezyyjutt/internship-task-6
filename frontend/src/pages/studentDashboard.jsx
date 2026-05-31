import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import CourseCard from "../components/CourseCard";
import VideoPlayer from "../components/VideoPlayer";
import {
  buildCourseCatalog,
  demoInstructors,
  demoStudents,
  getCatalogStats,
} from "../data/demoData";

export default function StudentDashboard({ user }) {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const visibleCourses = buildCourseCatalog(availableCourses);
  const catalogStats = getCatalogStats(availableCourses);
  const usingSampleData = !loading && catalogStats.hasSampleData;

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.map((item) => item.course?._id).filter(Boolean)),
    [enrollments]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [coursesRes, enrolledRes] = await Promise.all([
        API.get("/courses"),
        API.get("/enroll/my-courses"),
      ]);
      setAvailableCourses(coursesRes.data);
      setEnrollments(enrolledRes.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load student dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (courseId) => {
    setError("");
    setMessage("");

    try {
      await API.post(`/enroll/${courseId}`);
      setMessage("Enrollment saved successfully");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to enroll in this course");
    }
  };

  const openCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setLessons([]);
    setError("");

    try {
      const { data } = await API.get(`/courses/${course._id}`);
      setLessons(data.lessons || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load course lessons");
    }
  };

  return (
    <div className="page dashboard-page">
      <section className="page-container dashboard-hero student-hero">
        <div>
          <span className="eyebrow">Student dashboard</span>
          <h1>Your SkillForge learning space</h1>
          <p>
            Welcome, {user?.name}. Browse courses, enroll, and open lessons
            from one clean dashboard
          </p>
        </div>
        <div className="metric-stack">
          <div className="metric-card">
            <strong>{catalogStats.courses}</strong>
            <span>available courses</span>
          </div>
          <div className="mini-metrics">
            <span>{catalogStats.instructors} instructors</span>
            <span>{usingSampleData ? catalogStats.students : enrollments.length} {usingSampleData ? "learners" : "enrolled"}</span>
          </div>
        </div>
      </section>

      <section className="page-container learning-layout">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Available</span>
              <h2>Course catalog</h2>
            </div>
            <button className="btn btn-secondary btn-small" onClick={loadData} type="button">
              Refresh
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {loading ? (
            <div className="empty-state compact">Loading courses...</div>
          ) : visibleCourses.length > 0 ? (
            <div className="student-course-grid">
              {visibleCourses.map((course) => (
                <CourseCard
                  course={course}
                  isDemo={course.isSample}
                  isEnrolled={!course.isSample && enrolledCourseIds.has(course._id)}
                  key={course._id}
                  onEnroll={course.isSample ? undefined : () => handleEnroll(course._id)}
                  onOpen={course.isSample ? undefined : () => openCourse(course)}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <h3>No courses available</h3>
              <p>New courses will appear here when instructors publish them</p>
            </div>
          )}
        </div>

        <aside className="panel player-panel">
          <div className="panel-heading stacked">
            <span className="eyebrow">Course viewer</span>
            <h2>{selectedCourse ? selectedCourse.title : "Select a course"}</h2>
          </div>

          {selectedCourse ? (
            <>
              <p className="viewer-description">{selectedCourse.description}</p>
              <div className="lesson-list">
                {lessons.length > 0 ? (
                  lessons.map((lesson) => (
                    <button
                      className={
                        selectedLesson?._id === lesson._id
                          ? "lesson-button active"
                          : "lesson-button"
                      }
                      key={lesson._id}
                      onClick={() => setSelectedLesson(lesson)}
                      type="button"
                    >
                      <span className="play-icon">Play</span>
                      <span>{lesson.title}</span>
                    </button>
                  ))
                ) : (
                  <div className="empty-state video-empty">
                    <h3>No lessons yet</h3>
                    <p>Lesson videos will appear here when they are added</p>
                  </div>
                )}
              </div>

              {selectedLesson && (
                <div className="now-playing">
                  <h3>{selectedLesson.title}</h3>
                  <VideoPlayer videoUrl={selectedLesson.videoUrl} />
                </div>
              )}
            </>
          ) : (
            <div className="empty-state video-empty">
              <h3>Pick a course</h3>
              <p>Open a course from the catalog to view its lessons</p>
            </div>
          )}
        </aside>
      </section>

      {usingSampleData && (
        <section className="page-container section">
          <div className="section-header">
            <div>
              <span className="eyebrow">SkillForge community</span>
              <h2>Students and instructors</h2>
            </div>
          </div>
          <div className="people-layout">
            <div className="panel">
              <div className="panel-heading stacked">
                <span className="eyebrow">Instructors</span>
                <h3>Course mentors</h3>
              </div>
              <div className="person-list">
                {demoInstructors.map((instructor) => (
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

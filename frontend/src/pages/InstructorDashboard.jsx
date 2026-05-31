import React, { useEffect, useState } from "react";
import API from "../services/api";
import { demoInstructors, demoStudents } from "../data/demoData";

export default function InstructorDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const categoryCount = new Set(courses.map((course) => course.category).filter(Boolean)).size;

  const loadCourses = () => {
    setLoading(true);
    API.get("/courses/mine")
      .then((res) => setCourses(res.data))
      .catch(() => setError("Unable to load your courses. Please login again"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    try {
      const { data } = await API.post("/courses", form);
      setCourses([data, ...courses]);
      setForm({ title: "", description: "", category: "" });
      setStatus("Course created successfully");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to create course");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setStatus("");

    try {
      await API.delete(`/courses/${id}`);
      setCourses(courses.filter((course) => course._id !== id));
      setStatus("Course deleted")
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete course");
    }
  };

  return (
    <div className="page dashboard-page">
      <section className="page-container dashboard-hero instructor-hero">
        <div>
          <span className="eyebrow">Instructor dashboard</span>
          <h1>Manage your SkillForge courses</h1>
          <p>
            Welcome, {user?.name}. Create courses and keep your instructor
            catalog up to date
          </p>
        </div>
        <div className="metric-stack">
          <div className="metric-card">
            <strong>{courses.length}</strong>
            <span>Your courses</span>
          </div>
          <div className="mini-metrics">
            <span>{categoryCount} categories</span>
          </div>
        </div>
      </section>

      <section className="page-container dashboard-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading stacked">
            <span className="eyebrow">Create</span>
            <h2>New course</h2>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {status && <div className="alert alert-success">{status}</div>}

          <label className="field">
            <span>Course title</span>
            <input
              name="title"
              onChange={handleChange}
              placeholder="React Fundamentals"
              required
              type="text"
              value={form.title}
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              name="description"
              onChange={handleChange}
              placeholder="What will students be able to do after this course?"
              required
              value={form.description}
            />
          </label>

          <label className="field">
            <span>Category</span>
            <input
              name="category"
              onChange={handleChange}
              placeholder="Web Development"
              required
              type="text"
              value={form.category}
            />
          </label>

          <button className="btn btn-primary full-width" type="submit">
            Save Course
          </button>
        </form>

        <div className="panel course-list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Catalog</span>
              <h2>My courses</h2>
            </div>
            <button className="btn btn-secondary btn-small" onClick={loadCourses} type="button">
              Refresh
            </button>
          </div>

          <div className="dashboard-list">
            {loading ? (
              <div className="empty-state compact">Loading your courses...</div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <article className="dashboard-course" key={course._id}>
                  <div>
                    <span className="course-chip">{course.category}</span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <small>Instructor: {course.instructor?.name || user?.name}</small>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(course._id)}
                    type="button"
                  >
                    Delete
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-state compact">
                <h3>No courses yet</h3>
                <p>Create a course to publish it on SkillForge</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="page-container section">
        <div className="section-header">
          <div>
            <span className="eyebrow">SkillForge community</span>
            <h2>Students and instructors</h2>
          </div>
        </div>
        <div className="stats-strip compact-strip">
          <article>
            <strong>{demoStudents.length}</strong>
            <span>Students</span>
          </article>
          <article>
            <strong>{demoInstructors.length}</strong>
            <span>Instructors</span>
          </article>
          <article>
            <strong>{courses.length}</strong>
            <span>Your courses</span>
          </article>
        </div>
        <div className="people-layout community-section">
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
    </div>
  );
}

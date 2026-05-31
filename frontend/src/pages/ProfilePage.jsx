import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { demoInstructors, demoStudents } from "../data/demoData";

export default function ProfilePage({ user, onProfileUpdate }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "student",
    bio: user?.bio || "",
    skills: (user?.skills || []).join(", "),
    profileImage: user?.profileImage || "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setSaving(true);

    try {
      const { data } = await API.put("/auth/me", {
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      onProfileUpdate(data.user);
      setStatus("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page dashboard-page">
      <section className="page-container profile-layout">
        <aside className="panel profile-summary">
          <div className="profile-avatar">
            {form.profileImage ? <img src={form.profileImage} alt="" /> : form.name.charAt(0)}
          </div>
          <h1>{form.name || "Your profile"}</h1>
          <p>{form.bio || "Add a short bio to personalize your SkillForge profile"}</p>
          <span className="course-chip">{form.role}</span>
        </aside>

        <form className="panel form-panel profile-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Profile</span>
              <h2>Personal details</h2>
            </div>
            <button
              className="btn btn-secondary btn-small"
              onClick={() => navigate(-1)}
              type="button"
            >
              Back
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {status && <div className="alert alert-success">{status}</div>}

          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input name="name" onChange={handleChange} required value={form.name} />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                name="email"
                onChange={handleChange}
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="field">
              <span>Role</span>
              <select name="role" onChange={handleChange} value={form.role}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </label>

            <label className="field">
              <span>Profile image URL</span>
              <input
                name="profileImage"
                onChange={handleChange}
                placeholder="https://example.com/profile.jpg"
                value={form.profileImage}
              />
            </label>
          </div>

          <label className="field">
            <span>Bio</span>
            <textarea
              name="bio"
              onChange={handleChange}
              placeholder="Tell learners or instructors a little about you."
              value={form.bio}
            />
          </label>

          <label className="field">
            <span>Skills</span>
            <input
              name="skills"
              onChange={handleChange}
              placeholder="React, Node.js, Product Design"
              value={form.skills}
            />
          </label>

          <button className="btn btn-primary full-width" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      <section className="page-container section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Community</span>
            <h2>SkillForge network</h2>
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
            <strong>{form.skills.split(",").filter(Boolean).length}</strong>
            <span>Your skills</span>
          </article>
        </div>
      </section>
    </div>
  );
}

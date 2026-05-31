import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { getUser, saveAuth } from "../utils/auth";

export default function AuthPage({ mode, onAuth }) {
  const isRegister = mode === "register";
  const currentUser = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    return (
      <Navigate
        to={currentUser.role === "instructor" ? "/instructor" : "/student"}
        replace
      />
    );
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };
      const { data } = await API.post(`/auth/${isRegister ? "register" : "login"}`, payload);

      if (isRegister) {
        navigate("/login", {
          replace: true,
          state: { message: data.msg || "Account created successfully. Please login." },
        });
        return;
      }

      saveAuth(data.token, data.user);
      onAuth(data.user);

      const fallback = data.user.role === "instructor" ? "/instructor" : "/student";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || "Authentication failed. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div>
          <span className="eyebrow">Secure learning workspace</span>
          <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p>
            Use SkillForge to publish courses, enroll in learning paths, and
            keep your profile connected to your work
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <form className="panel form-panel auth-form" onSubmit={handleSubmit}>
          <div className="panel-heading stacked">
          <span className="eyebrow">{isRegister ? "Register" : "Login"}</span>
          <h2>{isRegister ? "Start learning today" : "Access your dashboard"}</h2>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {isRegister && (
            <label className="field">
              <span>Name</span>
              <input
                name="name"
                onChange={handleChange}
                placeholder="Your full name"
                required
                type="text"
                value={form.name}
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              name="email"
              onChange={handleChange}
              placeholder="you@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              required
              type="password"
              value={form.password}
            />
          </label>

          {isRegister && (
            <label className="field">
              <span>Role</span>
              <select name="role" onChange={handleChange} value={form.role}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </label>
          )}

          <button className="btn btn-primary full-width" disabled={loading} type="submit">
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
          </button>

          <p className="form-switch">
            {isRegister ? "Already have an account?" : "New to SkillForge?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Login" : "Create an account"}
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}

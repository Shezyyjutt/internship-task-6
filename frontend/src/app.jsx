import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Landing from "./pages/landing";
import StudentDashboard from "./pages/studentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { getUser, logout, saveUser } from "./utils/auth";
import "./styles.css";

function ProtectedRoute({ user, role, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "instructor" ? "/instructor" : "/student"}
        replace
      />
    );
  }

  return children;
}

function AppShell() {
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleProfileUpdate = (updatedUser) => {
    saveUser(updatedUser);
    setUser(updatedUser);
  };

  const dashboardPath = user?.role === "instructor" ? "/instructor" : "/student";

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="navbar page-container" aria-label="Main navigation">
          <NavLink className="brand" to="/">
            <span className="brand-mark">SF</span>
            <span>SkillForge</span>
          </NavLink>

          <div className="nav-links">
            <NavLink to="/" end>
              Courses
            </NavLink>
            {user && <NavLink to={dashboardPath}>Dashboard</NavLink>}
            {!user && <NavLink to="/login">Login</NavLink>}
            {!user && <NavLink to="/register">Register</NavLink>}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <NavLink className="profile-pill" to="/profile">
                  <span className="avatar-thumb">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" />
                    ) : (
                      user.name?.charAt(0) || "S"
                    )}
                  </span>
                  <span>{user.name}</span>
                </NavLink>
                <button className="btn btn-secondary btn-small" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink className="btn btn-primary btn-small" to="/register">
                Get Started
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/login" element={<AuthPage mode="login" onAuth={setUser} />} />
          <Route
            path="/register"
            element={<AuthPage mode="register" onAuth={setUser} />}
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute user={user} role="student">
                <StudentDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute user={user} role="instructor">
                <InstructorDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <ProfilePage user={user} onProfileUpdate={handleProfileUpdate} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;

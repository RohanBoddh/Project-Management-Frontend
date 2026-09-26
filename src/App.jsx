import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import { AuthContext } from "./context/AuthContext";

/* ========= PAGES ========= */

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Teams from "./pages/Teams";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import MemberDashboard from "./pages/MemberDashboard";

import AllUsers from "./pages/AllUsers";
import Analytics from "./pages/Analytics";
import AssignManagers from "./pages/AssignManagers";
import Progress from "./pages/Progress";
import ProjectRequests from "./pages/ProjectRequests";

import MyTasks from "./pages/MyTasks";

/* ===== WORK SYSTEM (PRO LEVEL) ===== */
import ProjectWork from "./pages/ProjectWork";
import SendWork from "./pages/SendWork";
import ReceiveWork from "./pages/ReceiveWork";

function App() {
  const { user, loading } = useContext(AuthContext);

  /* ========= LOADING SCREEN ========= */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "#fff",
          fontSize: "22px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />

      <div className="app-content">
        <Routes>
          {/* ================= PUBLIC ================= */}

          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />

          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ================= COMMON AUTH ================= */}

          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />

          {/* ================= PROJECTS ================= */}

          <Route
            path="/projects"
            element={
              user?.role === "admin" || user?.role === "manager" ? (
                <Projects />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/teams"
            element={
              user?.role === "admin" || user?.role === "manager" ? (
                <Teams />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ================= MANAGER ================= */}

          <Route
            path="/manager"
            element={
              user?.role === "manager" ? (
                <ManagerDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/progress"
            element={
              user?.role === "manager" ? (
                <Progress />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ================= ADMIN ================= */}

          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/users"
            element={
              user?.role === "admin" ? (
                <AllUsers />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/analytics"
            element={
              user?.role === "admin" ? (
                <Analytics />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/assign"
            element={
              user?.role === "admin" ? (
                <AssignManagers />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/requests"
            element={
              user?.role === "admin" ? (
                <ProjectRequests />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ================= MEMBER ================= */}

          <Route
            path="/member"
            element={
              user?.role === "member" ? (
                <MemberDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/my-tasks"
            element={
              user?.role === "member" ? (
                <MyTasks />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ================= WORK SYSTEM (🔥 NEW) ================= */}

          {/* View project work */}
          <Route
            path="/project-work/:id"
            element={user ? <ProjectWork /> : <Navigate to="/login" replace />}
          />

          {/* Send work */}
          <Route
            path="/send-work/:id"
            element={user ? <SendWork /> : <Navigate to="/login" replace />}
          />

          {/* Receive work inbox */}
          <Route
            path="/receive-work"
            element={user ? <ReceiveWork /> : <Navigate to="/login" replace />}
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;

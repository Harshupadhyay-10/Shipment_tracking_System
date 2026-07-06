import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import TrackShipment from "./pages/TrackShipment";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={{ padding: "16px", borderBottom: "1px solid #eee", fontFamily: "sans-serif", display: "flex", gap: "16px", alignItems: "center" }}>
      <Link to="/">Track Shipment</Link>
      {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
      {!user && <Link to="/login">Login</Link>}
      {!user && <Link to="/signup">Sign Up</Link>}
      {user && (
        <span style={{ marginLeft: "auto" }}>
          Logged in as {user.name} ({user.role}){" "}
          <button onClick={handleLogout} style={{ marginLeft: "8px", cursor: "pointer" }}>
            Logout
          </button>
        </span>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<TrackShipment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
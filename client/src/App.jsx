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
    <nav className="navbar">
      <img src="/logo.png" alt="Go Between India Logistics" className="logo" />
      <Link to="/">Track Shipment</Link>
      {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
      {!user && <Link to="/login">Login</Link>}
      {!user && <Link to="/signup">Sign Up</Link>}
      {user && (
        <span className="user-info spacer">
          {user.name} ({user.role})
          <button onClick={handleLogout} className="btn btn-danger">
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
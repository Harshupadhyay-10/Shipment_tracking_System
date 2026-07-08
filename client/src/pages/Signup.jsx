import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: "", companyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", formData);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="page-container-narrow">
    <div className="card">
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input name="companyName" placeholder="Company Name (optional)" value={formData.companyName} onChange={handleChange} />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      {error && <p className="text-error">{error}</p>}
      <p className="text-muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  </div>
);
}

export default Signup;
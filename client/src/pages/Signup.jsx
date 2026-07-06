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
    <div style={styles.container}>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} style={styles.input} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} style={styles.input} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} style={styles.input} required />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} style={styles.input} required />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} style={styles.input} required />
        <input name="companyName" placeholder="Company Name (optional)" value={formData.companyName} onChange={handleChange} style={styles.input} />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "60px auto", fontFamily: "sans-serif", padding: "0 20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", fontSize: "16px", border: "1px solid #ccc", borderRadius: "4px" },
  button: { padding: "10px", fontSize: "16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red" },
};

export default Signup;
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import api from "../api/axios";
import AddressFields from "../components/AddressFields";

const emptyParty = {
  name: "",
  countryCode: "+91",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const emptyPackage = {
  weight: "",
  weightUnit: "kg",
  numberOfPackages: "",
  length: "",
  width: "",
  height: "",
  sizeUnit: "cm",
  description: "",
  buyingRate: "",
  sellingRate: "",
};

function AdminDashboard() {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState("Road");
  const [clientName, setClientName] = useState("");
  const [consignee, setConsignee] = useState("");
  const [sender, setSender] = useState(emptyParty);
  const [receiver, setReceiver] = useState(emptyParty);
  const [packageDetails, setPackageDetails] = useState(emptyPackage);

  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const [employeeForm, setEmployeeForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [creatingEmployee, setCreatingEmployee] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shipments");
      setShipments(res.data);
    } catch (err) {
      console.error("Failed to fetch shipments", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/users");
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchCustomers();
    fetchEmployees();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");

    const payload = {
      sender,
      receiver,
      mode,
      clientName,
      consignee,
      packageDetails: {
        ...packageDetails,
        weight: packageDetails.weight ? Number(packageDetails.weight) : undefined,
        numberOfPackages: packageDetails.numberOfPackages ? Number(packageDetails.numberOfPackages) : undefined,
        length: packageDetails.length ? Number(packageDetails.length) : undefined,
        width: packageDetails.width ? Number(packageDetails.width) : undefined,
        height: packageDetails.height ? Number(packageDetails.height) : undefined,
        buyingRate: packageDetails.buyingRate ? Number(packageDetails.buyingRate) : undefined,
        sellingRate: packageDetails.sellingRate ? Number(packageDetails.sellingRate) : undefined,
      },
    };

    try {
      const res = await api.post("/shipments", payload);
      setMessage(`Shipment created. Tracking number: ${res.data.trackingNumber}`);
      setMode("Road");
      setClientName("");
      setConsignee("");
      setSender(emptyParty);
      setReceiver(emptyParty);
      setPackageDetails(emptyPackage);
      fetchShipments();
    } catch (err) {
      setMessage("Failed to create shipment. Check all required fields.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (trackingNumber, status) => {
    const location = prompt("Enter current location (optional):") || "";
    const note = prompt("Add a note (optional):") || "";

    try {
      await api.patch(`/shipments/${trackingNumber}/status`, { status, location, note });
      fetchShipments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setCreatingEmployee(true);
    try {
      await api.post("/employees", employeeForm);
      setEmployeeForm({ name: "", email: "", password: "", phone: "", address: "" });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create employee");
    } finally {
      setCreatingEmployee(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm("Delete this employee account?")) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert("Failed to delete employee");
    }
  };

  const exportShipmentsToExcel = () => {
    const rows = shipments.map((s) => ({
      "Tracking Number": s.trackingNumber,
      "Mode": s.mode,
      "Client Name": s.clientName,
      "Consignee": s.consignee,
      "Sender Name": s.sender.name,
      "Sender Country Code": s.sender.countryCode,
      "Sender Phone": s.sender.phone,
      "Sender Address": s.sender.address,
      "Sender City": s.sender.city,
      "Sender State": s.sender.state,
      "Sender Pincode": s.sender.pincode,
      "Receiver Name": s.receiver.name,
      "Receiver Country Code": s.receiver.countryCode,
      "Receiver Phone": s.receiver.phone,
      "Receiver Address": s.receiver.address,
      "Receiver City": s.receiver.city,
      "Receiver State": s.receiver.state,
      "Receiver Pincode": s.receiver.pincode,
      "Weight": s.packageDetails?.weight || "",
      "Weight Unit": s.packageDetails?.weightUnit || "",
      "Number of Packages": s.packageDetails?.numberOfPackages || "",
      "Length": s.packageDetails?.length || "",
      "Width": s.packageDetails?.width || "",
      "Height": s.packageDetails?.height || "",
      "Size Unit": s.packageDetails?.sizeUnit || "",
      "Description": s.packageDetails?.description || "",
      "Buying Rate": s.packageDetails?.buyingRate || "",
      "Selling Rate": s.packageDetails?.sellingRate || "",
      "Margin":
        s.packageDetails?.buyingRate && s.packageDetails?.sellingRate
          ? s.packageDetails.sellingRate - s.packageDetails.buyingRate
          : "",
      "Added By": s.createdBy?.name || "N/A",
      "Added By Email": s.createdBy?.email || "N/A",
      "Current Status": s.currentStatus,
      "Created At": new Date(s.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments");
    XLSX.writeFile(workbook, `GoBetween_Shipments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportCustomersToExcel = () => {
    const rows = customers.map((c) => ({
      "Name": c.name,
      "Email": c.email,
      "Phone": c.phone,
      "Address": c.address,
      "Company Name": c.companyName || "",
      "Joined On": new Date(c.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, `GoBetween_Customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="page-container">
      <h1>Admin Dashboard, Go Between India Logistics</h1>

      <section className="section">
        <h2>Create New Shipment</h2>
        <form onSubmit={handleCreate} className="form">
          <fieldset className="fieldset">
            <legend>Booking Details</legend>
            <div className="row">
              <select value={mode} onChange={(e) => setMode(e.target.value)} required>
                <option value="Road">By Road</option>
                <option value="Air">By Air</option>
                <option value="Sea">By Sea</option>
              </select>
              <input
                placeholder="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <input
              placeholder="Consignee"
              value={consignee}
              onChange={(e) => setConsignee(e.target.value)}
              required
            />
          </fieldset>

          <AddressFields label="Sender" values={sender} onChange={setSender} />
          <AddressFields label="Receiver" values={receiver} onChange={setReceiver} />

          <fieldset className="fieldset">
            <legend>Package</legend>

            <div className="row">
              <input
                placeholder="Weight"
                value={packageDetails.weight}
                onChange={(e) => setPackageDetails({ ...packageDetails, weight: e.target.value })}
                style={{ flex: 1 }}
              />
              <select
                value={packageDetails.weightUnit}
                onChange={(e) => setPackageDetails({ ...packageDetails, weightUnit: e.target.value })}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
              </select>

              <input
                placeholder="Number of Packages"
                type="number"
                value={packageDetails.numberOfPackages}
                onChange={(e) => setPackageDetails({ ...packageDetails, numberOfPackages: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>

            <div className="row">
              <input
                placeholder="Length"
                value={packageDetails.length}
                onChange={(e) => setPackageDetails({ ...packageDetails, length: e.target.value })}
              />
              <input
                placeholder="Width"
                value={packageDetails.width}
                onChange={(e) => setPackageDetails({ ...packageDetails, width: e.target.value })}
              />
              <input
                placeholder="Height"
                value={packageDetails.height}
                onChange={(e) => setPackageDetails({ ...packageDetails, height: e.target.value })}
              />
              <select
                value={packageDetails.sizeUnit}
                onChange={(e) => setPackageDetails({ ...packageDetails, sizeUnit: e.target.value })}
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>

            <div className="row">
              <input
                placeholder="Buying Rate (₹)"
                type="number"
                value={packageDetails.buyingRate}
                onChange={(e) => setPackageDetails({ ...packageDetails, buyingRate: e.target.value })}
              />
              <input
                placeholder="Selling Rate (₹)"
                type="number"
                value={packageDetails.sellingRate}
                onChange={(e) => setPackageDetails({ ...packageDetails, sellingRate: e.target.value })}
              />
            </div>

            <input
              placeholder="Description"
              value={packageDetails.description}
              onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
            />
          </fieldset>

          <button type="submit" disabled={creating} className="btn btn-primary">
            {creating ? "Creating..." : "Create Shipment"}
          </button>
        </form>
        {message && <p><strong>{message}</strong></p>}
      </section>

      <section className="section">
        <div className="section-header">
          <h2>All Shipments</h2>
          <button onClick={exportShipmentsToExcel} className="btn btn-success">
            Export to Excel
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : shipments.length === 0 ? (
          <p>No shipments yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Mode</th>
                <th>From</th>
                <th>To</th>
                <th>Buying Rate</th>
                <th>Selling Rate</th>
                <th>Margin</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => {
                const buying = s.packageDetails?.buyingRate;
                const selling = s.packageDetails?.sellingRate;
                const hasBothRates = buying !== undefined && buying !== null && selling !== undefined && selling !== null;
                const margin = hasBothRates ? selling - buying : null;

                return (
                  <tr key={s._id}>
                    <td>{s.trackingNumber}</td>
                    <td>{s.mode}</td>
                    <td>{s.sender.city}</td>
                    <td>{s.receiver.city}</td>
                    <td>{buying !== undefined && buying !== null ? `₹${buying}` : "N/A"}</td>
                    <td>{selling !== undefined && selling !== null ? `₹${selling}` : "N/A"}</td>
                    <td>
                      {margin !== null ? (
                        <span style={{ color: margin >= 0 ? "#2E9E5B" : "#D64545", fontWeight: 600 }}>
                          ₹{margin}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${s.currentStatus}`}>
                        {s.currentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusUpdate(s.trackingNumber, e.target.value);
                          e.target.value = "";
                        }}
                      >
                        <option value="" disabled>Change status</option>
                        <option value="Pending">Pending</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <h2>Employees</h2>
        <form onSubmit={handleCreateEmployee} className="form" style={{ marginBottom: "20px" }}>
          <div className="row">
            <input
              placeholder="Name"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              required
            />
          </div>
          <div className="row">
            <input
              placeholder="Password"
              type="password"
              value={employeeForm.password}
              onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
              required
            />
            <input
              placeholder="Phone"
              value={employeeForm.phone}
              onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              required
            />
          </div>
          <input
            placeholder="Address"
            value={employeeForm.address}
            onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
            required
          />
          <button type="submit" disabled={creatingEmployee} className="btn btn-primary" style={{ width: "200px" }}>
            {creatingEmployee ? "Creating..." : "Add Employee"}
          </button>
        </form>

        {employees.length === 0 ? (
          <p>No employees added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDeleteEmployee(emp._id)} className="btn btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Registered Customers</h2>
          <button onClick={exportCustomersToExcel} className="btn btn-success">
            Export to Excel
          </button>
        </div>
        {customers.length === 0 ? (
          <p>No customers registered yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.companyName || "N/A"}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
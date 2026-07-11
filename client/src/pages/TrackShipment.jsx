import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function TrackShipment() {
  const { trackingNumberParam } = useParams();
  const [trackingNumber, setTrackingNumber] = useState(trackingNumberParam || "");
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const runTrack = async (number) => {
    setError("");
    setShipment(null);

    if (!number.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/track/${number.trim()}`);
      setShipment(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("No shipment found with this tracking number");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingNumberParam) {
      runTrack(trackingNumberParam);
    }
  }, [trackingNumberParam]);

  const handleTrack = (e) => {
    e.preventDefault();
    runTrack(trackingNumber);
  };

  return (
    <div className="page-container-narrow">
      <h1>Track Your Shipment</h1>
      <p className="text-muted">Go Between India Logistics</p>

      <form onSubmit={handleTrack} className="row" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter tracking number (e.g. GBIR7F3K9QXZ)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Tracking..." : "Track"}
        </button>
      </form>

      {error && <p className="text-error">{error}</p>}

      {shipment && (
        <div className="card">
          <h2>Tracking Number: {shipment.trackingNumber}</h2>
          <p><strong>Mode:</strong> {shipment.mode}</p>
          <p>
            <strong>From:</strong> {shipment.sender.city} &nbsp;to&nbsp;
            <strong>To:</strong> {shipment.receiver.city}
          </p>
          <p>
            <strong>Current Status:</strong>{" "}
            <span className={`status-badge status-${shipment.currentStatus}`}>
              {shipment.currentStatus}
            </span>
          </p>

          <h3>Status History</h3>
          <ul className="timeline">
            {shipment.statusHistory
              .slice()
              .reverse()
              .map((entry, idx) => (
                <li key={idx} className="timeline-item">
                  <strong>{entry.status}</strong>
                  {entry.location && ` at ${entry.location}`}
                  <br />
                  <small className="text-muted">{new Date(entry.updatedAt).toLocaleString()}</small>
                  {entry.note && <p className="text-muted">{entry.note}</p>}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TrackShipment;
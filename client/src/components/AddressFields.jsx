import { useState, useEffect } from "react";
import indiaStatesCities from "../data/indiaStatesCities";
import { lookupPincode } from "../utils/pincodeLookup";

const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+61", label: "Australia (+61)" },
];

function AddressFields({ label, values, onChange }) {
  const [availableCities, setAvailableCities] = useState([]);
  const [lookupStatus, setLookupStatus] = useState("");

  useEffect(() => {
    if (values.state && indiaStatesCities[values.state]) {
      setAvailableCities(indiaStatesCities[values.state]);
    } else {
      setAvailableCities([]);
    }
  }, [values.state]);

  const handleFieldChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const handlePincodeChange = async (value) => {
    handleFieldChange("pincode", value);

    if (/^\d{6}$/.test(value)) {
      setLookupStatus("Looking up...");
      const result = await lookupPincode(value);
      if (result) {
        onChange({
          ...values,
          pincode: value,
          state: result.state,
          city: result.city,
        });
        setLookupStatus("Auto-filled from pincode");
      } else {
        setLookupStatus("Pincode not found, please select manually");
      }
    } else {
      setLookupStatus("");
    }
  };

  return (
    <fieldset className="fieldset">
      <legend>{label}</legend>

      <input
        placeholder="Name"
        value={values.name}
        onChange={(e) => handleFieldChange("name", e.target.value)}
        required
      />

      <div className="phone-row">
        <select
          value={values.countryCode}
          onChange={(e) => handleFieldChange("countryCode", e.target.value)}
          className="country-code-select"
        >
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Phone Number"
          value={values.phone}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          required
          className="phone-input"
        />
      </div>

      <input
        placeholder="Address"
        value={values.address}
        onChange={(e) => handleFieldChange("address", e.target.value)}
        required
      />

      <input
        placeholder="Pincode"
        value={values.pincode}
        onChange={(e) => handlePincodeChange(e.target.value)}
        required
      />
      {lookupStatus && <small className="text-muted">{lookupStatus}</small>}

      <select
        value={values.state}
        onChange={(e) => handleFieldChange("state", e.target.value)}
        required
      >
        <option value="">Select State</option>
        {Object.keys(indiaStatesCities).map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <select
        value={values.city}
        onChange={(e) => handleFieldChange("city", e.target.value)}
        required
        disabled={!values.state}
      >
        <option value="">Select City</option>
        {availableCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </fieldset>
  );
}

export default AddressFields;
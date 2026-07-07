export async function lookupPincode(pincode) {
  if (!/^\d{6}$/.test(pincode)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();

    if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const office = data[0].PostOffice[0];
      return {
        state: office.State,
        city: office.District,
      };
    }
    return null;
  } catch (err) {
    console.error("Pincode lookup failed", err);
    return null;
  }
}
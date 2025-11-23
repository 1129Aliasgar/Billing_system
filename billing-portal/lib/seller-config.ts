// Seller information configuration
// Update these values with your actual business details

export const sellerInfo = {
  shopName: "GENERAL AUTO ELECTRIC & SAFETY",
  gstNumber: "27BJEPB1530Q1Z8", // Maharashtra GST code: 27
  address: "NANDGAON ROAD, DHOTANE, MANMAD. 423104, DISTRICT-NASHIK",
  state: "MAHARASHTRA",
  stateCode: "27",
  phone: "9271002667, 9028002667",
  email: "imranbootwala53@gmail.com",
  logo: undefined, // Optional: Add logo URL or base64 string here
}

// Helper function to check if GST number belongs to Maharashtra (code 27)
export function isMaharashtraGst(gstNumber?: string): boolean {
  if (!gstNumber) return false
  // GST number format: 27XXXXXXXXXXXXX (first 2 digits are state code)
  return gstNumber.startsWith("27")
}


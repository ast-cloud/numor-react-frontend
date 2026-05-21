export type TaxSystem = "GST" | "VAT" | "SALES";

export const getTaxSystem = (country: string): TaxSystem | "" => {
  if (!country) return "";
  if (country === "India") return "GST";
  if (country === "United States" || country === "US") return "SALES";
  return "VAT";
};

export const getTaxLabel = (country: string): string => {
  const sys = getTaxSystem(country);
  if (sys === "GST") return "GSTIN";
  if (sys === "VAT") return "VATIN";
  if (sys === "SALES") return "Sales Tax ID";
  return "Tax ID (GST/VAT/Sales Tax)";
};

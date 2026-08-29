export const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
export const monthBounds = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) throw new Error("Invalid month key");
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
};
export const toMinorUnits = (value: string) => {
  const normalized = value.replace(/,/g, "").trim();
  if (!/^\d*(\.\d{0,2})?$/.test(normalized)) return 0;
  return Math.round(Number(normalized || 0) * 100);
};
export const formatMoney = (minor: number, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: Math.abs(minor) % 100 ? 2 : 0 }).format(minor / 100);

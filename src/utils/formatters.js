export const safeNumber = (val) => (isNaN(val) ? 0 : val);

export const formatCurrency = (val) => `₹${safeNumber(val)}`;

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "N/A";

export const calcGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

export const sortByDate = (arr, key) =>
  [...arr].sort((a, b) => new Date(a[key]) - new Date(b[key]));
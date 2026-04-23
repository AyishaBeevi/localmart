import { useState, useEffect } from "react";

export default function FilterBar({ onChange }) {
  const [filters, setFilters] = useState({
    range: "30d",
    category: ""
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(filters);
    }, 500); 

    return () => clearTimeout(timeout);
  }, [filters, onChange]);

  const update = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex gap-4 mb-6">

      <select
        value={filters.range}
        onChange={(e) => update("range", e.target.value)}
      >
        <option value="7d">7 Days</option>
        <option value="30d">30 Days</option>
      </select>

      <input
        placeholder="Category"
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
      />

    

    </div>
  );
}
export default function StatCard({ title, value, change, color }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-textMuted text-xs uppercase">{title}</p>

      <h2 className={`text-2xl font-bold mt-2 ${color}`}>
        {value ?? 0}
      </h2>

      {change !== undefined && (
        <p className={`text-xs mt-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
          {change >= 0 ? "+" : ""}{change}%
        </p>
      )}
    </div>
  );
}
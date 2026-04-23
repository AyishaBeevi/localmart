import { ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, LineChart, Line } from "recharts";

export default function ChartCard({
  title,
  data,
  type = "bar",
  onClick
}) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="mb-4 font-medium">{title}</h3>

      <ResponsiveContainer width="100%" height={250}>
        {type === "bar" ? (
          <BarChart data={data} onClick={onClick}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        ) : (
          <LineChart data={data} onClick={onClick}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="count" stroke="#22c55e" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
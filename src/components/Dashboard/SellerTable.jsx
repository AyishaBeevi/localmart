import { formatDate } from "../../utils/formatters";

export default function SellerTable({ sellers }) {
  if (!sellers?.length) {
    return <p className="p-4 text-textMuted">No sellers</p>;
  }

  return (
    <div className="bg-white border rounded-xl divide-y">
      {sellers.map(s => {
        const active =
          s.subscriptionExpiry &&
          new Date(s.subscriptionExpiry) > new Date();

        return (
          <div key={s._id} className="flex justify-between p-4">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs">{s.email}</p>
              <p className="text-xs">
                Expiry: {formatDate(s.subscriptionExpiry)}
              </p>
            </div>

            <span className={`text-xs px-2 py-1 rounded-full ${
              active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              {active ? "Active" : "Expired"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
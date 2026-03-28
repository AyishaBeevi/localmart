function Analytics() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">

      {/* Header */}
      <h1 className="text-3xl font-semibold mb-6">
        Marketplace Analytics
      </h1>

      {/* Dashboard Image */}
      <div className="bg-[#111827] p-4 rounded-2xl shadow-xl mb-8">
        <img
          src="src/images/analyticspb.png" 
          alt="Analytics Dashboard"
          className="rounded-xl w-full"
        />
      </div>

      {/* Insights Section */}
      <div className="bg-[#111827] p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          Key Insights
        </h2>

        <ul className="space-y-2 text-gray-300">
          <li>• Electronics dominate product listings</li>
          <li>• Low category diversity indicates growth opportunity</li>
          <li>• Product uploads are limited → user engagement needs improvement</li>
        </ul>
      </div>

    </div>
  );
}

export default Analytics;
import { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../layout/AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { handleError } from "../../utils/errorHandler";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    reports: 0,
    pendingProducts: 0,
    flaggedProducts: 0,
    sellerCount: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0,
    recentSellers: []
  });

  const [analytics, setAnalytics] = useState({
    productsByCategory: [],
    productsPerDay: [],
    subscriptionTrend: []
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

  // ================= FETCH STATS =================
  const fetchStats = async () => {
    try {
      const res = await API.get(
        "/admin/stats",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(res.data);
    } catch (err) {
      handleError(err);
    }
  };

  //  FETCH ANALYTICS 
  const fetchAnalytics = async () => {
    try {
      const res = await API.get(
        "/analytics/overview"
      );

      const formattedCategory = res.data.productsByCategory.map(item => ({
        category: item._id,
        count: item.count
      }));

      const formattedDaily = res.data.productsPerDay.map(item => ({
        date: item._id,
        count: item.count
      }));

      const formattedSubscription = res.data.subscriptionTrend
  .map(item => ({
    date: item._id,
    count: item.count
  }))
  .sort((a, b) => new Date(a.date) - new Date(b.date));

      setAnalytics({
        productsByCategory: formattedCategory,
        productsPerDay: formattedDaily,
        subscriptionTrend: formattedSubscription
      });

    } catch (err) {
      handleError(err);
    }
  };

  if (!analytics.subscriptionTrend.length) {
  return <p className="text-textMuted">No subscription data</p>;
}

  const generateInsights = () => {
    const insights = [];

    const categories = analytics.productsByCategory;
    const daily = analytics.productsPerDay;

    if (!categories.length) return [];

    const topCategory = [...categories].sort((a, b) => b.count - a.count)[0];
    const totalProducts = categories.reduce((sum, c) => sum + c.count, 0);

    const percentage = ((topCategory.count / totalProducts) * 100).toFixed(1);

    insights.push(
      `${topCategory.category} dominates listings with ${percentage}% of total products`
    );

    const lowCategories = categories.filter(c => c.count <= 1);
    if (lowCategories.length > 0) {
      insights.push(
        `${lowCategories.length} categories have low activity and need promotion`
      );
    }

    const subs = analytics.subscriptionTrend;

if (subs.length >= 2) {
  const latest = subs[subs.length - 1].count;
  const previous = subs[subs.length - 2].count;

  if (previous > 0) {
    const growth = (((latest - previous) / previous) * 100).toFixed(1);

    if (growth > 0) {
      insights.push(`Subscriptions grew by ${growth}% compared to previous period`);
    } else {
      insights.push(`Subscriptions dropped by ${Math.abs(growth)}% recently`);
    }
  }
}

    if (daily.length >= 2) {
      const latest = daily[daily.length - 1].count;
      const previous = daily[daily.length - 2].count;

      if (previous > 0) {
        const growth = (((latest - previous) / previous) * 100).toFixed(1);

        if (growth > 0) {
          insights.push(`Product uploads increased by ${growth}% compared to previous day`);
        } else {
          insights.push(`Product uploads decreased by ${Math.abs(growth)}% compared to previous day`);
        }
      }
    }

    return insights;
  };

  return (
    <AdminLayout>

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-8">
        Dashboard Overview
      </h1>

      {/*  STATS  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard title="Users" value={stats.users} />
        <StatCard title="Products" value={stats.products} />
        <StatCard title="Reports" value={stats.reports} color="text-red-600" />
        <StatCard title="Pending" value={stats.pendingProducts} color="text-yellow-600" />
        <StatCard title="Flagged" value={stats.flaggedProducts} color="text-orange-600" />
        <StatCard title="Subscribed Sellers" value={stats.sellerCount} color="text-green-600" />

        
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} color="text-green-500" />
        <StatCard title="Expired Subscriptions" value={stats.expiredSubscriptions} color="text-red-500" />
        <StatCard title="Revenue" value={`₹${stats.totalRevenue}`} color="text-indigo-600" />
      </div>

      {/* SELLERS  */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">
          Recent Subscribers
        </h2>

        <div className="bg-white border rounded-xl divide-y">
          {stats.recentSellers?.length === 0 ? (
            <p className="p-4 text-textMuted">No sellers yet.</p>
          ) : (
            stats.recentSellers.map(s => {
              const isActive = s.subscriptionExpiry && new Date(s.subscriptionExpiry) > new Date();

              return (
                <div key={s._id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-textMuted">{s.email}</p>

                    {/*  NEW: EXPIRY */}
                    <p className="text-xs mt-1">
                      Expiry:{" "}
                      <span className="text-gray-600">
                        {s.subscriptionExpiry
                          ? new Date(s.subscriptionExpiry).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </p>
                  </div>

                  {/*  STATUS BADGE */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}>
                    {isActive ? "Active" : "Expired"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/*  LIVE ANALYTICS  */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-6">
          Live Marketplace Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white border rounded-xl p-5">
            <h3 className="mb-4 font-medium">Products by Category</h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.productsByCategory}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h3 className="mb-4 font-medium">Daily Upload Trend</h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.productsPerDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

{/*  SUBSCRIPTION TREND  */}
<div className="mt-12">
  <h2 className="text-lg font-semibold mb-6">
    Subscription Growth
  </h2>

  <div className="bg-white border rounded-xl p-5">
    <h3 className="mb-4 font-medium">New Subscriptions Over Time</h3>

    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={analytics.subscriptionTrend}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#6366f1" />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>


      {/*  POWER BI  */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">
          Power BI Dashboard (External BI Tool)
        </h2>

        <div className="bg-[#111827] p-4 rounded-2xl shadow-lg">
          <img
            src="/images/analyticspb.png"
            alt="Power BI Dashboard"
            className="w-full rounded-xl"
          />
        </div>

        <p className="text-xs text-textMuted mt-2">
          Built using Power BI for advanced data visualization and reporting.
        </p>
      </div>

      {/*  INSIGHTS  */}
      <div className="bg-white border rounded-xl p-5 mt-10">
        <h3 className="font-semibold mb-3">AI Insights</h3>

        <ul className="text-sm text-gray-600 space-y-2">
          {generateInsights().map((insight, index) => (
            <li key={index}>• {insight}</li>
          ))}
        </ul>
      </div>

    </AdminLayout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white border rounded-xl p-5 hover:shadow-sm transition">
      <p className="text-textMuted text-xs uppercase tracking-wide">
        {title}
      </p>

      <h2 className={`text-2xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
    </div>
  );
}

export default AdminDashboard;
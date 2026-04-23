import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import API from "../utils/api";
import { handleError } from "../utils/errorHandler";
import { calcGrowth, sortByDate } from "../utils/formatters";

export default function useDashboardData(filters) {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({
    productsByCategory: [],
    productsPerDay: [],
    subscriptionTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const isFirstLoad = useRef(true);
  const controllerRef = useRef(null);

  // ✅ CLEAN QUERY BUILDER (stable + no empty params)
  const buildQuery = useCallback((filters) => {
    const params = {};

    if (filters?.range) params.range = filters.range;
    if (filters?.category?.trim()) params.category = filters.category.trim();
    if (filters?.seller?.trim()) params.seller = filters.seller.trim();

    return new URLSearchParams(params).toString();
  }, []);

  // ✅ STABLE FETCH FUNCTION
  const fetchData = useCallback(async () => {
    try {
      // cancel previous request
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      controllerRef.current = new AbortController();

      // only show loading on first load
      if (isFirstLoad.current) {
        setLoading(true);
      }

      const query = buildQuery(filters);

      const [statsRes, analyticsRes] = await Promise.all([
        API.get("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controllerRef.current.signal
        }),
        API.get(`/analytics/overview?${query}`, {
          signal: controllerRef.current.signal
        })
      ]);

      const raw = analyticsRes.data || {};

      // ✅ SAFE NORMALIZATION
      const normalized = {
        productsByCategory:
          raw.productsByCategory?.map(i => ({
            category: i._id ?? "Unknown",
            count: i.count ?? 0
          })) || [],

        productsPerDay: sortByDate(
          raw.productsPerDay?.map(i => ({
            date: i._id ?? "",
            count: i.count ?? 0
          })) || [],
          "date"
        ),

        subscriptionTrend: sortByDate(
          raw.subscriptionTrend?.map(i => ({
            date: i._id ?? "",
            count: i.count ?? 0
          })) || [],
          "date"
        )
      };

      setStats(statsRes.data || {});
      setAnalytics(normalized);
      setError(null);

    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(err);
        handleError(err);
      }
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, [filters, token, buildQuery]);

  //  FETCH ON FILTER CHANGE
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //  AUTO REFRESH (STABLE)
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  //  MEMOIZED INSIGHTS
  const insights = useMemo(() => {
    if (!analytics.productsByCategory.length) return [];

    const categories = analytics.productsByCategory;
    const daily = analytics.productsPerDay;
    const subs = analytics.subscriptionTrend;

    const insights = [];

    // top category
    const top = [...categories].sort((a, b) => b.count - a.count)[0];
    const total = categories.reduce((s, c) => s + c.count, 0);

    if (top && total > 0) {
      insights.push(
        `${top.category} dominates with ${((top.count / total) * 100).toFixed(1)}%`
      );
    }

    // subscription growth
    if (subs.length >= 2) {
      const growth = calcGrowth(
        subs.at(-1).count,
        subs.at(-2).count
      );

      insights.push(
        growth >= 0
          ? `Subscriptions grew by ${growth}%`
          : `Subscriptions dropped ${Math.abs(growth)}%`
      );
    }

    // daily growth
    if (daily.length >= 2) {
      const growth = calcGrowth(
        daily.at(-1).count,
        daily.at(-2).count
      );

      insights.push(
        growth >= 0
          ? `Uploads increased ${growth}%`
          : `Uploads dropped ${Math.abs(growth)}%`
      );
    }

    return insights;
  }, [analytics]);

  return {
    stats,
    analytics,
    insights,
    loading,
    error,
    refetch: fetchData
  };
}
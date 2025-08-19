"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

interface VisitorLog {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  ipQuery: string;
  lat: number;
  lon: number;
  dateVisited: any;
}

export default function AnalyticsPage() {
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate metrics from visitor logs
  const calculateMetrics = (logs: VisitorLog[]) => {
    const totalVisitors = logs.length;
    const uniqueVisitors = new Set(logs.map((log) => log.ipQuery)).size;

    // Calculate today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = logs.filter((log) => {
      let visitDate;
      if (typeof log.dateVisited.toDate === "function") {
        visitDate = log.dateVisited.toDate();
      } else if (
        typeof log.dateVisited === "object" &&
        typeof log.dateVisited._seconds === "number"
      ) {
        visitDate = new Date(log.dateVisited._seconds * 1000);
      } else if (
        typeof log.dateVisited === "string" ||
        typeof log.dateVisited === "number"
      ) {
        visitDate = new Date(log.dateVisited);
      } else {
        return false;
      }
      return visitDate >= today;
    }).length;

    // Calculate this week's visitors
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekVisitors = logs.filter((log) => {
      let visitDate;
      if (typeof log.dateVisited.toDate === "function") {
        visitDate = log.dateVisited.toDate();
      } else if (
        typeof log.dateVisited === "object" &&
        typeof log.dateVisited._seconds === "number"
      ) {
        visitDate = new Date(log.dateVisited._seconds * 1000);
      } else if (
        typeof log.dateVisited === "string" ||
        typeof log.dateVisited === "number"
      ) {
        visitDate = new Date(log.dateVisited);
      } else {
        return false;
      }
      return visitDate >= weekAgo;
    }).length;

    return { totalVisitors, uniqueVisitors, todayVisitors, thisWeekVisitors };
  };

  // Calculate weekly data from visitor logs
  const calculateWeeklyData = (logs: VisitorLog[]) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = days.map((day) => ({ day, visitors: 0 }));

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    logs.forEach((log) => {
      let visitDate;
      if (typeof log.dateVisited.toDate === "function") {
        visitDate = log.dateVisited.toDate();
      } else if (
        typeof log.dateVisited === "object" &&
        typeof log.dateVisited._seconds === "number"
      ) {
        visitDate = new Date(log.dateVisited._seconds * 1000);
      } else if (
        typeof log.dateVisited === "string" ||
        typeof log.dateVisited === "number"
      ) {
        visitDate = new Date(log.dateVisited);
      } else {
        return;
      }

      if (visitDate >= weekStart) {
        const dayIndex = visitDate.getDay();
        weeklyData[dayIndex].visitors++;
      }
    });

    return weeklyData;
  };

  // Calculate country data from visitor logs
  const calculateCountryData = (logs: VisitorLog[]) => {
    const countryCounts: { [key: string]: number } = {};

    logs.forEach((log) => {
      if (log.country) {
        countryCounts[log.country] = (countryCounts[log.country] || 0) + 1;
      }
    });

    return countryCounts;
  };

  const fetchVisitorLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user from Firebase Auth
      const { auth } = await import("@/app/lib/firebase");
      const { onAuthStateChanged } = await import("firebase/auth");

      return new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user || !user.email) {
            setError("No authenticated user found");
            setLoading(false);
            resolve();
            return;
          }

          try {
            // Get user data from Firestore
            const usersRef = collection(db, "users");
            const userQuery = query(usersRef, where("email", "==", user.email));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
              throw new Error("User not found in database");
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            // Determine tenant ID based on user role
            let tenantId = "";
            if (userData.role === "admin" && userData.companyId) {
              tenantId = userData.companyId;
            } else if (userData.tenantList && userData.tenantList.length > 0) {
              tenantId = userData.tenantList[0];
            }

            if (!tenantId) {
              throw new Error("No tenant ID found for user");
            }

            // Fetch visitor logs from the subcollection
            const visitorLogsRef = collection(
              doc(db, "tenants", tenantId),
              "visitorLogs"
            );
            const visitorLogsQuery = query(
              visitorLogsRef,
              orderBy("dateVisited", "desc")
            );
            const visitorLogsSnapshot = await getDocs(visitorLogsQuery);

            const logs: VisitorLog[] = [];
            visitorLogsSnapshot.forEach((doc) => {
              logs.push({
                id: doc.id,
                ...doc.data(),
              } as VisitorLog);
            });

            setVisitorLogs(logs);
          } catch (err) {
            console.error("Error fetching visitor logs:", err);
            setError(
              err instanceof Error
                ? err.message
                : "Failed to fetch visitor logs"
            );
          } finally {
            setLoading(false);
            resolve();
          }
        });

        // Cleanup subscription after a timeout to prevent memory leaks
        setTimeout(() => {
          unsubscribe();
        }, 10000);
      });
    } catch (err) {
      console.error("Error in fetchVisitorLogs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch visitor logs"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorLogs();
  }, []);

  // Calculate metrics and weekly data
  const metrics = calculateMetrics(visitorLogs);
  const weeklyData = calculateWeeklyData(visitorLogs);
  const maxVisitors = Math.max(...weeklyData.map((d) => d.visitors), 1);

  // Format date for display
  const formatDate = (dateField: any) => {
    if (!dateField) return "";
    if (typeof dateField.toDate === "function") {
      return dateField.toDate().toLocaleString();
    }
    if (
      typeof dateField === "object" &&
      typeof dateField._seconds === "number"
    ) {
      return new Date(dateField._seconds * 1000).toLocaleString();
    }
    if (typeof dateField === "string" || typeof dateField === "number") {
      const d = new Date(dateField);
      return isNaN(d.getTime()) ? "" : d.toLocaleString();
    }
    return "";
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
            <svg
              className="h-8 w-8 text-orange-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-700 mb-4 tracking-tight">
            Loading Analytics...
          </h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-700 mb-4 tracking-tight">
            Error Loading Analytics
          </h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchVisitorLogs}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
          <svg
            className="h-8 w-8 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-700 mb-4 tracking-tight">
          Visitor Analytics
        </h1>

        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Track visitor activity, page views, and engagement metrics for your
          website.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500 mb-4">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-orange-900 mb-2">
            Total Page Views
          </h3>
          <p className="text-3xl font-bold text-orange-700">
            {metrics.totalVisitors.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500 mb-4">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-orange-900 mb-2">
            Unique Visitors
          </h3>
          <p className="text-3xl font-bold text-orange-700">
            {metrics.uniqueVisitors.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500 mb-4">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-orange-900 mb-2">
            Today's Views
          </h3>
          <p className="text-3xl font-bold text-orange-700">
            {metrics.todayVisitors.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500 mb-8">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0H4m0 0h4m-4 0v14a2 2 0 002 2h8a2 2 0 002-2V7H4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-orange-900 mb-2">
            This Week
          </h3>
          <p className="text-3xl font-bold text-orange-700">
            {metrics.thisWeekVisitors.toLocaleString()}
          </p>
        </div>
      </div>

      {/* World Map and Weekly Chart Row */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* World Map */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Visitor Locations
            </h2>
            <div className="h-80 relative">
              <ComposableMap
                projection="geoEqualEarth"
                projectionConfig={{
                  scale: 120,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <ZoomableGroup>
                  <Geographies geography="https://unpkg.com/world-atlas@2/countries-110m.json">
                    {({ geographies }) =>
                      geographies ? (
                        geographies.map((geo) => {
                          const countryName = geo.properties?.name || "Unknown";
                          const visitorCount =
                            calculateCountryData(visitorLogs)[countryName] || 0;
                          const isHighlighted = visitorCount > 0;

                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={isHighlighted ? "#f97316" : "#f3f4f6"}
                              stroke="#ffffff"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: {
                                  fill: isHighlighted ? "#ea580c" : "#e5e7eb",
                                  outline: "none",
                                },
                                pressed: { outline: "none" },
                              }}
                              onMouseEnter={(evt) => {
                                const { clientX, clientY } = evt;
                                setTooltipContent(
                                  `${countryName}: ${visitorCount} visitors`
                                );
                                setTooltipPosition({ x: clientX, y: clientY });
                              }}
                              onMouseLeave={() => {
                                setTooltipContent("");
                              }}
                            />
                          );
                        })
                      ) : (
                        <text>Loading map...</text>
                      )
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>

              {/* Tooltip */}
              {tooltipContent && (
                <div
                  className="absolute bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg pointer-events-none z-10"
                  style={{
                    left: tooltipPosition.x + 10,
                    top: tooltipPosition.y - 40,
                  }}
                >
                  {tooltipContent}
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Countries with visitors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>No visitors</span>
                </div>
              </div>

              {/* Countries with visitors summary */}
              {(() => {
                const countryData = calculateCountryData(visitorLogs);
                const countriesWithVisitors = Object.entries(countryData)
                  .filter(([_, count]) => count > 0)
                  .sort(([_, a], [__, b]) => b - a)
                  .slice(0, 3);

                if (countriesWithVisitors.length > 0) {
                  return (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Top visitor countries:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {countriesWithVisitors.map(([country, count]) => (
                          <span
                            key={country}
                            className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                          >
                            {country} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Weekly Visitors
            </h2>
            <div className="flex items-end justify-between h-80 space-x-2">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative">
                    <div
                      className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t w-full min-h-[20px] hover:from-orange-600 hover:to-orange-500 transition-colors cursor-pointer"
                      style={{
                        height: `${(day.visitors / maxVisitors) * 200}px`,
                      }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.visitors} visitors
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600">
                    {day.day}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Total: {weeklyData.reduce((sum, day) => sum + day.visitors, 0)}{" "}
                visitors this week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitor Logs */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Visitor Activity
        </h2>

        {visitorLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Visitor Data
            </h3>
            <p className="text-gray-500">
              No visitor logs found for your company.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visitorLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
                        <svg
                          className="h-5 w-5 text-orange-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {log.city}, {log.country}
                        </h3>
                        <p className="text-sm text-gray-500">
                          IP: {log.ipQuery}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-600">
                          {log.lat.toFixed(4)}, {log.lon.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                          />
                        </svg>
                        <span className="text-gray-600">
                          {log.countryCode.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-600">
                          {formatDate(log.dateVisited)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {visitorLogs.length > 10 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing 10 of {visitorLogs.length} recent visitor logs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId?: string;
  tenantList?: string[];
}

interface Company {
  id: string;
  companyName: string;
  companyAddress: {
    address: string;
    country: string;
  };
  contactDetails: {
    contactNo: string;
    website: string;
  };
  companyCode: string;
  companySize: string;
  ein: string;
  industry: string;
  visitorCount: number;
  createdAt: any;
  tier?: string;
  numAddnalCompanies?: number;
}

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

export default function CompaniesPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    visitorLogs: VisitorLog[];
    loading: boolean;
    error: string | null;
  }>({
    visitorLogs: [],
    loading: false,
    error: null,
  });
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [numAddnalCompanies, setNumAddnalCompanies] = useState<number>(0);
  const [usedCompanies, setUsedCompanies] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async (userEmail: string) => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const data = userDoc.data();

          setUserProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            role: data.role || "user",
            companyId: data.companyId,
            tenantList: data.tenantList || [],
          });
        } else {
          setError("User profile not found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchUserData(user.email);
      } else {
        setError("User not authenticated");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!userProfile) return;

      try {
        const db = getFirestore();
        const companiesData: Company[] = [];

        // Get all tenant IDs the user has access to
        const tenantIds: string[] = [];

        if (userProfile.role === "admin" && userProfile.companyId) {
          tenantIds.push(userProfile.companyId);
        }

        if (userProfile.tenantList && userProfile.tenantList.length > 0) {
          tenantIds.push(...userProfile.tenantList);
        }

        // Remove duplicates
        const uniqueTenantIds = [...new Set(tenantIds)];

        // Fetch each company's data
        for (const tenantId of uniqueTenantIds) {
          const tenantDoc = await getDoc(doc(db, "tenants", tenantId));

          if (tenantDoc.exists()) {
            const data = tenantDoc.data();

            // Fetch subscription tier
            let tier = "Free";
            try {
              const subscriptionDoc = await getDoc(
                doc(db, "tenants", tenantId, "payments", "subscriptions")
              );
              if (subscriptionDoc.exists()) {
                tier = subscriptionDoc.data().tier || "Free";
              }
            } catch (error) {
              console.log("Could not fetch subscription data");
            }

            companiesData.push({
              id: tenantId,
              companyName: data.companyName || "Unknown Company",
              companyAddress: data.companyAddress || {
                address: "",
                country: "",
              },
              contactDetails: data.contactDetails || {
                contactNo: "",
                website: "",
              },
              companyCode: data.companyCode || "",
              companySize: data.companySize || "",
              ein: data.ein || "",
              industry: data.industry || "",
              visitorCount: data.visitorCount || 0,
              createdAt: data.createdAt,
              tier: tier,
            });
          }
        }

        setCompanies(companiesData);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchCompanies();
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchNumAddnalCompanies = async () => {
      if (!userProfile) return;

      try {
        const db = getFirestore();
        const currentUserEmail = auth.currentUser?.email;
        console.log("Fetching numAddnalCompanies for email:", currentUserEmail);

        if (currentUserEmail) {
          const usersRef = collection(db, "users");
          const userQuery = query(
            usersRef,
            where("email", "==", currentUserEmail)
          );
          const userSnapshot = await getDocs(userQuery);

          console.log("User snapshot size:", userSnapshot.size);

          if (!userSnapshot.empty) {
            const currentUser = userSnapshot.docs[0];
            const currentUserId = currentUser.id;
            console.log("Found user ID:", currentUserId);

            const userPaymentsDoc = await getDoc(
              doc(db, "users", currentUserId, "payments", "subscriptions")
            );

            console.log("Payments doc exists:", userPaymentsDoc.exists());

            if (userPaymentsDoc.exists()) {
              const userPaymentsData = userPaymentsDoc.data();
              console.log("Payments data:", userPaymentsData);
              const numAddnal = userPaymentsData.numAddnalCompanies || 0;
              console.log("numAddnalCompanies value:", numAddnal);
              setNumAddnalCompanies(numAddnal);
            } else {
              console.log("No payments document found");
              setNumAddnalCompanies(0);
            }
          } else {
            console.log("No user document found");
            setNumAddnalCompanies(0);
          }
        } else {
          console.log("No current user email");
          setNumAddnalCompanies(0);
        }
      } catch (error) {
        console.error("Error fetching numAddnalCompanies:", error);
        setNumAddnalCompanies(0);
      }
    };

    if (userProfile) {
      fetchNumAddnalCompanies();
    }
  }, [userProfile]);

  // Update used companies when userProfile changes
  useEffect(() => {
    if (userProfile && userProfile.tenantList) {
      setUsedCompanies(userProfile.tenantList.length);
    }
  }, [userProfile]);

  const fetchAnalytics = async (companyId: string) => {
    setAnalyticsData({ visitorLogs: [], loading: true, error: null });

    try {
      const db = getFirestore();
      const visitorLogsRef = collection(
        doc(db, "tenants", companyId),
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

      setAnalyticsData({ visitorLogs: logs, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsData({
        visitorLogs: [],
        loading: false,
        error: "Failed to fetch analytics data",
      });
    }
  };

  const openAnalytics = (company: Company) => {
    setSelectedCompany(company);
    setShowAnalyticsModal(true);
    fetchAnalytics(company.id);
  };

  const closeAnalytics = () => {
    setShowAnalyticsModal(false);
    setSelectedCompany(null);
    setAnalyticsData({ visitorLogs: [], loading: false, error: null });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "base":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "free":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

    return { totalVisitors, uniqueVisitors, todayVisitors };
  };

  const calculateCountryData = (logs: VisitorLog[]) => {
    const countryCounts: { [key: string]: number } = {};
    logs.forEach((log) => {
      if (log.country) {
        countryCounts[log.country] = (countryCounts[log.country] || 0) + 1;
      }
    });
    return countryCounts;
  };

  // Map country names from visitor logs to world map country names
  const mapCountryName = (visitorCountryName: string): string => {
    const countryMappings: { [key: string]: string } = {
      USA: "United States of America",
      "United States": "United States of America",
      "United States of America": "United States of America",
      US: "United States of America",
      "U.S.A.": "United States of America",
      "U.S.": "United States of America",
      UK: "United Kingdom",
      "Great Britain": "United Kingdom",
      England: "United Kingdom",
      UAE: "United Arab Emirates",
      "Czech Republic": "Czechia",
      "South Korea": "Korea",
      "North Korea": "Korea",
      "Democratic Republic of the Congo": "Congo",
      "Republic of the Congo": "Congo",
      "Côte d'Ivoire": "Ivory Coast",
      "Cote d'Ivoire": "Ivory Coast",
      Myanmar: "Burma",
      Brunei: "Brunei Darussalam",
      "Cape Verde": "Cabo Verde",
      "East Timor": "Timor-Leste",
      Swaziland: "Eswatini",
      Macedonia: "North Macedonia",
      "Vatican City": "Vatican",
      "Holy See": "Vatican",
    };

    return countryMappings[visitorCountryName] || visitorCountryName;
  };

  const getCountryVisitorCount = (
    worldMapCountryName: string,
    visitorLogs: VisitorLog[]
  ): number => {
    const countryData = calculateCountryData(visitorLogs);
    let totalCount = 0;

    // Check for exact match first
    if (countryData[worldMapCountryName]) {
      totalCount += countryData[worldMapCountryName];
    }

    // Check for mapped variations
    Object.entries(countryData).forEach(([visitorCountry, count]) => {
      const mappedName = mapCountryName(visitorCountry);
      if (mappedName === worldMapCountryName) {
        totalCount += count;
      }
    });

    return totalCount;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
        <div className="text-center">
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
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">
            Loading Companies...
          </h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
        <div className="text-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">Error</h1>
          <p className="text-red-600 mb-8">{error}</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
        <div className="text-center">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">
            No Companies Found
          </h1>
          <p className="text-gray-500 mb-8">
            You don't have access to any companies yet. Contact your
            administrator to get access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Companies Management
        </h1>
        <p className="text-gray-500">
          Manage your company profiles and view detailed information.
        </p>
        {/* Display total companies including base + additional */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Total Companies
              </h3>
              <p className="text-xs text-blue-700">
                Used / Available companies
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {usedCompanies}/{1 + numAddnalCompanies}
              </div>
              <div className="text-xs text-blue-600">
                {numAddnalCompanies > 0
                  ? `+${numAddnalCompanies} additional`
                  : "Base plan"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {company.companyName}
                </h3>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {company.industry || "N/A"}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  className="h-4 w-4 mr-1"
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
                {company.companySize || "N/A"}
              </div>
            </div>

            {/* Company Details */}
            <div className="p-6 space-y-4">
              {/* Company Code & EIN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Company Code
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {company.companyCode || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    EIN
                  </label>
                  <p className="text-sm text-gray-900">
                    {company.ein || "N/A"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Address
                </label>
                <p className="text-sm text-gray-900">
                  {company.companyAddress?.address || "N/A"}
                  {company.companyAddress?.country && (
                    <span className="block text-gray-500">
                      {company.companyAddress.country}
                    </span>
                  )}
                </p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Phone
                  </label>
                  <p className="text-sm text-gray-900">
                    {company.contactDetails?.contactNo || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Website
                  </label>
                  <p className="text-sm text-gray-900">
                    {company.contactDetails?.website ? (
                      <a
                        href={company.contactDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {company.contactDetails.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Visitors
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {company.visitorCount || 0}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(company.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => openAnalytics(company)}
                  className="flex-1 bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-orange-700 transition-colors duration-200"
                >
                  Analytics
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedCompany && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Analytics - {selectedCompany.companyName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Visitor analytics and insights
                </p>
              </div>
              <button
                onClick={closeAnalytics}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {analyticsData.loading ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                    <svg
                      className="h-6 w-6 text-orange-600 animate-spin"
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
                  <p className="text-gray-600">Loading analytics...</p>
                </div>
              ) : analyticsData.error ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-600">{analyticsData.error}</p>
                </div>
              ) : (
                <>
                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {(() => {
                      const metrics = calculateMetrics(
                        analyticsData.visitorLogs
                      );
                      // Calculate weekly visitors
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      const weeklyVisitors = analyticsData.visitorLogs.filter(
                        (log) => {
                          let visitDate;
                          if (typeof log.dateVisited?.toDate === "function") {
                            visitDate = log.dateVisited.toDate();
                          } else if (
                            typeof log.dateVisited === "object" &&
                            typeof log.dateVisited._seconds === "number"
                          ) {
                            visitDate = new Date(
                              log.dateVisited._seconds * 1000
                            );
                          } else if (
                            typeof log.dateVisited === "string" ||
                            typeof log.dateVisited === "number"
                          ) {
                            visitDate = new Date(log.dateVisited);
                          } else {
                            return false;
                          }
                          return visitDate >= weekAgo;
                        }
                      ).length;
                      return (
                        <>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <svg
                                  className="h-6 w-6 text-blue-600"
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
                              <div className="ml-4">
                                <p className="text-sm font-medium text-blue-600">
                                  Total Visitors
                                </p>
                                <p className="text-2xl font-semibold text-blue-900">
                                  {selectedCompany.visitorCount || 0}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <svg
                                  className="h-6 w-6 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                  />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-green-600">
                                  Unique Visitors
                                </p>
                                <p className="text-2xl font-semibold text-green-900">
                                  {metrics.uniqueVisitors}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <svg
                                  className="h-6 w-6 text-orange-600"
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
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-orange-600">
                                  Today's Visitors
                                </p>
                                <p className="text-2xl font-semibold text-orange-900">
                                  {metrics.todayVisitors}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <svg
                                  className="h-6 w-6 text-purple-600"
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
                              <div className="ml-4">
                                <p className="text-sm font-medium text-purple-600">
                                  Weekly Visitors
                                </p>
                                <p className="text-2xl font-semibold text-purple-900">
                                  {weeklyVisitors}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* World Map */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                      Visitor Locations
                    </h2>
                    <div className="h-80 relative">
                      <ComposableMap
                        projection="geoEqualEarth"
                        projectionConfig={{ scale: 120 }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <ZoomableGroup>
                          <Geographies geography="https://unpkg.com/world-atlas@2/countries-110m.json">
                            {({ geographies }) =>
                              geographies ? (
                                geographies.map((geo) => {
                                  const countryName =
                                    geo.properties?.name || "Unknown";

                                  const visitorCount = getCountryVisitorCount(
                                    countryName,
                                    analyticsData.visitorLogs
                                  );
                                  const isHighlighted = visitorCount > 0;
                                  return (
                                    <Geography
                                      key={geo.rsmKey}
                                      geography={geo}
                                      fill={
                                        isHighlighted ? "#f97316" : "#f3f4f6"
                                      }
                                      stroke="#ffffff"
                                      strokeWidth={0.5}
                                      style={{
                                        default: { outline: "none" },
                                        hover: {
                                          fill: isHighlighted
                                            ? "#ea580c"
                                            : "#e5e7eb",
                                          outline: "none",
                                        },
                                        pressed: { outline: "none" },
                                      }}
                                      onMouseEnter={(evt) => {
                                        const { clientX, clientY } = evt;
                                        setTooltipContent(
                                          `${countryName}: ${visitorCount} visitors`
                                        );
                                        setTooltipPosition({
                                          x: clientX,
                                          y: clientY,
                                        });
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
                        const countryData = calculateCountryData(
                          analyticsData.visitorLogs
                        );
                        const countriesWithVisitors = Object.entries(
                          countryData
                        )
                          .filter(([_, count]) => count > 0)
                          .sort(([_, a], [__, b]) => b - a)
                          .slice(0, 3);
                        if (countriesWithVisitors.length > 0) {
                          return (
                            <div className="text-sm text-gray-600">
                              <p className="mb-2">Top visitor countries:</p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {countriesWithVisitors.map(
                                  ([country, count]) => (
                                    <span
                                      key={country}
                                      className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                                    >
                                      {country} ({count})
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Recent Visitors */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Recent Visitors
                    </h3>
                    {analyticsData.visitorLogs.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
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
                        <p className="mt-2 text-sm text-gray-500">
                          No visitor data available
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {analyticsData.visitorLogs.slice(0, 10).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {log.city}, {log.country}
                                </p>
                                <p className="text-xs text-gray-500">
                                  IP: {log.ipQuery}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {(() => {
                                  let visitDate;
                                  if (
                                    typeof log.dateVisited.toDate === "function"
                                  ) {
                                    visitDate = log.dateVisited.toDate();
                                  } else if (
                                    typeof log.dateVisited === "object" &&
                                    typeof log.dateVisited._seconds === "number"
                                  ) {
                                    visitDate = new Date(
                                      log.dateVisited._seconds * 1000
                                    );
                                  } else if (
                                    typeof log.dateVisited === "string" ||
                                    typeof log.dateVisited === "number"
                                  ) {
                                    visitDate = new Date(log.dateVisited);
                                  } else {
                                    return "Unknown";
                                  }
                                  return visitDate.toLocaleString();
                                })()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

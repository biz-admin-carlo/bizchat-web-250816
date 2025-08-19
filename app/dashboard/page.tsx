"use client";
import Navbar from "../components/Navbar";
import { useRef, useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId?: string;
  tenantList?: string[];
}

interface Tenant {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  // Shimmering orange circle loading component
  const ShimmeringLoader = () => (
    <div className="flex items-center justify-center mt-1">
      <div className="relative">
        <div className="w-6 h-6 bg-orange-200 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full animate-ping opacity-75"></div>
      </div>
    </div>
  );

  useEffect(() => {
    console.log("useEffect: checking auth state");
    const fetchUserData = async (userEmail: string) => {
      console.log("fetchUserData called with email:", userEmail);
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        console.log("User doc data:", data);

        // Set user profile
        setUserProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || "user",
          companyId: data.companyId,
          tenantList: data.tenantList || [],
        });

        // For admin users, use companyId field
        // For regular users, use first item in tenantList array
        let userTenantId = "";
        if (data.role === "admin" && data.companyId) {
          userTenantId = data.companyId;
        } else if (data.tenantList && data.tenantList.length > 0) {
          userTenantId = data.tenantList[0]; // Use first tenant in list
        }

        setTenantId(userTenantId);
        setSelectedTenantId(userTenantId);
      } else {
        console.log("No user document found for email:", userEmail);
        setTenantId("");
        setSelectedTenantId("");
      }
      setLoading(false);
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("onAuthStateChanged fired. User:", user);
      if (user && user.email) {
        fetchUserData(user.email);
      } else {
        setTenantId("");
        setSelectedTenantId("");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch available tenants when user profile is loaded
  useEffect(() => {
    const fetchAvailableTenants = async () => {
      if (!userProfile) return;

      setLoadingTenants(true);
      try {
        const db = getFirestore();
        const tenants: Tenant[] = [];
        const addedTenantIds = new Set<string>();

        // If user is admin and has companyId, fetch that tenant
        if (userProfile.role === "admin" && userProfile.companyId) {
          const tenantDoc = await getDocs(
            query(
              collection(db, "tenants"),
              where("companyId", "==", userProfile.companyId)
            )
          );
          if (!tenantDoc.empty) {
            const data = tenantDoc.docs[0].data();
            tenants.push({
              id: userProfile.companyId,
              name: data.companyName || "My Company",
            });
            addedTenantIds.add(userProfile.companyId);
          }
        }

        // If user has tenantList, fetch those tenants (but skip if already added)
        if (userProfile.tenantList && userProfile.tenantList.length > 0) {
          for (const tenantId of userProfile.tenantList) {
            // Skip if this tenant was already added
            if (addedTenantIds.has(tenantId)) {
              continue;
            }

            const tenantDoc = await getDocs(
              query(
                collection(db, "tenants"),
                where("companyId", "==", tenantId)
              )
            );
            if (!tenantDoc.empty) {
              const data = tenantDoc.docs[0].data();
              tenants.push({
                id: tenantId,
                name: data.companyName || `Company ${tenantId.substring(0, 8)}`,
              });
              addedTenantIds.add(tenantId);
            }
          }
        }

        setAvailableTenants(tenants);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setLoadingTenants(false);
      }
    };

    const fetchMemberCount = async () => {
      if (!userProfile) return;

      setLoadingMembers(true);
      try {
        const db = getFirestore();
        let totalMembers = 0;

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

        // Count users for each tenant
        for (const tenantId of uniqueTenantIds) {
          const usersQuery = query(
            collection(db, "users"),
            where("tenantList", "array-contains", tenantId)
          );
          const usersSnapshot = await getDocs(usersQuery);
          totalMembers += usersSnapshot.size;
        }

        setMemberCount(totalMembers);
      } catch (error) {
        console.error("Error fetching member count:", error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchAvailableTenants();
    fetchMemberCount();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 bg-orange-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
    );
  }

  const scriptTag = `<script\n  src=\"https://bizsupport-b452e.web.app/widget.js\"\n  data-client=\"${
    selectedTenantId || ""
  }\"\n  data-theme=\"light\"\n></script>`;

  const handleCopy = () => {
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
      {/* User Profile Section */}
      {userProfile && (
        <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {userProfile.firstName.charAt(0).toUpperCase()}
              {userProfile.lastName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userProfile.firstName}!
              </h1>
              <p className="text-gray-600">
                {userProfile.email} •{" "}
                {userProfile.role.charAt(0).toUpperCase() +
                  userProfile.role.slice(1)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <p
                    className={`text-lg font-semibold ${
                      userProfile.role === "admin"
                        ? "text-orange-600"
                        : "text-gray-700"
                    }`}
                  >
                    {userProfile.role.charAt(0).toUpperCase() +
                      userProfile.role.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Total Members
                  </p>
                  <div className="text-lg font-semibold text-gray-700">
                    {loadingMembers ? <ShimmeringLoader /> : memberCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Companies</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {userProfile.tenantList ? userProfile.tenantList.length : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600">
          Manage your company, team, and view analytics
        </p>
      </div>

      {/* Integration Instructions Section */}
      <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Integrate BizChat on Your Website
          </h3>
          <p className="text-gray-600">
            Follow these simple steps to add BizChat to your website
          </p>
        </div>

        {/* Step-by-step instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              1
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Copy Script</h4>
            <p className="text-sm text-gray-600">
              Copy the script tag below for your selected company
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              2
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Paste in HTML</h4>
            <p className="text-sm text-gray-600">
              Paste the script at the end of your &lt;body&gt; tag
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              3
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">You're Done!</h4>
            <p className="text-sm text-gray-600">
              Your web plugin should be good to go
            </p>
          </div>
        </div>

        {/* Company/Tenant Selection Dropdown */}
        {availableTenants.length > 1 && (
          <div className="mb-4">
            <label
              htmlFor="tenant-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Company for Integration:
            </label>
            <select
              id="tenant-select"
              value={selectedTenantId || ""}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              disabled={loadingTenants}
            >
              {loadingTenants ? (
                <option>Loading companies...</option>
              ) : (
                availableTenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose which company's chat widget to integrate
            </p>
          </div>
        )}

        <div className="relative w-full bg-gray-900 rounded-lg p-4 mb-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="relative">
                <div className="w-8 h-8 bg-orange-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          ) : (
            <>
              <textarea
                ref={codeRef}
                value={scriptTag}
                readOnly
                className="w-full bg-gray-900 text-green-300 font-mono text-sm rounded resize-none p-2 pr-10"
                rows={5}
              />
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none opacity-70 hover:opacity-100"
                title="Copy to clipboard"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
                  />
                </svg>
              </button>
              {copied && (
                <span className="absolute top-2 right-10 text-xs text-green-400 bg-gray-800 px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </>
          )}
        </div>

        {/* Script Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-1">
                Important Integration Notes
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>
                  •{" "}
                  <strong>
                    Place the script at the end of your &lt;body&gt; tag
                  </strong>
                </li>
                <li>
                  • The chat widget will appear on all pages automatically
                </li>
                <li>• Messages will be routed to the selected company</li>
                <li>
                  • You can change the company anytime using the dropdown above
                </li>
                <li>
                  • The widget will load automatically once the script is in
                  place
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Theme Customization */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Theme Customization
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                Customize the appearance of your chat widget by modifying the{" "}
                <code className="bg-blue-100 px-1 rounded">data-theme</code>{" "}
                attribute:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  •{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    data-theme="light"
                  </code>{" "}
                  - Light theme (default)
                </li>
                <li>
                  •{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    data-theme="dark"
                  </code>{" "}
                  - Dark theme mode
                </li>
                <li>
                  • Change the theme value in the script tag above to match your
                  website's design
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400">
        More dashboard features coming soon...
      </div>
    </div>
  );
}

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
} from "firebase/firestore";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: any;
  role: string;
}

interface CompanyMembers {
  companyId: string;
  companyName: string;
  members: Member[];
}

export default function MembersPage() {
  const [companyMembers, setCompanyMembers] = useState<CompanyMembers[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembersForAllCompanies = async (tenantList: string[]) => {
      const allCompanyMembers: CompanyMembers[] = [];

      for (const tenantId of tenantList) {
        try {
          // Get company details
          const db = getFirestore();
          const companyDoc = await getDoc(doc(db, "tenants", tenantId));
          const companyData = companyDoc.data();
          const companyName = companyData?.companyName || `Company ${tenantId}`;

          // Fetch members for this company
          const res = await fetch("/api/get-company-members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantId }),
          });
          const data = await res.json();
          const members = data.members || [];

          allCompanyMembers.push({
            companyId: tenantId,
            companyName,
            members,
          });
        } catch (error) {
          console.error(
            `Error fetching members for company ${tenantId}:`,
            error
          );
        }
      }

      setCompanyMembers(allCompanyMembers);
      setLoading(false);
    };

    const fetchUserAndMembers = async (userEmail: string) => {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        console.log("User doc data:", data);

        // Get all companies from tenantList
        const tenantList = data.tenantList || [];
        console.log("Tenant list for members fetch:", tenantList);

        if (tenantList.length > 0) {
          fetchMembersForAllCompanies(tenantList);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchUserAndMembers(user.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredCompanyMembers = companyMembers
    .map((company) => ({
      ...company,
      members: company.members.filter(
        (member) =>
          member.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          member.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          member.email?.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((company) => company.members.length > 0);

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
            Loading Members...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center tracking-tight">
        All Company Members
      </h1>
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 w-full max-w-xs"
        />
      </div>

      {filteredCompanyMembers.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No members found.</div>
      ) : (
        <div className="space-y-8">
          {filteredCompanyMembers.map((company) => (
            <div
              key={company.companyId}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {company.companyName}
                </h2>
                <p className="text-sm text-gray-600">
                  {company.members.length} member
                  {company.members.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {company.members.map((member, idx) => (
                      <tr key={member.id || idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.firstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.role === "admin"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {member.role || "user"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {member.createdAt
                            ? typeof member.createdAt === "string"
                              ? new Date(member.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : member.createdAt._seconds
                              ? new Date(
                                  member.createdAt._seconds * 1000
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : member.createdAt.toDate
                              ? member.createdAt
                                  .toDate()
                                  .toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                              : JSON.stringify(member.createdAt)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

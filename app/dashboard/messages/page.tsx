"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth } from "../../lib/firebase";
import { getFirestore } from "firebase/firestore";
import { useRef } from "react";

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
};

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
};

type ConversationRow = {
  id: string;
  latestMessage: string;
  authorType: string;
  createdAt: any;
  customerName?: string;
  userName?: string;
  customer?: string;
  user?: string;
  acceptedBy?: string;
};

interface Company {
  id: string;
  name: string;
}

const mockMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: 1,
      sender: "Alice Johnson",
      text: "Hi, I need help with my account.",
      time: "10:00 AM",
    },
    {
      id: 2,
      sender: "Admin",
      text: "Sure, what seems to be the issue?",
      time: "10:01 AM",
    },
    {
      id: 3,
      sender: "Alice Johnson",
      text: "I can't log in.",
      time: "10:02 AM",
    },
    {
      id: 4,
      sender: "Admin",
      text: "I've reset your password.",
      time: "10:05 AM",
    },
    {
      id: 5,
      sender: "Alice Johnson",
      text: "Thank you for your help!",
      time: "10:06 AM",
    },
  ],
  conv2: [
    { id: 1, sender: "Bob Smith", text: "Can I get a demo?", time: "3:40 PM" },
    {
      id: 2,
      sender: "Admin",
      text: "Absolutely! When are you available?",
      time: "3:41 PM",
    },
  ],
  conv3: [
    {
      id: 1,
      sender: "Carol Lee",
      text: "I have a question about pricing.",
      time: "9:15 AM",
    },
    { id: 2, sender: "Admin", text: "Sure, ask away!", time: "9:16 AM" },
  ],
  conv4: [
    {
      id: 1,
      sender: "David Brown",
      text: "My invoice is incorrect.",
      time: "11:05 AM",
    },
    {
      id: 2,
      sender: "Admin",
      text: "Let me check that for you.",
      time: "11:06 AM",
    },
    { id: 3, sender: "David Brown", text: "Thank you!", time: "11:08 AM" },
  ],
  conv5: [
    {
      id: 1,
      sender: "Eve White",
      text: "The app is crashing.",
      time: "2:20 PM",
    },
    {
      id: 2,
      sender: "Admin",
      text: "Can you send a screenshot?",
      time: "2:21 PM",
    },
    { id: 3, sender: "Eve White", text: "Sure, sending now.", time: "2:22 PM" },
  ],
  conv6: [
    {
      id: 1,
      sender: "Frank Green",
      text: "Great service, thanks!",
      time: "4:45 PM",
    },
    {
      id: 2,
      sender: "Admin",
      text: "We appreciate your feedback!",
      time: "4:46 PM",
    },
  ],
};

// Helper for bubble classes
const getBubbleClass = (isSupport: boolean) =>
  `max-w-[75%] px-4 py-2 rounded-2xl text-base mb-1 shadow-sm ` +
  (isSupport
    ? "bg-gray-100 text-gray-900 rounded-br-md !bg-gray-100"
    : "bg-orange-200 text-gray-900 rounded-bl-md !bg-orange-200");

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [openRawId, setOpenRawId] = useState<string | null>(null);
  const [supportNames, setSupportNames] = useState<Record<string, string>>({});
  const fetchedSupportIds = useRef<Set<string>>(new Set());
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<ConversationRow | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationsPerPage] = useState(6);

  const openMessages = async (convId: string) => {
    setSelectedConvId(convId);
    setLoadingThreads(true);
    const res = await fetch("/api/get-threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convId }),
    });
    const data = await res.json();
    setThreads(data.threads || []);
    setLoadingThreads(false);
  };
  const closeMessages = () => {
    setSelectedConvId(null);
    setThreads([]);
  };

  const openCustomerModal = (customer: ConversationRow) => {
    setSelectedCustomer(customer);
    setCustomerModalOpen(true);
  };

  const closeCustomerModal = () => {
    setCustomerModalOpen(false);
    setSelectedCustomer(null);
  };

  useEffect(() => {
    const fetchConversations = async (tenantId: string) => {
      console.log("Frontend: Fetching conversations for tenantId:", tenantId);
      const res = await fetch("/api/get-conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      console.log("Frontend: API response conversations:", data.conversations);
      setConversations(data.conversations || []);
      setLoading(false);
    };

    const fetchCompaniesAndConversations = async (userEmail: string) => {
      console.log("👤 Fetching user data for email:", userEmail);
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      console.log("👥 User query snapshot size:", querySnapshot.size);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        console.log("👤 User data:", {
          email: data.email,
          role: data.role,
          tenantList: data.tenantList,
        });

        // Get all companies from tenantList
        const tenantList = data.tenantList || [];
        console.log("🏢 Tenant list for companies fetch:", tenantList);

        if (tenantList.length > 0) {
          // Fetch company details for all companies
          const companiesData: Company[] = [];
          console.log(
            "🔄 Fetching company details for",
            tenantList.length,
            "companies..."
          );

          for (const tenantId of tenantList) {
            try {
              const companyDoc = await getDoc(doc(db, "tenants", tenantId));
              const companyData = companyDoc.data();
              const companyName =
                companyData?.companyName || `Company ${tenantId}`;
              console.log("🏢 Company found:", {
                id: tenantId,
                name: companyName,
              });

              companiesData.push({
                id: tenantId,
                name: companyName,
              });
            } catch (error) {
              console.error(`❌ Error fetching company ${tenantId}:`, error);
              companiesData.push({
                id: tenantId,
                name: `Company ${tenantId}`,
              });
            }
          }

          console.log("✅ All companies loaded:", companiesData);
          setCompanies(companiesData);

          // Set the first company as selected and fetch its conversations
          if (companiesData.length > 0) {
            const firstCompany = companiesData[0];
            console.log("🎯 Setting first company as selected:", firstCompany);
            setSelectedCompany(firstCompany.id);
            fetchConversations(firstCompany.id);
          } else {
            console.log("⚠️ No companies found, setting loading to false");
            setLoading(false);
          }
        } else {
          console.log("⚠️ No companies found, setting loading to false");
          setLoading(false);
        }
      } else {
        console.log("❌ No user found, setting loading to false");
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchCompaniesAndConversations(user.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch conversations when selected company changes
  useEffect(() => {
    if (selectedCompany) {
      console.log("🔄 Company selection changed to:", selectedCompany);
      setLoading(true);
      setCurrentPage(1); // Reset to first page when company changes
      const fetchConversations = async (tenantId: string) => {
        console.log("💬 Fetching conversations for tenantId:", tenantId);
        try {
          const res = await fetch("/api/get-conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantId }),
          });
          const data = await res.json();
          console.log("💬 API response conversations:", data.conversations);
          setConversations(data.conversations || []);
        } catch (error) {
          console.error("❌ Error fetching conversations:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchConversations(selectedCompany);
    } else {
      console.log("⚠️ No company selected, skipping conversation fetch");
    }
  }, [selectedCompany]);

  // Pagination calculations
  const indexOfLastConversation = currentPage * conversationsPerPage;
  const indexOfFirstConversation =
    indexOfLastConversation - conversationsPerPage;
  const currentConversations = conversations.slice(
    indexOfFirstConversation,
    indexOfLastConversation
  );
  const totalPages = Math.ceil(conversations.length / conversationsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Fetch support names for acceptedBy fields
  useEffect(() => {
    const db = getFirestore();
    const missingIds = conversations
      .map((conv) => conv.acceptedBy || "")
      .filter(
        (id) => id && !supportNames[id] && !fetchedSupportIds.current.has(id)
      );
    if (missingIds.length === 0) return;
    missingIds.forEach(async (userId) => {
      fetchedSupportIds.current.add(userId);
      console.log("Fetching support name for userId:", userId);
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      console.log("User docs found:", userDocSnap.exists(), userDocSnap.data());
      const name = userDocSnap.exists()
        ? `${userDocSnap.data().firstName || ""} ${
            userDocSnap.data().lastName || ""
          }`.trim()
        : "";
      setSupportNames((prev) => ({ ...prev, [userId]: name }));
    });
  }, [conversations, supportNames]);

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
            Loading Messages...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-white rounded-xl shadow-lg p-8 pt-16 relative overflow-hidden">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center tracking-tight">
        Messages
      </h1>

      {companies.length > 0 && (
        <div className="mb-4 flex justify-end">
          <select
            value={selectedCompany}
            onChange={(e) => {
              console.log(
                "🔄 Company dropdown changed from",
                selectedCompany,
                "to",
                e.target.value
              );
              setSelectedCompany(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="h-full min-h-0 flex-1 relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Support
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raw
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Info
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4">
                  <div className="w-full flex flex-col gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-6 bg-gray-200 rounded w-full"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ) : conversations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                  No conversations found.
                </td>
              </tr>
            ) : (
              currentConversations.map((conv: ConversationRow) => (
                <tr
                  key={conv.id}
                  className="hover:bg-orange-50 transition cursor-pointer"
                  onClick={() => openMessages(conv.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                    {conv.customerName ||
                      conv.userName ||
                      conv.customer ||
                      conv.user ||
                      conv.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                    {conv.acceptedBy ? (
                      supportNames[conv.acceptedBy || ""] || (
                        <span className="animate-pulse inline-block h-4 w-20 bg-gray-200 rounded" />
                      )
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Inquiry
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                    {(() => {
                      if (!conv.createdAt) return "";
                      if (typeof conv.createdAt.toDate === "function") {
                        return conv.createdAt.toDate().toLocaleString();
                      }
                      if (
                        typeof conv.createdAt === "object" &&
                        typeof conv.createdAt._seconds === "number"
                      ) {
                        return new Date(
                          conv.createdAt._seconds * 1000
                        ).toLocaleString();
                      }
                      if (
                        typeof conv.createdAt === "string" ||
                        typeof conv.createdAt === "number"
                      ) {
                        const d = new Date(conv.createdAt);
                        return isNaN(d.getTime()) ? "" : d.toLocaleString();
                      }
                      return "";
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 max-w-xs truncate">
                    {conv.latestMessage || ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                      onClick={() =>
                        setOpenRawId(openRawId === conv.id ? null : conv.id)
                      }
                      aria-label="Show raw JSON"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="4" cy="10" r="2" />
                        <circle cx="10" cy="10" r="2" />
                        <circle cx="16" cy="10" r="2" />
                      </svg>
                    </button>
                    {openRawId === conv.id && (
                      <div className="absolute z-50 right-0 mt-2 w-72 max-w-[90vw] bg-white border border-gray-200 rounded shadow-lg p-4 text-xs text-gray-900">
                        <pre className="whitespace-pre-wrap break-all">
                          {JSON.stringify(conv, null, 2)}
                        </pre>
                        <button
                          className="mt-2 text-xs text-orange-600 hover:underline"
                          onClick={() => setOpenRawId(null)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCustomerModal(conv);
                      }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      View Info
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {conversations.length > conversationsPerPage && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstConversation + 1} to{" "}
              {Math.min(indexOfLastConversation, conversations.length)} of{" "}
              {conversations.length} conversations
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        currentPage === pageNumber
                          ? "bg-orange-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Messages Drawer/Modal */}
      <div className="absolute left-0 bottom-0 z-50 w-full flex items-end justify-center pointer-events-none">
        <div
          className={`bg-white rounded-t-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col relative transition-transform duration-300 ease-in-out pointer-events-auto
            ${selectedConvId ? "translate-y-0" : "translate-y-full"}`}
        >
          {selectedConvId && (
            <>
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-orange-600 text-2xl font-bold px-2"
                onClick={closeMessages}
                aria-label="Close messages"
              >
                &times;
              </button>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50 mt-8">
                {loadingThreads ? (
                  <div className="flex flex-col gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse h-6 bg-gray-200 rounded w-1/2"
                      />
                    ))}
                  </div>
                ) : threads.length === 0 ? (
                  <div className="text-center text-gray-400">
                    No messages found.
                  </div>
                ) : (
                  threads.map((msg) => {
                    const isSupport = msg.authorType === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isSupport ? "items-end" : "items-start"
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold mb-1 ${
                            isSupport ? "text-gray-500" : "text-orange-600"
                          }`}
                        >
                          {isSupport ? "Support" : "Customer"}
                        </span>
                        <div
                          className={getBubbleClass(isSupport)}
                          style={{ wordBreak: "break-word" }}
                        >
                          {msg.message}
                          <div
                            className={`text-xs mt-1 ${
                              isSupport
                                ? "text-right text-gray-400"
                                : "text-left text-gray-500"
                            }`}
                          >
                            {(() => {
                              if (!msg.createdAt) return "";
                              if (typeof msg.createdAt.toDate === "function") {
                                return msg.createdAt.toDate().toLocaleString();
                              }
                              if (
                                typeof msg.createdAt === "object" &&
                                typeof msg.createdAt._seconds === "number"
                              ) {
                                return new Date(
                                  msg.createdAt._seconds * 1000
                                ).toLocaleString();
                              }
                              if (
                                typeof msg.createdAt === "string" ||
                                typeof msg.createdAt === "number"
                              ) {
                                const d = new Date(msg.createdAt);
                                return isNaN(d.getTime())
                                  ? ""
                                  : d.toLocaleString();
                              }
                              return "";
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Information Modal */}
      {customerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-opacity-20 backdrop-blur-md"
              onClick={closeCustomerModal}
            ></div>

            <div className="relative inline-block transform overflow-hidden rounded-lg bg-transparent text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold px-2 z-10"
                onClick={closeCustomerModal}
                aria-label="Close modal"
              >
                &times;
              </button>
              <div className="bg-white bg-opacity-90 backdrop-blur-sm px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Chat ID
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCustomer.customerName ||
                            selectedCustomer.userName ||
                            selectedCustomer.customer ||
                            selectedCustomer.user ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {(selectedCustomer as any).customerFullName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {(selectedCustomer as any).customerPhone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {(selectedCustomer as any).customerEmail || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Conversation ID
                        </label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">
                          {selectedCustomer.id}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Author Type
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCustomer.authorType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Assigned Support
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCustomer.acceptedBy ? (
                            supportNames[selectedCustomer.acceptedBy] ||
                            "Loading..."
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Inquiry
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Created At
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {(() => {
                            if (!selectedCustomer.createdAt) return "N/A";
                            if (
                              typeof selectedCustomer.createdAt.toDate ===
                              "function"
                            ) {
                              return selectedCustomer.createdAt
                                .toDate()
                                .toLocaleString();
                            }
                            if (
                              typeof selectedCustomer.createdAt === "object" &&
                              typeof selectedCustomer.createdAt._seconds ===
                                "number"
                            ) {
                              return new Date(
                                selectedCustomer.createdAt._seconds * 1000
                              ).toLocaleString();
                            }
                            if (
                              typeof selectedCustomer.createdAt === "string" ||
                              typeof selectedCustomer.createdAt === "number"
                            ) {
                              const d = new Date(selectedCustomer.createdAt);
                              return isNaN(d.getTime())
                                ? "N/A"
                                : d.toLocaleString();
                            }
                            return "N/A";
                          })()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Message
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCustomer.latestMessage || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-90 backdrop-blur-sm px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-lg">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeCustomerModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

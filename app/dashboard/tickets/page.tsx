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
  orderBy,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

interface Ticket {
  id: string;
  companyId: string;
  createdAt: any;
  customerId: string;
  customerName: string;
  issueDesc: string;
  issueSubj: string;
  issuedBy: string;
  status: string;
  supportId: string;
  ticketId: string;
}

interface Company {
  id: string;
  name: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchTickets = async (tenantId: string) => {
      console.log("Fetching tickets for tenantId:", tenantId);
      try {
        const db = getFirestore();
        const ticketsRef = collection(db, "tickets");
        const q = query(
          ticketsRef,
          where("companyId", "==", tenantId),
          orderBy("createdAt", "desc")
        );
        console.log("Query created:", q);
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size);
        console.log("Query snapshot empty:", querySnapshot.empty);

        let ticketsData: Ticket[] = [];

        if (querySnapshot.empty) {
          console.log("📭 No tickets found for company:", tenantId);
          ticketsData = [];
        } else {
          ticketsData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("📄 Ticket data for selected company:", {
              id: doc.id,
              companyId: data.companyId,
              issueSubj: data.issueSubj,
              customerName: data.customerName,
            });
            return {
              id: doc.id,
              ...data,
            };
          }) as Ticket[];
        }

        console.log("Processed tickets:", ticketsData);
        setTickets(ticketsData);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompaniesAndTickets = async (userEmail: string) => {
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

          // Set the first company as selected and fetch its tickets
          if (companiesData.length > 0) {
            const firstCompany = companiesData[0];
            console.log("🎯 Setting first company as selected:", firstCompany);
            setSelectedCompany(firstCompany.id);
            fetchTickets(firstCompany.id);
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
        fetchCompaniesAndTickets(user.email);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch tickets when selected company changes
  useEffect(() => {
    if (selectedCompany) {
      console.log("🔄 Company selection changed to:", selectedCompany);
      setLoading(true);
      const fetchTickets = async (tenantId: string) => {
        console.log("🎫 Fetching tickets for tenantId:", tenantId);
        try {
          const db = getFirestore();
          const ticketsRef = collection(db, "tickets");
          const q = query(
            ticketsRef,
            where("companyId", "==", tenantId),
            orderBy("createdAt", "desc")
          );
          console.log("🔍 Query created for company:", tenantId);
          const querySnapshot = await getDocs(q);
          console.log("📊 Query snapshot size:", querySnapshot.size);
          console.log("📋 Query snapshot empty:", querySnapshot.empty);

          let ticketsData: Ticket[] = [];

          if (querySnapshot.empty) {
            console.log("📭 No tickets found for company:", tenantId);
            ticketsData = [];
          } else {
            ticketsData = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              console.log("📄 Ticket data for selected company:", {
                id: doc.id,
                companyId: data.companyId,
                issueSubj: data.issueSubj,
                customerName: data.customerName,
              });
              return {
                id: doc.id,
                ...data,
              };
            }) as Ticket[];
          }

          console.log("✅ Processed tickets for company:", {
            companyId: tenantId,
            ticketCount: ticketsData.length,
            tickets: ticketsData.map((t) => ({
              id: t.id,
              companyId: t.companyId,
              issueSubj: t.issueSubj,
            })),
          });
          setTickets(ticketsData);
        } catch (error) {
          console.error("❌ Error fetching tickets:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchTickets(selectedCompany);
    } else {
      console.log("⚠️ No company selected, skipping ticket fetch");
    }
  }, [selectedCompany]);

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.issueSubj?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.status?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.issuedBy?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-gray-100 text-gray-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    if (typeof date.toDate === "function") {
      return date.toDate().toLocaleString();
    }
    if (typeof date === "object" && typeof date._seconds === "number") {
      return new Date(date._seconds * 1000).toLocaleString();
    }
    if (typeof date === "string" || typeof date === "number") {
      const d = new Date(date);
      return isNaN(d.getTime()) ? "" : d.toLocaleString();
    }
    return "";
  };

  const handleStatusToggle = async (
    ticketId: string,
    currentStatus: string
  ) => {
    try {
      const db = getFirestore();
      const ticketRef = doc(db, "tickets", ticketId);
      const newStatus =
        currentStatus === "resolved" ? "unresolved" : "resolved";

      await updateDoc(ticketRef, {
        status: newStatus,
      });

      // Update the local state
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      console.log(`Ticket ${ticketId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Failed to update ticket status. Please try again.");
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((ticket) => ticket.id));
    }
  };

  const handleBulkResolve = async () => {
    if (selectedTickets.length === 0) {
      alert("Please select tickets to mark as resolved.");
      return;
    }

    try {
      const db = getFirestore();

      // Update all selected tickets
      const updatePromises = selectedTickets.map((ticketId) => {
        const ticketRef = doc(db, "tickets", ticketId);
        return updateDoc(ticketRef, { status: "resolved" });
      });

      await Promise.all(updatePromises);

      // Update local state
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          selectedTickets.includes(ticket.id)
            ? { ...ticket, status: "resolved" }
            : ticket
        )
      );

      // Clear selection
      setSelectedTickets([]);

      console.log(`${selectedTickets.length} tickets marked as resolved`);
    } catch (error) {
      console.error("Error updating tickets:", error);
      alert("Failed to update tickets. Please try again.");
    }
  };

  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const closeTicketModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg p-8 pt-12">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center tracking-tight">
        Support Tickets
      </h1>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 w-full max-w-xs"
          />
          {companies.length > 0 && (
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
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {filteredTickets.length} of {tickets.length} tickets
          </div>
          {selectedTickets.length > 0 && (
            <button
              onClick={handleBulkResolve}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              Mark {selectedTickets.length} as Resolved
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    selectedTickets.length === filteredTickets.length &&
                    filteredTickets.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issued By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-8 h-8 bg-orange-200 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full animate-ping opacity-75"></div>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  {tickets.length === 0
                    ? "No tickets found."
                    : "No tickets match your search."}
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={() => handleTicketSelect(ticket.id)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openTicketModal(ticket)}
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.issueSubj || "Untitled Ticket"}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {ticket.issueDesc || "No description"}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openTicketModal(ticket)}
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.customerName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {ticket.customerId || "No ID"}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openTicketModal(ticket)}
                  >
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status || "Unknown"}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                    onClick={() => openTicketModal(ticket)}
                  >
                    {ticket.issuedBy || "Unknown"}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                    onClick={() => openTicketModal(ticket)}
                  >
                    {formatDate(ticket.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Ticket Details
              </h2>
              <button
                onClick={closeTicketModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            <div className="p-6 space-y-6">
              {/* Ticket Subject */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTicket.issueSubj || "Untitled Ticket"}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTicket.issueDesc || "No description provided"}
                  </p>
                </div>
              </div>

              {/* Ticket Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Name:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {selectedTicket.customerName || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Customer ID:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {selectedTicket.customerId || "No ID"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Ticket Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          selectedTicket.status
                        )}`}
                      >
                        {selectedTicket.status || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Ticket ID:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {selectedTicket.ticketId || "No ID"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Company ID:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {selectedTicket.companyId || "No ID"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Support Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Issued By:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {selectedTicket.issuedBy || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Support ID:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {selectedTicket.supportId || "No ID"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Timestamps
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Created:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {formatDate(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleStatusToggle(
                      selectedTicket.id,
                      selectedTicket.status || ""
                    );
                    closeTicketModal();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {selectedTicket.status === "resolved"
                    ? "Mark as Unresolved"
                    : "Mark as Resolved"}
                </button>
              </div>
              <button
                onClick={closeTicketModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

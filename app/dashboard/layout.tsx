"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect, useRef } from "react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import Navbar from "../components/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setLoading(false);
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/companies", label: "Companies" },
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/dashboard/members", label: "Members" },
    { href: "/dashboard/tickets", label: "Tickets" },
    { href: "/dashboard/payment", label: "Payment" },
  ];

  return (
    <div className="min-h-screen h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="relative z-50">
        <Navbar active="dashboard" />
      </div>
      {/* Sidebar icon for mobile at bottom center */}
      <button
        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg
          className="w-7 h-7 text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="7"
            y1="8"
            x2="17"
            y2="8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="7"
            y1="12"
            x2="17"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="7"
            y1="16"
            x2="17"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-60 md:z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed z-60 md:z-30 md:static top-0 left-0 h-full w-full md:w-64 bg-white border-r border-gray-200 flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <img
                src="/bizchat-horizontal.png"
                alt="BizChat Logo"
                className="h-8 mb-4"
              />
              <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            </div>
            {/* Close button for mobile */}
            <button
              className="md:hidden ml-2 mt-1 text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-orange-100 text-orange-700"
                    : "hover:bg-orange-50 text-gray-700"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-8 px-4 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
          >
            Logout
          </button>
        </aside>
        {/* Main Content */}
        <main className="flex-1 h-full overflow-y-auto flex flex-col p-8 pt-16">
          <div className="flex-1 flex items-start justify-center pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

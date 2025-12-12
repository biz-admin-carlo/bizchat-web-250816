"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRef } from "react";

export default function Navbar({ active = "home" }: { active?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${isScrolled ? "shadow-sm" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <img
                src="/bizchat-horizontal.png"
                alt="BizChat"
                className="h-8 cursor-pointer"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={
                active === "home"
                  ? "text-orange-600 border-b-2 border-orange-600 pb-1 transition-colors"
                  : "text-gray-600 hover:text-gray-900 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300"
              }
            >
              Home
            </Link>
            <Link
              href="/features"
              className={
                active === "features"
                  ? "text-orange-600 border-b-2 border-orange-600 pb-1 transition-colors"
                  : "text-gray-600 hover:text-gray-900 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300"
              }
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300"
            >
              Pricing
            </Link>
            <Link
              href="/faqs"
              className="text-gray-600 hover:text-gray-900 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300"
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {!currentUser && (
              <Link
                href="/register-company"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Get Started
              </Link>
            )}
            {currentUser ? (
              <div className="relative ml-2" ref={avatarRef}>
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="flex items-center focus:outline-none"
                  aria-label="Open user menu"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="avatar"
                      className="w-9 h-9 rounded-full border-2 border-orange-500 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg border-2 border-orange-500">
                      {currentUser.displayName?.[0]?.toUpperCase() ||
                        currentUser.email?.[0]?.toUpperCase() ||
                        "A"}
                    </div>
                  )}
                  <svg
                    className="w-4 h-4 ml-1 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-t-lg"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Manage Team
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-orange-50 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="border border-orange-600 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors ml-2"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Burger Icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="focus:outline-none"
              aria-label="Open menu"
            >
              <svg
                className="w-8 h-8 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="flex flex-col items-center space-y-4 py-6">
            <Link
              href="/"
              className={
                active === "home"
                  ? "text-orange-600 text-lg font-semibold"
                  : "text-gray-700 text-lg font-semibold"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              className={
                active === "features"
                  ? "text-orange-600 text-lg font-semibold"
                  : "text-gray-700 text-lg font-semibold"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 text-lg font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/faqs"
              className="text-gray-700 text-lg font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 text-lg font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {!currentUser && (
              <Link
                href="/register-company"
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Request a Demo
              </Link>
            )}
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  className="nav-mobile-button border border-orange-600 text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors text-lg font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manage Team
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="nav-mobile-button border border-orange-600 text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors text-lg font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="nav-mobile-button border border-orange-600 text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors text-lg font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

"use client";
import Navbar from "../components/Navbar";
import { useState } from "react";
import Link from "next/link";
import { FadeInSection } from "../components/FadeInSection";

export default function PricingPage() {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [additionalCompanies, setAdditionalCompanies] = useState<number>(0);
  const [additionalMembers, setAdditionalMembers] = useState<number>(0);

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for getting started with basic features",
      features: ["Chat messaging app account", "Web plugin"],
    },
    {
      id: "base",
      name: "Base Subscription",
      price: 25,
      period: "per month",
      description: "Perfect for single company with full features",
      features: [
        "Chat messaging app account",
        "Web plugin",
        "Auto translate chat messages",
        "Ticketing system",
        "Emailing functionality",
        "Single company support",
      ],
    },
    {
      id: "white-label",
      name: "White Label",
      price: 55,
      period: "per month",
      description: "Same features as base with white label branding",
      features: [
        "Chat messaging app account",
        "Web plugin",
        "Auto translate chat messages",
        "Ticketing system",
        "Emailing functionality",
        "White label branding",
        "Custom branding options",
        "Remove BizChat branding",
        "Custom domain support",
        "Single company support",
      ],
    },
  ];

  const calculateTotalPrice = () => {
    if (!selectedTier) return 0;
    if (selectedTier === "free") return 0;
    const basePrice =
      pricingTiers.find((tier) => tier.id === selectedTier)?.price || 0;
    const additionalCompaniesCost = additionalCompanies * 10;
    const additionalMembersCost = additionalMembers * 5;
    return basePrice + additionalCompaniesCost + additionalMembersCost;
  };

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleAdditionalCompaniesChange = (count: number) => {
    setAdditionalCompanies(Math.max(0, count));
  };

  const handleAdditionalMembersChange = (count: number) => {
    setAdditionalMembers(Math.max(0, count));
  };

  const handleGetStarted = () => {
    // Redirect to register-company page for all plans
    window.location.href = "/register-company";
  };

  const faqData = [
    {
      q: "What happens if I upgrade/downgrade?",
      a: "You can upgrade or downgrade your plan at any time. Your new plan will take effect immediately, and any price difference will be prorated.",
    },
    {
      q: "Are there any setup fees?",
      a: "No, there are no setup fees. You only pay for your selected plan.",
    },
    {
      q: "Do you offer a trial?",
      a: "Yes, we offer a free trial so you can experience all features before committing.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Absolutely! You can cancel your subscription at any time with no penalties.",
    },
  ];
  const [openIndexes, setOpenIndexes] = useState(
    Array(faqData.length).fill(false)
  );

  return (
    <div className="min-h-screen bg-white w-full">
      <Navbar active="pricing" />
      <div className="h-16" />
      <section className="w-full flex flex-col items-center pb-24 px-4 md:px-12 lg:px-0">
        <div className="w-full bg-[#191919] py-14 px-4 flex flex-col items-center justify-center mb-20">
          <FadeInSection>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4">
              <span className="text-orange-500">Simple,</span>{" "}
              <span className="text-red-500">Transparent Pricing</span>
            </h1>
          </FadeInSection>
          <FadeInSection delay={120}>
            <p className="text-center text-white text-lg max-w-2xl">
              Choose the plan that fits your business needs. No hidden fees, no
              surprises — just powerful features at a fair price.
            </p>
          </FadeInSection>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center w-full max-w-6xl mb-20">
          {/* Free Card */}
          <FadeInSection className="flex-1" delay={40}>
            <div className="flex-1 border-2 border-gray-400 rounded-xl p-8 bg-gradient-to-br from-green-50 to-green-100 relative w-full transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-1 rounded-full font-semibold text-sm">
                Free
              </div>
              <div className="flex items-end mb-2 mt-6">
                <span
                  className="text-5xl font-prata text-[#1C1C1C] mr-2"
                  style={{ fontFamily: "Prata, serif" }}
                >
                  $
                </span>
                <span
                  className="text-5xl font-prata text-[#1C1C1C]"
                  style={{ fontFamily: "Prata, serif" }}
                >
                  0
                </span>
                <span className="ml-2 text-gray-700 mb-1">forever</span>
              </div>
              <p className="text-[#1C1C1C] mb-4">
                Perfect for getting started with basic features. Includes chat
                messaging app account and web plugin to help you begin your
                customer support journey.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Chat messaging app account
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">Web plugin</span>
                </div>
              </div>
              <button className="w-full compare-pricing-button bg-green-500 text-white font-semibold rounded-lg px-8 py-3 mt-4 hover:bg-green-600 hover:-translate-y-0.5 transition text-lg">
                Get Started Free
              </button>
            </div>
          </FadeInSection>
          {/* Base Subscription Card */}
          <FadeInSection className="flex-1" delay={80}>
            <div className="flex-1 border-2 border-gray-400 rounded-xl p-8 bg-white relative w-full transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-1 rounded-full font-semibold text-sm">
                Base Subscription
              </div>
              <div className="flex items-end mb-2 mt-6">
                <span
                  className="text-5xl font-prata text-[#1C1C1C] mr-2"
                  style={{ fontFamily: "Prata, serif" }}
                >
                  $
                </span>
                <span
                  className="text-5xl font-prata text-[#1C1C1C]"
                  style={{ fontFamily: "Prata, serif" }}
                >
                  25
                </span>
                <span className="ml-2 text-gray-700 mb-1">per month</span>
              </div>
              <p className="text-[#1C1C1C] mb-4">
                Perfect for single company with full features. Includes all the
                essential tools you need for comprehensive customer support.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Chat messaging app account
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">Web plugin</span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Auto translate chat messages
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Ticketing system
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Emailing functionality
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Single company support
                  </span>
                </div>
              </div>
              <button className="w-full compare-pricing-button bg-red-500 text-white font-semibold rounded-lg px-8 py-3 mt-4 hover:bg-red-600 hover:-translate-y-0.5 transition text-lg">
                Get Started
              </button>
            </div>
          </FadeInSection>
          {/* White Label Card */}
          <FadeInSection className="flex-1" delay={120}>
            <div className="flex-1 border-2 border-orange-400 rounded-xl p-8 bg-white relative w-full transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full font-semibold text-sm">
                Most Popular
              </div>
              <div className="flex items-end mb-2 mt-6">
                <span
                  className="text-5xl font-prata text-[#1C1C1C] mr-2"
                  style={{ fontFamily: "Prata, serif" }}
                >
                  $
                </span>
                <span
                  className="text-5xl font-prata text-[#1C1C1C]"
                  style={{ fontFamily: "Prata, serif" }}
                >
                  55
                </span>
                <span className="ml-2 text-gray-700 mb-1">per month</span>
              </div>
              <p className="text-[#1C1C1C] mb-4">
                Same features as base with white label branding. Perfect for
                businesses that want to maintain their own brand identity.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Chat messaging app account
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">Web plugin</span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Auto translate chat messages
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Ticketing system
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Emailing functionality
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    White label branding
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Custom branding options
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Remove BizChat branding
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Custom domain support
                  </span>
                </div>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">
                    Single company support
                  </span>
                </div>
              </div>
              <button className="w-full compare-pricing-button bg-orange-500 text-white font-semibold rounded-lg px-8 py-3 mt-4 hover:bg-orange-600 hover:-translate-y-0.5 transition text-lg">
                Get Started
              </button>
            </div>
          </FadeInSection>
        </div>
        <button
          onClick={() => setShowPricingModal(true)}
          className="compare-pricing-button bg-red-500 text-white font-semibold rounded-lg px-8 py-3 hover:bg-red-600 hover:-translate-y-0.5 transition text-lg mb-20"
        >
          Compare All Features
        </button>

        {/* FAQ Section */}
        <section id="faqs" className="w-full max-w-4xl mx-auto mt-8 mb-20">
          <FadeInSection>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#191919]">
              Common Questions About Our Plans
            </h2>
          </FadeInSection>
          <div className="divide-y divide-gray-200">
            {faqData.map((item, idx) => {
              const open = openIndexes[idx];
              return (
                <div key={item.q}>
                  <button
                    className="faq-button w-full flex items-center justify-between py-5 text-left font-semibold text-lg text-[#191919] focus:outline-none"
                    onClick={() =>
                      setOpenIndexes((prev) =>
                        prev.map((v, i) => (i === idx ? !v : v))
                      )
                    }
                    aria-expanded={open}
                    aria-controls={`faq-panel-${idx}`}
                  >
                    {item.q}
                    <svg
                      className={`w-6 h-6 transition-transform ${
                        open ? "rotate-180" : "rotate-0"
                      }`}
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
                  <div
                    id={`faq-panel-${idx}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      open ? "max-h-96 pb-5" : "max-h-0"
                    } text-[#333] text-base`}
                  >
                    <FadeInSection delay={80}>
                      <div className={open ? "opacity-100" : "opacity-0"}>
                        {item.a}
                      </div>
                    </FadeInSection>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Help Choosing Plan Section */}
        <section className="w-full flex flex-col items-center justify-center py-20 px-4 mb-8">
          <FadeInSection>
            <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-6 text-[#191919]">
              Need Help Choosing the Right Plan?
            </h2>
          </FadeInSection>
          <FadeInSection delay={120}>
            <p className="text-center text-lg text-[#1C1C1C] mb-10 max-w-2xl">
              Not sure which BizChat plan fits your business best? We’re here to
              help you make the right choice.
            </p>
          </FadeInSection>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <button className="w-full contact-page-button border-2 border-red-500 text-[#191919] font-semibold rounded-lg px-8 py-3 bg-white hover:bg-red-50 hover:-translate-y-0.5 transition text-lg mb-2 sm:mb-0">
              Request a Demo
            </button>
            <span className="mx-2 font-bold text-[#191919]">OR</span>
            <Link
              href="/contact"
              className="w-full sm:w-auto contact-us-button bg-red-500 text-white font-semibold rounded-lg px-8 py-3 hover:bg-red-600 hover:-translate-y-0.5 transition text-lg text-center"
            >
              Contact US
            </Link>
          </div>
        </section>
      </section>
      {/* Footer Section */}
      <footer className="bg-[#fafafa] border-t border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row md:justify-between md:items-start gap-12 md:gap-0">
          {/* Left: Logo and Tagline */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <div className="flex items-center mb-4">
              <img
                src="/bizchat-horizontal.png"
                alt="BizChat Logo"
                className="h-12 mr-3"
              />
            </div>
            <div className="text-xl font-bold text-[#1C1C1C] text-center md:text-left mb-2">
              AI-Powered Chat Support.
              <br />
              Built for Business.
            </div>
          </div>
          {/* Center: Navigation Links */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <div className="font-bold text-lg mb-2 text-[#1C1C1C]">
              Navigation Links
            </div>
            <ul className="text-[#1C1C1C] space-y-1 text-base">
              <li>
                <a href="/" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="/features" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:underline">
                  FAQ’s
                </a>
              </li>
            </ul>
          </div>
          {/* Right: Help Links */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <div className="font-bold text-lg mb-2 text-[#1C1C1C]">Help</div>
            <ul className="text-[#1C1C1C] space-y-1 text-base">
              <li>
                <a href="#contact" className="hover:underline">
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://mybizsolutions.us/terms-of-service"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://mybizsolutions.us/privacy-policy"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="bg-[#191919] w-full py-3 text-center border-t border-gray-300">
          <span className="text-base text-white">
            Powered By:{" "}
            <span className="text-orange-500 font-bold">BizSolutions LLC</span>
          </span>
        </div>
      </footer>

      {/* Pricing Comparison Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Compare Pricing Plans
                </h2>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
            </div>

            <div className="p-6">
              {/* Plan Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Your Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTier === tier.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      onClick={() => handleTierSelect(tier.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {tier.name}
                        </h4>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            selectedTier === tier.id
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedTier === tier.id && (
                            <svg
                              className="w-3 h-3 text-white mx-auto mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${tier.price}
                        <span className="text-sm font-normal text-gray-600 ml-1">
                          {tier.period}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {tier.description}
                      </p>
                      <div className="space-y-2">
                        {tier.features.slice(0, 3).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-700"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {feature}
                          </div>
                        ))}
                        {tier.features.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{tier.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              {selectedTier && selectedTier !== "free" && (
                <>
                  {/* Additional Companies */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Additional Companies
                        </h4>
                        <p className="text-sm text-gray-600">
                          $10 each per month
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handleAdditionalCompaniesChange(
                              additionalCompanies - 1
                            )
                          }
                          disabled={additionalCompanies === 0}
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                          {additionalCompanies}
                        </span>
                        <button
                          onClick={() =>
                            handleAdditionalCompaniesChange(
                              additionalCompanies + 1
                            )
                          }
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {additionalCompanies > 0 && (
                      <div className="text-sm text-gray-600">
                        Additional cost:{" "}
                        <span className="font-semibold text-orange-600">
                          ${additionalCompanies * 10}/month
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Additional Members */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Additional Members
                        </h4>
                        <p className="text-sm text-gray-600">
                          $5 each per month
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handleAdditionalMembersChange(additionalMembers - 1)
                          }
                          disabled={additionalMembers === 0}
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                          {additionalMembers}
                        </span>
                        <button
                          onClick={() =>
                            handleAdditionalMembersChange(additionalMembers + 1)
                          }
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {additionalMembers > 0 && (
                      <div className="text-sm text-gray-600">
                        Additional cost:{" "}
                        <span className="font-semibold text-orange-600">
                          ${additionalMembers * 5}/month
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Total Price */}
              {selectedTier && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      {selectedTier === "free"
                        ? "Total Price"
                        : "Total Monthly Price"}
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {selectedTier === "free"
                        ? "Free"
                        : `$${calculateTotalPrice()}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedTier === "free" ? "forever" : "per month"}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGetStarted}
                  disabled={!selectedTier}
                  className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedTier === "free" ? "Get Started Free" : "Get Started"}
                </button>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

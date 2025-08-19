"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CheckoutButton from "./CheckoutButton";

// Remove: import { createTenant } from "../api/handlers/createTenant";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
}

interface PricingTiersProps {
  companyData: any; // This will be passed from the registration form
}

export default function PricingTiers({ companyData }: PricingTiersProps) {
  const pricingTiers: PricingTier[] = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with basic features",
      features: ["Chat messaging app account", "Web plugin"],
    },
    {
      id: "base",
      name: "Base Subscription",
      price: "$25",
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
      price: "$55",
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
      popular: true,
    },
  ];

  const [selectedTier, setSelectedTier] = useState<string>("");
  const [additionalCompanies, setAdditionalCompanies] = useState<number>(0);
  const [additionalMembers, setAdditionalMembers] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantId, setTenantId] = useState<string>("");
  const router = useRouter();

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 5000, // amount in cents → ₱50.00 or $50.00
        description: "Premium Tier - Monthly Plan",
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // redirect to Stripe Checkout
    }
  };

  const handleAdditionalCompaniesChange = (count: number) => {
    setAdditionalCompanies(Math.max(0, count));
  };

  const handleAdditionalMembersChange = (count: number) => {
    setAdditionalMembers(Math.max(0, count));
  };

  const calculateTotalPrice = () => {
    if (!selectedTier) return 0;
    if (selectedTier === "free") return 0;
    const basePrice = selectedTier === "base" ? 25 : 55;
    const additionalCompaniesCost = additionalCompanies * 10;
    const additionalMembersCost = additionalMembers * 5;
    return basePrice + additionalCompaniesCost + additionalMembersCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTier) {
      alert("Please select a pricing tier");
      return;
    }

    setIsSubmitting(true);

    try {
      const tenantData = {
        ...companyData,
        selectedTier,
        additionalCompanies,
        additionalMembers,
        totalPrice: calculateTotalPrice(),
        paymentStatus: selectedTier === "free" ? "free" : "pending",
      };

      // Create tenant first
      const response = await fetch("/api/create-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenantData),
      });
      const result = await response.json();
      console.log("Tenant creation result:", result);

      if (result.success && result.id) {
        setTenantId(result.id);

        // If free plan, skip payment
        if (selectedTier === "free") {
          const tierName = pricingTiers.find(
            (t) => t.id === selectedTier
          )?.name;
          alert(
            `Company and admin account created successfully with ${tierName} plan! Your company code is: ${companyData.companyCode}. You can now log in with your admin email.`
          );
          router.push(`/register-success?tenantId=${result.id}`);
          return;
        }

        // For paid plans, redirect to Stripe Checkout
        const totalPrice = calculateTotalPrice();
        const description =
          pricingTiers.find((t) => t.id === selectedTier)?.name ||
          "Custom Plan";

        const checkoutRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice * 100, // Stripe uses cents
            description,
            tenantId: result.id,
            metadata: {
              selectedTier,
              additionalCompanies: additionalCompanies.toString(),
              additionalMembers: additionalMembers.toString(),
              companyName: companyData.companyName,
              adminEmail: companyData.adminEmail,
            },
          }),
        });

        const checkoutData = await checkoutRes.json();

        if (checkoutData.url) {
          window.location.href = checkoutData.url; // Redirect to Stripe
        } else {
          alert("Failed to create Stripe Checkout session.");
        }
      } else {
        alert(
          `Registration failed: ${result.error || "Unknown error occurred"}`
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    const tierName = pricingTiers.find((t) => t.id === selectedTier)?.name;
    const totalPrice = calculateTotalPrice();
    alert(
      `Payment successful! Company and admin account created with ${tierName} plan! Total: $${totalPrice}/month. Your company code is: ${companyData.companyCode}. You can now log in with your admin email.`
    );
    router.push(`/register-success?tenantId=${tenantId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert(`Payment failed: ${error}. Please try again.`);
  };

  const handleFetchPayments = async () => {
    try {
      // Get actual payment data from Stripe
      const response = await fetch("/api/fetch-stripe-payments", {
        method: "GET",
      });
      const data = await response.json();
      console.log("Stripe Payments Response:", data);
    } catch (error) {
      console.error("Error fetching Stripe payments:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Go Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/register-company")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Go Back
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-600">
            Select the perfect plan for your organization
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                  selectedTier === tier.id
                    ? "border-orange-500 shadow-orange-100"
                    : "border-gray-200 hover:border-orange-300"
                } ${
                  tier.id === "free"
                    ? "bg-gradient-to-br from-green-50 to-green-100"
                    : ""
                }`}
                onClick={() => handleTierSelect(tier.id)}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                {tier.id === "free" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Free
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {tier.price}
                    </span>
                    <span className="text-gray-600 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{tier.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
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
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mx-auto ${
                      selectedTier === tier.id
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedTier === tier.id && (
                      <svg
                        className="w-4 h-4 text-white mx-auto mt-0.5"
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
              </div>
            ))}
          </div>

          {/* Additional Companies Section */}
          {selectedTier && selectedTier !== "free" && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200 animate-in slide-in-from-top-2 duration-300 ease-out">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Additional Companies
                </h3>
                <p className="text-gray-600 text-sm">
                  Add more companies for $10 each per month
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    handleAdditionalCompaniesChange(additionalCompanies - 1)
                  }
                  disabled={additionalCompanies === 0}
                  className="w-10 h-10 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
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

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {additionalCompanies}
                  </div>
                  <div className="text-sm text-gray-600">
                    Additional Companies
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleAdditionalCompaniesChange(additionalCompanies + 1)
                  }
                  className="w-10 h-10 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
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

              {additionalCompanies > 0 && (
                <div className="mt-4 text-center animate-in fade-in duration-200">
                  <div className="text-sm text-gray-600">
                    Additional cost:{" "}
                    <span className="font-semibold text-orange-600">
                      ${additionalCompanies * 10}/month
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Members Section */}
          {selectedTier && selectedTier !== "free" && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200 animate-in slide-in-from-top-2 duration-300 ease-out">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Additional Members
                </h3>
                <p className="text-gray-600 text-sm">
                  Add more members for $5 each per month
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    handleAdditionalMembersChange(additionalMembers - 1)
                  }
                  disabled={additionalMembers === 0}
                  className="w-10 h-10 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
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

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {additionalMembers}
                  </div>
                  <div className="text-sm text-gray-600">
                    Additional Members
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleAdditionalMembersChange(additionalMembers + 1)
                  }
                  className="w-10 h-10 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
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

              {additionalMembers > 0 && (
                <div className="mt-4 text-center animate-in fade-in duration-200">
                  <div className="text-sm text-gray-600">
                    Additional cost:{" "}
                    <span className="font-semibold text-orange-600">
                      ${additionalMembers * 5}/month
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Total Price Display */}
          {selectedTier && (
            <div className="mb-8 text-center animate-in slide-in-from-top-2 duration-300 ease-out delay-100">
              <div className="inline-block bg-orange-50 border border-orange-200 rounded-lg px-6 py-4">
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

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting || !selectedTier}
              className="bg-orange-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Completing Registration...
                </div>
              ) : (
                "Complete Registration"
              )}
            </button>
          </div>
        </form>
        <CheckoutButton />
      </div>
    </div>
  );
}

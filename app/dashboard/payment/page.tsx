"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface UserTier {
  tier: string;
  subscriptionData?: any;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function PaymentPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [additionalCompanies, setAdditionalCompanies] = useState<number>(0);
  const [additionalMembers, setAdditionalMembers] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserTier(user.email!);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserTier = async (email: string) => {
    try {
      const response = await fetch(`/api/check-user-tier?email=${email}`);
      const data = await response.json();

      if (data.success) {
        setUserTier({
          tier: data.user.tier,
          subscriptionData: data.user.subscriptionData,
        });
      } else {
        setUserTier({ tier: "free" });
      }
    } catch (error) {
      console.error("Error fetching user tier:", error);
      setUserTier({ tier: "free" });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (
    tierId: string,
    additionalCompanies: number,
    additionalMembers: number
  ) => {
    const basePrices: { [key: string]: number } = {
      free: 0,
      base: 2500, // $25.00 in cents
      "white-label": 5500, // $55.00 in cents
    };

    const basePrice = basePrices[tierId] || 0;
    const companyPrice = additionalCompanies * 1000; // $10 per additional company
    const memberPrice = additionalMembers * 500; // $5 per additional member

    return basePrice + companyPrice + memberPrice;
  };

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleUpgrade = async () => {
    if (!selectedTier || selectedTier === "free") {
      alert("Please select a paid tier to upgrade");
      return;
    }

    setIsProcessing(true);
    try {
      const totalAmount = calculateTotalPrice(
        selectedTier,
        additionalCompanies,
        additionalMembers
      );
      const selectedTierData = pricingTiers.find(
        (tier) => tier.id === selectedTier
      );

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount,
          description: `${selectedTierData?.name} - Monthly Plan`,
          customerEmail: currentUser.email,
          metadata: {
            selectedTier: selectedTier,
            additionalCompanies: additionalCompanies.toString(),
            additionalMembers: additionalMembers.toString(),
            adminEmail: currentUser.email,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentTierData = () => {
    // Handle the case where tier might be "paid" but we need to show specific plan
    const tierToShow = userTier?.tier === "paid" ? "base" : userTier?.tier;
    return pricingTiers.find((tier) => tier.id === tierToShow);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your subscription details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment & Subscription
        </h1>
        <p className="text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Subscription
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userTier?.tier === "free"
                    ? "bg-gray-100 text-gray-800"
                    : userTier?.tier === "base"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {getCurrentTierData()?.name}
              </span>
              {userTier?.tier === "free" && (
                <span className="text-sm text-gray-500">
                  No active subscription
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2">
              {getCurrentTierData()?.description}
            </p>
            {/* Show additional options for paid users */}
            {userTier?.tier !== "free" && userTier?.subscriptionData && (
              <div className="flex gap-4 mt-3 text-sm">
                {(userTier.subscriptionData.additionalCompanies > 0 ||
                  userTier.subscriptionData.additionalMembers > 0) && (
                  <>
                    {userTier.subscriptionData.additionalCompanies > 0 && (
                      <span className="text-gray-600">
                        +{userTier.subscriptionData.additionalCompanies}{" "}
                        additional companies
                      </span>
                    )}
                    {userTier.subscriptionData.additionalMembers > 0 && (
                      <span className="text-gray-600">
                        +{userTier.subscriptionData.additionalMembers}{" "}
                        additional members
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {userTier?.tier !== "free" && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {getCurrentTierData()?.price}
              </p>
              <p className="text-sm text-gray-500">
                {getCurrentTierData()?.period}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Section - Only show if user is on free tier */}
      {userTier?.tier === "free" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Upgrade Your Plan
          </h2>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {pricingTiers
              .filter((tier) => tier.id !== "free")
              .map((tier) => (
                <div
                  key={tier.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedTier === tier.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleTierSelect(tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h3>
                    <div className="flex items-end justify-center mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {tier.price}
                      </span>
                      <span className="text-gray-500 ml-1">{tier.period}</span>
                    </div>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, index) => (
                      <li
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
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`w-full py-2 px-4 rounded-lg text-center font-medium ${
                      selectedTier === tier.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedTier === tier.id ? "Selected" : "Select Plan"}
                  </div>
                </div>
              ))}
          </div>

          {/* Additional Options */}
          {selectedTier && selectedTier !== "free" && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Companies ($10/month each)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={additionalCompanies}
                    onChange={(e) =>
                      setAdditionalCompanies(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Members ($5/month each)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={additionalMembers}
                    onChange={(e) =>
                      setAdditionalMembers(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Total Price */}
          {selectedTier && selectedTier !== "free" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Total Monthly Price:
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  $
                  {(
                    calculateTotalPrice(
                      selectedTier,
                      additionalCompanies,
                      additionalMembers
                    ) / 100
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Upgrade Button */}
          {selectedTier && selectedTier !== "free" && (
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Upgrade to ${
                  pricingTiers.find((t) => t.id === selectedTier)?.name
                }`
              )}
            </button>
          )}
        </div>
      )}

      {/* Subscription Details for Paid Users */}
      {userTier?.tier !== "free" && userTier?.subscriptionData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subscription Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Subscription ID</p>
              <p className="font-medium text-gray-900">
                {userTier.subscriptionData.subscriptionId || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-900 capitalize">
                {userTier.subscriptionData.status || "Active"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Billing Date</p>
              <p className="font-medium text-gray-900">
                {userTier.subscriptionData.nextBillingDate
                  ? new Date(
                      userTier.subscriptionData.nextBillingDate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium text-gray-900">
                $
                {userTier.subscriptionData.amount
                  ? (userTier.subscriptionData.amount / 100).toFixed(2)
                  : getCurrentTierData()?.price}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Additional Companies</p>
              <p className="font-medium text-gray-900">
                {userTier.subscriptionData.additionalCompanies || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Additional Members</p>
              <p className="font-medium text-gray-900">
                {userTier.subscriptionData.additionalMembers || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/app/lib/firebase";
import PaymentsNav from "../components/PaymentsNav";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

export default function UpgradePage() {
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const pricingTiers: PricingTier[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      features: [
        "1 Company",
        "3 Team Members",
        "Basic Chat Features",
        "Limited Message History",
      ],
    },
    {
      id: "basic",
      name: "Basic",
      price: 29,
      features: [
        "1 Company",
        "10 Team Members",
        "Advanced Chat Features",
        "30-Day Message History",
        "Basic Analytics",
      ],
    },
    {
      id: "pro",
      name: "Professional",
      price: 79,
      features: [
        "3 Companies",
        "25 Team Members",
        "Advanced Chat Features",
        "90-Day Message History",
        "Advanced Analytics",
        "Priority Support",
      ],
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199,
      features: [
        "10 Companies",
        "Unlimited Team Members",
        "All Features",
        "Unlimited Message History",
        "Custom Analytics",
        "24/7 Support",
        "Dedicated Account Manager",
      ],
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Get the user's tenant ID
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          setError("User data not found");
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const userTenantId = userData.tenantId;
        setTenantId(userTenantId);

        if (!userTenantId) {
          setError("Tenant ID not found");
          setLoading(false);
          return;
        }

        // Get the tenant's subscription data
        const subscriptionDoc = await getDoc(doc(db, "tenants", userTenantId, "payments", "subscriptions"));
        
        if (subscriptionDoc.exists()) {
          const subscriptionData = subscriptionDoc.data();
          setCurrentTier(subscriptionData.tier || "free");
        }
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        setError("An error occurred while fetching subscription data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, db, router]);

  const handleUpgrade = async (tierId: string) => {
    if (!tenantId) {
      setError("Tenant ID not found");
      return;
    }

    if (tierId === currentTier) {
      return; // Already on this tier
    }

    setRedirecting(true);

    try {
      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          selectedTier: tierId,
          metadata: {
            action: "upgrade",
            previousTier: currentTier,
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create checkout session");
        setRedirecting(false);
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError("An error occurred while processing your request");
      setRedirecting(false);
    }
  };

  const isCurrentTier = (tierId: string) => {
    return currentTier === tierId;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <PaymentsNav />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      ) : (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Choose Your Plan</h2>
            <p className="mt-2 text-gray-600">Select the plan that best fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border ${tier.recommended ? 'border-orange-500' : 'border-gray-200'} ${isCurrentTier(tier.id) ? 'ring-2 ring-orange-500' : ''}`}
              >
                {tier.recommended && (
                  <div className="bg-orange-500 text-white text-xs font-semibold text-center py-1">
                    RECOMMENDED
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-gray-900">${tier.price}</span>
                    <span className="ml-1 text-sm font-medium text-gray-500">/month</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={isCurrentTier(tier.id) || redirecting}
                      className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${isCurrentTier(tier.id) ? 'bg-gray-100 text-gray-800 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'} disabled:opacity-50`}
                    >
                      {isCurrentTier(tier.id) ? 'Current Plan' : redirecting ? 'Redirecting...' : 'Upgrade'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Need a custom plan?</h3>
            <p className="mt-2 text-gray-600">
              Contact our sales team for a custom solution tailored to your specific needs.
            </p>
            <div className="mt-4">
              <a
                href="mailto:sales@bizchat.com"
                className="inline-flex items-center text-orange-600 hover:text-orange-700"
              >
                Contact Sales
                <svg
                  className="ml-1 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
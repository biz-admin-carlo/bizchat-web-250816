"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/app/lib/firebase";
import PaymentsNav from "../components/PaymentsNav";

interface Subscription {
  tier: string;
  status: string;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  cancelAtPeriodEnd?: boolean;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

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
        const tenantId = userData.tenantId;

        if (!tenantId) {
          setError("Tenant ID not found");
          setLoading(false);
          return;
        }

        // Get the tenant's subscription data
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId));
        if (!tenantDoc.exists()) {
          setError("Tenant data not found");
          setLoading(false);
          return;
        }

        const tenantData = tenantDoc.data();
        
        // Get subscription data from the payments subcollection
        const subscriptionDoc = await getDoc(doc(db, "tenants", tenantId, "payments", "subscriptions"));
        
        if (subscriptionDoc.exists()) {
          const subscriptionData = subscriptionDoc.data();
          setSubscription({
            tier: subscriptionData.tier || "free",
            status: subscriptionData.status || "active",
            currentPeriodStart: subscriptionData.currentPeriodStart,
            currentPeriodEnd: subscriptionData.currentPeriodEnd,
            cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
          });
        } else {
          // Default to free tier if no subscription document exists
          setSubscription({
            tier: "free",
            status: "active",
          });
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getTierDisplayName = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "free":
        return "Free Tier";
      case "basic":
        return "Basic Plan";
      case "pro":
        return "Professional Plan";
      case "enterprise":
        return "Enterprise Plan";
      case "paid":
        return "Paid Plan";
      default:
        return tier;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-yellow-100 text-yellow-800";
      case "past_due":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      ) : subscription ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Current Subscription</h3>
          </div>
          <div className="px-6 py-5 divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {getTierDisplayName(subscription.tier)}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                    subscription.status
                  )}`}
                >
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </dd>
            </div>
            {subscription.currentPeriodStart && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Current Period Start</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(subscription.currentPeriodStart)}
                </dd>
              </div>
            )}
            {subscription.currentPeriodEnd && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Current Period End</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(subscription.currentPeriodEnd)}
                </dd>
              </div>
            )}
            {subscription.cancelAtPeriodEnd !== undefined && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Auto Renewal</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {subscription.cancelAtPeriodEnd ? "Off" : "On"}
                </dd>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
                onClick={() => router.push("/dashboard/payments/upgrade")}
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded text-center">
          <p className="text-lg">No subscription information found.</p>
        </div>
      )}
    </div>
  );
}
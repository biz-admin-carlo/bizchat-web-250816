"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "@/app/lib/firebase";
import PaymentsNav from "../components/PaymentsNav";

interface BillingInfo {
  name?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  taxId?: string;
}

export default function BillingPage() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
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
        const userTenantId = userData.tenantId;
        setTenantId(userTenantId);

        if (!userTenantId) {
          setError("Tenant ID not found");
          setLoading(false);
          return;
        }

        // Get the tenant's billing information
        const billingDoc = await getDoc(doc(db, "tenants", userTenantId, "payments", "billing"));
        
        if (billingDoc.exists()) {
          const billingData = billingDoc.data() as BillingInfo;
          setBillingInfo(billingData);
        }
      } catch (err) {
        console.error("Error fetching billing data:", err);
        setError("An error occurred while fetching billing data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, db, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBillingInfo(prev => {
        // Create a properly typed object for the parent property
        const parentObj = prev[parent as keyof BillingInfo] as Record<string, any> || {};
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setBillingInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantId) {
      setError("Tenant ID not found");
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Save billing information to Firestore
      await setDoc(doc(db, "tenants", tenantId, "payments", "billing"), billingInfo, { merge: true });
      setSuccess("Billing information updated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving billing data:", err);
      setError("An error occurred while saving billing information");
    } finally {
      setSaving(false);
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
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Billing Information</h3>
            <p className="mt-1 text-sm text-gray-500">Update your billing details and address.</p>
          </div>
          
          {success && (
            <div className="m-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Billing Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={billingInfo.name || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Billing Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={billingInfo.email || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700">
                  Address Line 1
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.line1"
                    id="address.line1"
                    value={billingInfo.address?.line1 || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address.line2" className="block text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.line2"
                    id="address.line2"
                    value={billingInfo.address?.line2 || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.city"
                    id="address.city"
                    value={billingInfo.address?.city || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.state"
                    id="address.state"
                    value={billingInfo.address?.state || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address.postal_code" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.postal_code"
                    id="address.postal_code"
                    value={billingInfo.address?.postal_code || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address.country"
                    id="address.country"
                    value={billingInfo.address?.country || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                  Tax ID / VAT Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="taxId"
                    id="taxId"
                    value={billingInfo.taxId || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
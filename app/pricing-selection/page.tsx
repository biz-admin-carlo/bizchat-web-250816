"use client";

import Navbar from "../components/Navbar";
import PricingTiers from "../components/PricingTiers";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PricingSelectionContent() {
  const searchParams = useSearchParams();

  // Gather all company data from query params
  const companyData: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    companyData[key] = value;
  });

  return <PricingTiers companyData={companyData} />;
}

export default function PricingSelectionPage() {
  return (
    <div>
      <Navbar active="pricing" />
      <Suspense fallback={<div>Loading pricing...</div>}>
        <PricingSelectionContent />
      </Suspense>
    </div>
  );
}

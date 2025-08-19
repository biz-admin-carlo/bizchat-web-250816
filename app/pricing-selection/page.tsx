"use client";
import Navbar from "../components/Navbar";
import PricingTiers from "../components/PricingTiers";
import { useSearchParams } from "next/navigation";

export default function PricingSelectionPage() {
  const searchParams = useSearchParams();
  // Gather all company data from query params
  const companyData: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    companyData[key] = value;
  });

  return (
    <div>
      <Navbar active="pricing" />
      <PricingTiers companyData={companyData} />
    </div>
  );
}

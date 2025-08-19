"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

const NavLink = ({ href, label, active }: NavLinkProps) => {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium rounded-md ${active
        ? "bg-orange-100 text-orange-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
    >
      {label}
    </Link>
  );
};

export default function PaymentsNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/payments", label: "Payment History" },
    { href: "/dashboard/payments/subscription", label: "Subscription" },
    { href: "/dashboard/payments/billing", label: "Billing Information" },
    { href: "/dashboard/payments/upgrade", label: "Upgrade Plan" },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg mb-6">
      <div className="px-4 py-2 flex overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </div>
    </div>
  );
}
"use client";

interface CheckoutButtonProps {
  amount?: number;
  description?: string;
  customerEmail?: string;
}

export default function CheckoutButton({
  amount = 5000,
  description = "Premium Tier - Monthly Plan",
  customerEmail,
}: CheckoutButtonProps) {
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount, // amount in cents
          description,
          customerEmail,
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        console.error("Checkout error:", data.error);
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to create checkout session. Please try again.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-black text-white px-4 py-2 rounded"
    >
      Pay with Stripe
    </button>
  );
}

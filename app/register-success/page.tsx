"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useEffect, useState, Suspense } from "react";
import Navbar from "../components/Navbar";

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const sessionId = searchParams.get("session_id");
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const scriptTag = `<script
  src="https://bizsupport-b452e.web.app/widget.js"
  data-client="${tenantId}"
  data-theme="dark"
></script>`;

  useEffect(() => {
    const processPayment = async () => {
      if (!tenantId) return;

      if (!sessionId) {
        console.log(
          `✅ Free tier user - no payment processing needed for tenant: ${tenantId}`
        );
        setPaymentProcessed(true);
        return;
      }

      if (paymentProcessed || processingPayment) return;

      setProcessingPayment(true);
      console.log(
        `🔄 Processing payment for tenant: ${tenantId}, session: ${sessionId}`
      );

      try {
        const response = await fetch("/api/process-payment-by-tenant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: sessionId, tenantId }),
        });

        const result = await response.json();

        if (result.success) {
          console.log("✅ Payment processed successfully:", result.message);
          setPaymentProcessed(true);
        } else {
          console.error("❌ Failed to process payment:", result.error);
        }
      } catch (error) {
        console.error("❌ Error processing payment:", error);
      } finally {
        setProcessingPayment(false);
      }
    };

    processPayment();
  }, [tenantId, sessionId, paymentProcessed, processingPayment]);

  const handleCopy = () => {
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand("copy");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <img
        src="/bizchat-horizontal.png"
        alt="BizChat Logo"
        className="h-10 mb-6"
      />
      <h1 className="text-3xl font-bold mb-4 text-green-700">
        Registration Successful!
      </h1>

      {processingPayment && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">
              Processing payment and updating your account...
            </span>
          </div>
        </div>
      )}

      {paymentProcessed && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-700">
              {sessionId
                ? "Payment processed successfully! Your account is now active."
                : "Account created successfully! Your free account is now active."}
            </span>
          </div>
        </div>
      )}

      <p className="mb-6 text-lg text-gray-700">
        Add this script to your website to integrate BizChat:
      </p>
      <div className="w-full max-w-xl bg-gray-900 rounded-lg p-4 mb-4">
        <textarea
          ref={codeRef}
          value={scriptTag}
          readOnly
          className="w-full bg-gray-900 text-green-300 font-mono text-sm rounded resize-none p-2"
          rows={5}
        />
      </div>
      <button
        onClick={handleCopy}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
      >
        Copy to Clipboard
      </button>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <>
      <Navbar active="register-success" />
      <Suspense
        fallback={<div className="p-6">Loading registration details...</div>}
      >
        <RegisterSuccessContent />
      </Suspense>
    </>
  );
}

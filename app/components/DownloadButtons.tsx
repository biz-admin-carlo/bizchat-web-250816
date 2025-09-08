"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

interface DownloadButtonsProps {
  className?: string;
}

export default function DownloadButtons({
  className = "",
}: DownloadButtonsProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "android" | "ios" | "windows" | "mac" | null
  >(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Mock app store URLs - replace with actual URLs when available
  const appUrls = {
    android:
      "https://play.google.com/store/apps/details?id=com.bizsolutions.bizchat",
    ios: "https://apps.apple.com/ph/app/bizchat-customer-support-tool/id6747104185",
    windows: "coming-soon",
    mac: "coming-soon",
  };

  const generateQRCode = async (url: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownloadClick = (
    platform: "android" | "ios" | "windows" | "mac"
  ) => {
    setSelectedPlatform(platform);
    setShowModal(true);
    if (platform === "android" || platform === "ios") {
      generateQRCode(appUrls[platform]);
    }
  };

  const handleDirectDownload = (
    platform: "android" | "ios" | "windows" | "mac"
  ) => {
    if (platform === "android" || platform === "ios") {
      window.open(appUrls[platform], "_blank");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlatform(null);
    setQrCodeDataUrl("");
  };

  return (
    <>
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {/* Android Download Button */}
        <button
          onClick={() => handleDownloadClick("android")}
          className="flex flex-col items-center justify-center gap-2 bg-green-600 text-white font-medium rounded-lg px-4 py-3 hover:bg-green-700 transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.6818 12 7.6818s-3.5902.5621-5.1367 1.6649L4.841 5.8437a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
          </svg>
          <span className="text-xs">Android</span>
        </button>

        {/* iOS Download Button */}
        <button
          onClick={() => handleDownloadClick("ios")}
          className="flex flex-col items-center justify-center gap-2 bg-black text-white font-medium rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <span className="text-xs">iOS</span>
        </button>

        {/* Windows Download Button */}
        <button
          onClick={() => handleDownloadClick("windows")}
          className="flex flex-col items-center justify-center gap-2 bg-blue-600 text-white font-medium rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22l-10-1.91v-6.84l10 .15z" />
          </svg>
          <span className="text-xs">Windows</span>
        </button>

        {/* Mac Download Button */}
        <button
          onClick={() => handleDownloadClick("mac")}
          className="flex flex-col items-center justify-center gap-2 bg-gray-800 text-white font-medium rounded-lg px-4 py-3 hover:bg-gray-900 transition-colors text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <span className="text-xs">Mac</span>
        </button>
      </div>

      {/* Download Modal */}
      {showModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPlatform === "windows" || selectedPlatform === "mac"
                  ? "Coming Soon"
                  : `Download BizChat for ${
                      selectedPlatform === "android" ? "Android" : "iOS"
                    }`}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                {selectedPlatform === "android" || selectedPlatform === "ios"
                  ? `Scan the QR code with your ${
                      selectedPlatform === "android" ? "Android" : "iPhone"
                    } camera to download the app`
                  : "Desktop versions are coming soon! Stay tuned for updates."}
              </p>

              {(selectedPlatform === "android" || selectedPlatform === "ios") &&
                qrCodeDataUrl && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="w-48 h-48 border border-gray-200 rounded-lg"
                    />
                  </div>
                )}

              <div className="space-y-3">
                {selectedPlatform === "android" ||
                selectedPlatform === "ios" ? (
                  <button
                    onClick={() => handleDirectDownload(selectedPlatform)}
                    className="w-full bg-red-500 text-white font-semibold rounded-lg px-6 py-3 hover:bg-red-600 transition-colors text-lg"
                  >
                    {selectedPlatform === "android"
                      ? "Open Google Play Store"
                      : "Open App Store"}
                  </button>
                ) : (
                  <div className="w-full bg-gray-100 text-gray-500 font-semibold rounded-lg px-6 py-3 text-center text-lg">
                    Coming Soon
                  </div>
                )}

                <button
                  onClick={closeModal}
                  className="w-full border-2 border-gray-300 text-gray-700 font-semibold rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

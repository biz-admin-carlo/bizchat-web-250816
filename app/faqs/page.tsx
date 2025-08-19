"use client";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function FaqsPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      questions: ["Question?", "Question?", "Question?", "Question?"],
    },
    {
      title: "Features & Functionality",
      questions: ["Question?", "Question?"],
    },
    {
      title: "Plans & Billing",
      questions: ["Question?", "Question?", "Question?"],
    },
    {
      title: "Technical Questions",
      questions: ["Question?", "Question?"],
    },
    {
      title: "Support & Assistance",
      questions: ["Question?", "Question?", "Question?"],
    },
    {
      title: "Security & Privacy",
      questions: ["Question?", "Question?", "Question?"],
    },
  ];
  // Track open state for each question in each category
  const [openIndexes, setOpenIndexes] = useState(
    faqCategories.map((cat) => Array(cat.questions.length).fill(false))
  );

  return (
    <div className="min-h-screen bg-white w-full">
      <Navbar active="faqs" />
      <div className="h-8" />
      {/* FAQ Header Section */}
      <section className="w-full bg-[#191919] flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-32 pt-8 md:pt-12 gap-10 md:gap-0 min-h-[320px] md:min-h-[340px]">
        {/* Left: Headline and Subheadline */}
        <div className="flex-1 max-w-2xl text-left">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3">
            <span className="text-orange-500">Biz</span>
            <span className="text-red-500">Chat</span> FAQ:
            <br />
            <span className="text-white">
              Quick Answers to
              <br className="hidden md:block" /> Common Questions
            </span>
          </h1>
          <p className="text-white text-base md:text-lg mb-3">
            Whether you’re new to BizChat or exploring more features, this FAQ
            answers the most common questions about our platform — from setup
            and billing to using our tools. We're here to make things easy for
            you.
          </p>
          <p className="text-white text-base md:text-lg">
            Can’t find what you’re looking for?{" "}
            <a
              href="#contact"
              className="text-orange-400 underline hover:text-orange-300"
            >
              Contact our support team
            </a>{" "}
            and we’ll be happy to assist you.
          </p>
        </div>
        {/* Right: Robot Image */}
        <div className="flex-1 flex items-center justify-center relative min-h-[300px] md:min-h-[100px]">
          <img
            src="/faqrobot.png"
            alt="BizChat FAQ Robot"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
      <div className="h-16" />
      <section className="w-full flex flex-col items-center py-24 px-4 md:px-12 lg:px-0">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-10 text-[#191919]">
          Frequently Asked Questions
        </h1>
        <div className="w-full max-w-4xl mx-auto mt-8">
          {faqCategories.map((cat, catIdx) => (
            <div key={cat.title} className="mb-10">
              <div className="flex items-center mb-4">
                <span className="h-3 w-3 rounded-full bg-orange-500 mr-2 inline-block"></span>
                <h2 className="text-xl md:text-2xl font-bold text-[#191919]">
                  {cat.title}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cat.questions.map((q, qIdx) => {
                  const open = openIndexes[catIdx][qIdx];
                  return (
                    <div key={qIdx}>
                      <button
                        className="w-full flex items-center justify-between py-5 text-left font-semibold text-base md:text-lg text-[#191919] focus:outline-none"
                        onClick={() =>
                          setOpenIndexes((prev) =>
                            prev.map((arr, i) =>
                              i === catIdx
                                ? arr.map((v, j) => (j === qIdx ? !v : v))
                                : arr
                            )
                          )
                        }
                        aria-expanded={open}
                        aria-controls={`faq-panel-${catIdx}-${qIdx}`}
                      >
                        {q}
                        <svg
                          className={`w-6 h-6 transition-transform ${
                            open ? "rotate-180" : "rotate-0"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        id={`faq-panel-${catIdx}-${qIdx}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          open ? "max-h-40 pb-5" : "max-h-0"
                        } text-[#333] text-base`}
                      >
                        <div className={open ? "opacity-100" : "opacity-0"}>
                          {/* Placeholder answer */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="w-full bg-[#191919] flex flex-col items-center justify-center py-20 px-4 border-t border-[#333]">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-4 text-white">
          Still Need <span className="text-orange-500">Help?</span>
        </h2>
        <p className="text-center text-white text-lg max-w-3xl mb-10">
          Didn’t find the answer you were looking for? Our team is here to help.
          Reach out to us anytime and we’ll get back to you as soon as possible.
        </p>
        <div className="flex flex-row items-center justify-center gap-2 md:gap-4 mt-2">
          <button className="bg-red-500 text-white font-semibold rounded-lg px-8 py-3 hover:bg-red-600 transition-colors text-lg z-10">
            Contact US
          </button>
          <img
            src="/arrow-help.png"
            alt="Arrow to help"
            className="w-16 md:w-20 h-auto ml-2 md:ml-4 pointer-events-none select-none"
          />
        </div>
      </section>
      {/* Footer Section */}
      <footer className="bg-[#fafafa] border-t border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row md:justify-between md:items-start gap-12 md:gap-0">
          {/* Left: Logo and Tagline */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <div className="flex items-center mb-4">
              <img
                src="/bizchat-horizontal.png"
                alt="BizChat Logo"
                className="h-12 mr-3"
              />
            </div>
            <div className="text-xl font-bold text-[#1C1C1C] text-center md:text-left mb-2">
              AI-Powered Chat Support.
              <br />
              Built for Business.
            </div>
          </div>
          {/* Center: Navigation Links */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <div className="font-bold text-lg mb-2 text-[#1C1C1C]">
              Navigation Links
            </div>
            <ul className="text-[#1C1C1C] space-y-1 text-base">
              <li>
                <a href="/" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="/features" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/faqs" className="hover:underline">
                  FAQ’s
                </a>
              </li>
            </ul>
          </div>
          {/* Right: Help Links */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <div className="font-bold text-lg mb-2 text-[#1C1C1C]">Help</div>
            <ul className="text-[#1C1C1C] space-y-1 text-base">
              <li>
                <a href="#contact" className="hover:underline">
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://mybizsolutions.us/terms-of-service"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://mybizsolutions.us/privacy-policy"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="bg-[#191919] w-full py-3 text-center border-t border-gray-300">
          <span className="text-base text-white">
            Powered By:{" "}
            <span className="text-orange-500 font-bold">BizSolutions LLC</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

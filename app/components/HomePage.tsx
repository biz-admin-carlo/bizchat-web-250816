"use client";

import Navbar from "./Navbar";
import React, { useState } from "react";
import Link from "next/link";
import DownloadButtons from "./DownloadButtons";

export default function HomePage() {
  const [testimonialsPaused, setTestimonialsPaused] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [additionalCompanies, setAdditionalCompanies] = useState<number>(0);
  const [additionalMembers, setAdditionalMembers] = useState<number>(0);

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for getting started with basic features",
      features: ["Chat messaging app account", "Web plugin"],
    },
    {
      id: "base",
      name: "Base Subscription",
      price: 25,
      period: "per month",
      description: "Perfect for single company with full features",
      features: [
        "Chat messaging app account",
        "Web plugin",
        "Auto translate chat messages",
        "Ticketing system",
        "Emailing functionality",
        "Single company support",
      ],
    },
    {
      id: "white-label",
      name: "White Label",
      price: 55,
      period: "per month",
      description: "Same features as base with white label branding",
      features: [
        "Chat messaging app account",
        "Web plugin",
        "Auto translate chat messages",
        "Ticketing system",
        "Emailing functionality",
        "White label branding",
        "Custom branding options",
        "Remove BizChat branding",
        "Custom domain support",
        "Single company support",
      ],
    },
  ];

  const calculateTotalPrice = () => {
    if (!selectedTier) return 0;
    if (selectedTier === "free") return 0;
    const basePrice =
      pricingTiers.find((tier) => tier.id === selectedTier)?.price || 0;
    const additionalCompaniesCost = additionalCompanies * 10;
    const additionalMembersCost = additionalMembers * 5;
    return basePrice + additionalCompaniesCost + additionalMembersCost;
  };

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleAdditionalCompaniesChange = (count: number) => {
    setAdditionalCompanies(Math.max(0, count));
  };

  const handleAdditionalMembersChange = (count: number) => {
    setAdditionalMembers(Math.max(0, count));
  };

  const handleGetStarted = () => {
    // Redirect to register-company page for all plans
    window.location.href = "/register-company";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="home" />

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>

      {/* Hero Section */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-full">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 sm:gap-12 items-start relative h-full">
            {/* Left Column */}
            <div className="z-10 text-[#1C1C1C] flex-1 w-full lg:w-auto lg:text-left text-center flex flex-col">
              <h1 className="font-normal mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-tight lg:leading-[1.1]">
                <span className="text-orange-500">AI-Powered</span> Chat
                <br />
                Support. Built for
                <br />
                <span className="text-red-500">Business.</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#1C1C1C] mb-6 sm:mb-8">
                From instant replies to multilingual support, BizChat helps you
                deliver amazing customer service, everywhere.
              </p>

              {/* ⭐ FIXED BUTTON CONTAINER ⭐ */}
              <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10 w-full min-w-0">
                <Link
                  href="/features"
                  className="border-2 border-gray-300 text-gray-900 font-semibold rounded-lg 
                       px-6 py-3 bg-white hover:bg-gray-50 transition-colors 
                       text-base sm:text-lg text-center w-full"
                >
                  Learn More
                </Link>

                {/* ⭐ FORCE DownloadButtons to occupy full width ⭐ */}
                <div className="w-full  sm:mx-0 flex justify-center ">
                  <div className="w-full">
                    <DownloadButtons />
                  </div>
                </div>
              </div>

              {/* Avatars + rating */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 justify-center lg:justify-start">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <img
                      src="/user1.png"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src="/customer2.png"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src="/customer3.png"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xl sm:text-2xl leading-tight">
                      9999
                    </div>
                    <div className="text-[#1C1C1C] text-xs sm:text-sm">
                      Satisfied Customers
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:border-l sm:border-gray-200 sm:pl-6 lg:pl-8">
                  <div className="font-bold text-xl sm:text-2xl">4.9 / 5</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-[#1C1C1C] text-xs sm:text-sm ml-1 sm:ml-2">
                    Rating
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="relative flex justify-center self-center lg:justify-end h-full flex-1 mb-4 sm:mb-0">
              <img
                src="/hero-main.png"
                alt="Happy user with BizChat"
                className="w-full max-w-3xl h-[250px] sm:h-[400px] md:h-[500px] lg:h-[700px] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="bg-white py-24" id="features">
        <div className="max-w-6xl mx-auto px-4 pb-24">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#1C1C1C]">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
            {/* Feature 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full border-red-400 flex items-center justify-center">
                <img
                  src="/chatsupport.png"
                  alt="Chat Support"
                  className=" object-cover rounded-full"
                />
              </div>
              <div>
                <div className="font-bold text-2xl mb-1 text-[#1C1C1C]">
                  Chat Support
                </div>
                <div className="text-[#1C1C1C]">
                  Talk to visitors in real-time and never miss a chance to
                  engage.
                </div>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full border-red-400 flex items-center justify-center">
                <img
                  src="/autotranslate.png"
                  alt="Auto-Translation"
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <div className="font-bold text-2xl mb-1 text-[#1C1C1C]">
                  Auto-Translation
                </div>
                <div className="text-[#1C1C1C]">
                  Break language barriers with instant multilingual chat
                  support.
                </div>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full border-red-400 flex items-center justify-center">
                <img
                  src="/webplugin.png"
                  alt="Webchat plugin"
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <div className="font-bold text-2xl mb-1 text-[#1C1C1C]">
                  Webchat plugin
                </div>
                <div className="text-[#1C1C1C]">
                  Talk to visitors in real-time and never miss a chance to
                  engage.
                </div>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full border-red-400 flex items-center justify-center">
                <img
                  src="/quickreply.png"
                  alt="Quick Reply Suggestions"
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <div className="font-bold text-2xl mb-1 text-[#1C1C1C]">
                  Quick Reply Suggestions
                </div>
                <div className="text-[#1C1C1C]">
                  Talk to visitors in real-time and never miss a chance to
                  engage.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Designed for Simplicity Section */}
      <section className="w-full h-[400px] flex flex-col lg:flex-row overflow-hidden">
        {/* Left Animated Pattern */}
        <div className="relative flex-1 min-w-[50%] hidden lg:flex items-center justify-center overflow-visible bg-[#191919]">
          <div className="absolute w-[250%] h-[2500px] -rotate-[20deg] flex justify-center gap-2">
            {[0, 1, 2].map((col) => (
              <div
                key={col}
                className={`flex-none flex-col ${
                  col === 1
                    ? "animate-diagonal-pingpong-reverse mt-48"
                    : `animate-diagonal-pingpong ${col === 2 ? "mt-96" : ""}`
                }`}
              >
                {[...Array(20), ...Array(20)].map((_, i) => (
                  <img
                    key={i}
                    src={`/image${(i % 5) + 1}.png`} // change this pattern to your file names
                    alt={`Image ${i + 1}`}
                    className="mb-2 border border-[#aaa] shadow-md"
                    style={{
                      width: "200px",
                      height: "300px",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Right Text Content */}
        <div className="flex-1 min-w-[60%] bg-[#191919] flex items-center justify-center px-8 py-12 pr-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-2">
              Designed for Simplicity.
              <br />
              <span className="text-orange-400">Powered by AI.</span>
            </h2>
            <p className="text-white text-lg mt-6">
              BizChat makes customer support feel effortless, from setup to
              daily use. With an intuitive interface, AI-powered suggestions,
              and seamless integration, your team can start meaningful
              conversations in minutes, not hours. Whether you're managing one
              brand or many, BizChat keeps everything organized, fast, and
              smart.
            </p>
          </div>
        </div>
      </section>

      {/* Stay Connected Section */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-6 text-[#1C1C1C]">
            Stay Connected — Anywhere, Anytime
          </h2>
          <p className="text-center text-lg text-[#1C1C1C] mb-12 max-w-3xl mx-auto">
            BizChat is designed to work flawlessly across all your devices.
            Whether you're chatting with customers from your desktop at the
            office or responding on-the-go from your phone, BizChat keeps you in
            sync, no matter where business takes you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
            {/* Left Column */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-6 text-[#1C1C1C]">
                Full-featured Desktop Dashboard
              </h3>
              <img
                src="/desktop-bizchat1.png"
                alt="BizChat Desktop Dashboard"
                className="w-full aspect-square max-w-[500px] mx-auto rounded-lg shadow-lg object-cover object-center transform scale-105 hover:scale-110 transition-transform duration-300"
              />
            </div>
            {/* Right Column */}
            <div className="relative">
              <h3 className="text-2xl font-bold text-center mb-6 text-[#1C1C1C]">
                Responsive Mobile Experience
              </h3>
              <div className="grid grid-cols-2 gap-4 max-w-[500px] mx-auto transform scale-105 hover:scale-110 transition-transform duration-300">
                <img
                  src="/image1.png"
                  alt="BizChat Mobile Screenshot 1"
                  className="w-full aspect-square rounded-lg shadow-lg object-cover"
                />
                <img
                  src="/image2.png"
                  alt="BizChat Mobile Screenshot 2"
                  className="w-full aspect-square rounded-lg shadow-lg object-cover"
                />
                <img
                  src="/image3.png"
                  alt="BizChat Mobile Screenshot 3"
                  className="w-full aspect-square rounded-lg shadow-lg object-cover"
                />
                <img
                  src="/image4.png"
                  alt="BizChat Mobile Screenshot 4"
                  className="w-full aspect-square rounded-lg shadow-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-[#191919] py-24 w-full">
        <div>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-5xl font-bold text-white text-center w-full">
              Trusted by Growing{" "}
              <span className="text-orange-500">Businesses</span>
            </h2>
          </div>
          <div className="overflow-x-hidden pb-4">
            <div
              className="flex gap-8 min-w-[900px] animate-testimonial-scroll px-8"
              style={{
                animationPlayState: testimonialsPaused ? "paused" : "running",
              }}
              onMouseEnter={() => setTestimonialsPaused(true)}
              onMouseLeave={() => setTestimonialsPaused(false)}
            >
              {/* Testimonials with different customer images */}
              {[
                {
                  name: "Sarah Johnson",
                  title: "Marketing Director",
                  company: "TechFlow Solutions",
                  image: "/customer2.png",
                  testimonial:
                    "BizChat has revolutionized our customer engagement. Response times dropped by 80% and customer satisfaction scores increased dramatically. The AI responses are incredibly natural and helpful.",
                },
                {
                  name: "Michael Chen",
                  title: "CEO",
                  company: "StartupHub Inc",
                  image: "/customer3.png",
                  testimonial:
                    "As a growing startup, we needed a cost-effective solution that could scale with us. BizChat delivered exactly that - professional customer support without the overhead of a large team.",
                },
                {
                  name: "Emily Rodriguez",
                  title: "Customer Success Manager",
                  company: "E-commerce Plus",
                  image: "/user1.png",
                  testimonial:
                    "The multi-company feature is a game-changer for our business. We can manage customer support for all our brands from one dashboard. It's incredibly efficient and user-friendly.",
                },
                {
                  name: "David Thompson",
                  title: "Operations Director",
                  company: "Global Retail Corp",
                  image: "/customer2.png",
                  testimonial:
                    "Implementing BizChat was seamless. The integration took minutes, and our customers love the instant responses. Our support team can now focus on complex issues while routine queries are handled automatically.",
                },
                {
                  name: "Lisa Park",
                  title: "Founder",
                  company: "Digital Agency Pro",
                  image: "/customer3.png",
                  testimonial:
                    "The white-label solution is perfect for our agency. We can offer our clients branded chat support without any technical complexity. It's been a major selling point for our services.",
                },
                {
                  name: "James Wilson",
                  title: "IT Manager",
                  company: "Healthcare Solutions",
                  image: "/user1.png",
                  testimonial:
                    "Security and compliance were our top concerns. BizChat's enterprise features and data protection measures give us complete peace of mind while providing excellent patient support.",
                },
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center w-[370px] flex-shrink-0"
                >
                  <div className="relative bg-white rounded-xl p-8 w-full">
                    <div className="absolute top-6 left-6 text-3xl text-orange-500 font-bold">
                      &#8221;&#8221;
                    </div>
                    <div className="text-[#1C1C1C] text-left pt-8">
                      {testimonial.testimonial}
                    </div>
                  </div>
                  <div className="w-full flex justify-center h-0">
                    <div className="w-0 h-0 border-x-12 border-x-transparent border-t-16 border-t-white"></div>
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-8">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover"
                    />
                    <div className="font-semibold text-orange-500">
                      {testimonial.name}
                    </div>
                    <div className="text-white text-sm">
                      {testimonial.title}
                    </div>
                    <div className="text-white text-xs opacity-80">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="bg-white py-24 w-full flex flex-col items-center"
        id="pricing"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-prata text-center mb-4 text-[#1C1C1C]">
          Simple, Scalable Pricing for Every Stage
        </h2>
        <p className="text-center text-lg text-[#1C1C1C] mb-10 max-w-2xl">
          Whether you're just getting started or managing support across
          multiple brands, BizChat offers flexible plans that grow with your
          business. No hidden fees. No complexity. Just powerful features at a
          price that fits.
        </p>
        <div className="flex justify-center w-full mb-16">
          <button
            onClick={() => setShowPricingModal(true)}
            className="compare-pricing-button bg-red-500 text-white font-semibold rounded-lg px-8 py-3 hover:bg-red-600 transition-colors text-lg"
          >
            Compare Pricing
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center w-full max-w-6xl">
          {/* Free Card */}
          <div className="flex-1 border-2 border-gray-400 rounded-xl p-8 bg-gradient-to-br from-green-50 to-green-100 relative min-w-[320px] max-w-[400px]">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-1 rounded-full font-semibold text-sm">
              Free
            </div>
            <div className="flex items-end mb-2 mt-6">
              <span
                className="text-5xl font-prata text-[#1C1C1C] mr-2"
                style={{ fontFamily: "Prata, serif" }}
              >
                $
              </span>
              <span
                className="text-5xl font-prata text-[#1C1C1C]"
                style={{ fontFamily: "Prata, serif" }}
              >
                0
              </span>
              <span className="ml-2 text-gray-700 mb-1">forever</span>
            </div>
            <p className="text-[#1C1C1C] mb-4">
              Perfect for getting started with basic features. Includes chat
              messaging app account and web plugin to help you begin your
              customer support journey.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Chat messaging app account
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">Web plugin</span>
              </div>
            </div>
          </div>
          {/* Base Subscription Card */}
          <div className="flex-1 border-2 border-gray-400 rounded-xl p-8 bg-white relative min-w-[320px] max-w-[400px]">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-1 rounded-full font-semibold text-sm">
              Base Subscription
            </div>
            <div className="flex items-end mb-2 mt-6">
              <span
                className="text-5xl font-prata text-[#1C1C1C] mr-2"
                style={{ fontFamily: "Prata, serif" }}
              >
                $
              </span>
              <span
                className="text-5xl font-prata text-[#1C1C1C]"
                style={{ fontFamily: "Prata, serif" }}
              >
                25
              </span>
              <span className="ml-2 text-gray-700 mb-1">per month</span>
            </div>
            <p className="text-[#1C1C1C] mb-4">
              Perfect for single company with full features. Includes all the
              essential tools you need for comprehensive customer support.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Chat messaging app account
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">Web plugin</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Auto translate chat messages
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">Ticketing system</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Emailing functionality
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Single company support
                </span>
              </div>
            </div>
          </div>
          {/* White Label Card */}
          <div className="flex-1 border-2 border-orange-400 rounded-xl p-8 bg-white relative min-w-[320px] max-w-[400px]">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full font-semibold text-sm">
              Most Popular
            </div>
            <div className="flex items-end mb-2 mt-6">
              <span
                className="text-5xl font-prata text-[#1C1C1C] mr-2"
                style={{ fontFamily: "Prata, serif" }}
              >
                $
              </span>
              <span
                className="text-5xl font-prata text-[#1C1C1C]"
                style={{ fontFamily: "Prata, serif" }}
              >
                55
              </span>
              <span className="ml-2 text-gray-700 mb-1">per month</span>
            </div>
            <p className="text-[#1C1C1C] mb-4">
              Same features as base with white label branding. Perfect for
              businesses that want to maintain their own brand identity.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Chat messaging app account
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">Web plugin</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Auto translate chat messages
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">Ticketing system</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Emailing functionality
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  White label branding
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Custom branding options
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Remove BizChat branding
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Custom domain support
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-sm">
                  Single company support
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section: Start Chatting Smarter Today */}
      <section className="bg-white py-24 w-full flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 text-[#1C1C1C]">
          Start Chatting Smarter Today
        </h2>
        <p className="text-center text-lg text-[#1C1C1C] max-w-3xl">
          Boost your support, connect with customers, and simplify communication
          — all in one AI-powered platform. It takes just minutes to get
          started.
        </p>
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
                <a href="#pricing" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:underline">
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

      {/* Pricing Comparison Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Compare Pricing Plans
                </h2>
                <button
                  onClick={() => setShowPricingModal(false)}
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
            </div>

            <div className="p-6">
              {/* Plan Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Your Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTier === tier.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      onClick={() => handleTierSelect(tier.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {tier.name}
                        </h4>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            selectedTier === tier.id
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedTier === tier.id && (
                            <svg
                              className="w-3 h-3 text-white mx-auto mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${tier.price}
                        <span className="text-sm font-normal text-gray-600 ml-1">
                          {tier.period}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {tier.description}
                      </p>
                      <div className="space-y-2">
                        {tier.features.slice(0, 3).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-700"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {feature}
                          </div>
                        ))}
                        {tier.features.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{tier.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              {selectedTier && selectedTier !== "free" && (
                <>
                  {/* Additional Companies */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Additional Companies
                        </h4>
                        <p className="text-sm text-gray-600">
                          $10 each per month
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handleAdditionalCompaniesChange(
                              additionalCompanies - 1
                            )
                          }
                          disabled={additionalCompanies === 0}
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                          {additionalCompanies}
                        </span>
                        <button
                          onClick={() =>
                            handleAdditionalCompaniesChange(
                              additionalCompanies + 1
                            )
                          }
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {additionalCompanies > 0 && (
                      <div className="text-sm text-gray-600">
                        Additional cost:{" "}
                        <span className="font-semibold text-orange-600">
                          ${additionalCompanies * 10}/month
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Additional Members */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Additional Members
                        </h4>
                        <p className="text-sm text-gray-600">
                          $5 each per month
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handleAdditionalMembersChange(additionalMembers - 1)
                          }
                          disabled={additionalMembers === 0}
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                          {additionalMembers}
                        </span>
                        <button
                          onClick={() =>
                            handleAdditionalMembersChange(additionalMembers + 1)
                          }
                          className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {additionalMembers > 0 && (
                      <div className="text-sm text-gray-600">
                        Additional cost:{" "}
                        <span className="font-semibold text-orange-600">
                          ${additionalMembers * 5}/month
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Total Price */}
              {selectedTier && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      {selectedTier === "free"
                        ? "Total Price"
                        : "Total Monthly Price"}
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {selectedTier === "free"
                        ? "Free"
                        : `$${calculateTotalPrice()}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedTier === "free" ? "forever" : "per month"}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGetStarted}
                  disabled={!selectedTier}
                  className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedTier === "free" ? "Get Started Free" : "Get Started"}
                </button>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes diagonal-pingpong {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        .animate-diagonal-pingpong {
          animation: diagonal-pingpong 30s linear infinite alternate;
        }
        .animate-diagonal-pingpong-reverse {
          animation: diagonal-pingpong 30s linear infinite alternate-reverse;
        }
      `}</style>

      <style jsx global>{`
        @keyframes testimonial-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-testimonial-scroll {
          animation: testimonial-scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

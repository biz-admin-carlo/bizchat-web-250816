"use client";

import Navbar from "./Navbar";
import Link from "next/link";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#191919] w-full">
      <Navbar active="features" />

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>

      {/* Header Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-24 lg:px-40 py-16 md:py-24 gap-10 md:gap-0">
        {/* Left: Headline and Subheadline */}
        <div className="flex-1 max-w-xl text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
            <span className="block text-orange-500">Powerful Features,</span>
            <span className="block text-red-500">Made Simple</span>
          </h1>
          <p className="text-white text-sm md:text-base mt-6">
            BizChat gives your team everything they need to support customers
            faster, smarter, and more efficiently — all in one AI-powered
            platform. Whether you're handling support for one brand or multiple
            businesses, our tools are designed to scale with you.
          </p>
        </div>
        {/* Right: Robot Image and Icons */}
        <div className="flex-1 flex items-center justify-center relative min-w-[320px] max-w-[600px] w-full">
          <img
            src="/robot_features.png"
            alt="BizChat Robot Features"
            className="w-full max-w-[420px] md:max-w-[520px] lg:max-w-[600px] h-auto z-10"
          />
          {/* Orange icons (absolute, for visual effect) */}
          <div className="absolute top-6 left-0 md:left-2 flex flex-col gap-4 z-0">
            <div className="bg-orange-400 rounded-xl px-4 py-2 text-white font-bold text-lg shadow-lg flex items-center gap-2">
              <span className="text-xs">AUTO</span>
              <span className="text-xl">
                A<sup className="text-xs">z</sup>
              </span>
            </div>
            <div className="bg-orange-400 rounded-xl p-2 mt-4 shadow-lg">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="white" />
                <path
                  d="M8 12h8M12 8v8"
                  stroke="#F97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-6 right-0 md:right-2 flex flex-col gap-4 z-0">
            <div className="bg-orange-400 rounded-xl p-2 shadow-lg">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="white" />
                <path
                  d="M12 7v5l3 3"
                  stroke="#F97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="bg-orange-400 rounded-xl p-2 mt-4 shadow-lg">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="white" />
                <path
                  d="M8 12a4 4 0 018 0 4 4 0 01-8 0z"
                  stroke="#F97316"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Live Chat Support Section */}
      <section className="w-full bg-white flex flex-col md:flex-row items-center justify-between gap-20 px-6 md:px-24 lg:px-40 py-20 md:py-28">
        {/* Left: Text Content */}
        <div className="flex-1 max-w-xl text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1C1C] mb-3">
            Live Chat Support
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mb-3">
            Real-time customer engagement.
          </h3>
          <p className="text-[#1C1C1C] text-sm md:text-base">
            Whether you're just getting started or managing support across
            multiple brands, BizChat offers flexible plans that grow with your
            business. No hidden fees. No complexity. Just powerful features at a
            price that fits.
          </p>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src="/robot_live_cs.png"
            alt="Live Chat Support Robot"
            className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] h-auto"
          />
        </div>
      </section>

      {/* Auto-Translation Section */}
      <section className="w-full bg-white flex flex-col md:flex-row items-center justify-between gap-20 px-6 md:px-24 lg:px-40 py-20 md:py-28">
        {/* Left: Image */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src="/auto_translation.png"
            alt="Auto-Translation"
            className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] h-auto"
          />
        </div>
        {/* Right: Text Content */}
        <div className="flex-1 max-w-xl text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1C1C] mb-3">
            Auto-Translation
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mb-3">
            Multilingual support without the complexity.
          </h3>
          <p className="text-[#1C1C1C] text-sm md:text-base">
            Whether you're just getting started or managing support across
            multiple brands, BizChat offers flexible plans that grow with your
            business. No hidden fees. No complexity. Just powerful features at a
            price that fits.
          </p>
        </div>
      </section>

      {/* Ticketing System Section */}
      <section className="w-full bg-white flex flex-col md:flex-row items-center justify-between gap-20 px-6 md:px-24 lg:px-40 py-20 md:py-28">
        {/* Left: Text Content */}
        <div className="flex-1 max-w-xl text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1C1C] mb-3">
            Ticketing System
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mb-3">
            Organized support, streamlined resolution.
          </h3>
          <p className="text-[#1C1C1C] text-sm md:text-base">
            Convert chat conversations into support tickets effortlessly. The
            integrated ticketing system ensures every inquiry is tracked,
            categorized, and addressed. Agents can prioritize tickets, assign
            them to departments, and follow structured workflows to maintain
            high-quality customer service standards.
          </p>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src="/ticketign.png"
            alt="Ticketing System"
            className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] h-auto"
          />
        </div>
      </section>

      {/* Webchat Plugin Section */}
      <section className="w-full bg-white flex flex-col md:flex-row items-center justify-between gap-20 px-6 md:px-24 lg:px-40 py-20 md:py-28">
        {/* Left: Image */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src="/webchat.png"
            alt="Webchat Plugin"
            className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] h-auto"
          />
        </div>
        {/* Right: Text Content */}
        <div className="flex-1 max-w-xl text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1C1C] mb-3">
            Webchat Plugin
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mb-3">
            Easy integration, maximum visibility.
          </h3>
          <p className="text-[#1C1C1C] text-sm md:text-base">
            BizChat’s webchat plugin can be embedded on any website with minimal
            setup. It is lightweight, customizable, and mobile-responsive,
            enabling businesses to proactively engage visitors and convert
            inquiries into meaningful conversations without disrupting the
            website experience.
          </p>
        </div>
      </section>

      {/* Email Sending Section */}
      <section className="w-full bg-white flex flex-col md:flex-row items-center justify-between gap-20 px-6 md:px-24 lg:px-40 py-20 md:py-28">
        {/* Left: Text Content */}
        <div className="flex-1 max-w-xl text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1C1C] mb-3">
            Email Sending
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mb-3">
            Follow-up with context.
          </h3>
          <p className="text-[#1C1C1C] text-sm md:text-base">
            BizChat enables support agents to send personalized email responses
            directly from the chat dashboard. Whether used for follow-ups,
            documentation, or escalations, this feature ensures continuity of
            service across communication channels while keeping all
            correspondence in one platform.
          </p>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src="/email_sending.png"
            alt="Email Sending"
            className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] h-auto rounded-[8px]"
          />
        </div>
      </section>

      {/* Quick Reply Suggestions Section */}
      <section className="w-full bg-white flex flex-col md:flex-row items-center justify-between gap-20 px-6 md:px-24 lg:px-40 py-20 md:py-28">
        {/* Left: Image */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src="/quick_rep.png"
            alt="Quick Reply Suggestions"
            className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] h-auto"
          />
        </div>
        {/* Right: Text Content */}
        <div className="flex-1 max-w-xl text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1C1C] mb-3">
            Quick Reply Suggestions
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mb-3">
            Follow-up with context.
          </h3>
          <p className="text-[#1C1C1C] text-sm md:text-base">
            BizChat enables support agents to send personalized email responses
            directly from the chat dashboard. Whether used for follow-ups,
            documentation, or escalations, this feature ensures continuity of
            service across communication channels while keeping all
            correspondence in one platform.
          </p>
        </div>
      </section>

      {/* Multi-Company Support Section */}
      <section className="w-full bg-white flex flex-col md:flex-row items-center justify-between gap-20 px-6 md:px-24 lg:px-40 py-20 md:py-28">
        {/* Left: Text Content */}
        <div className="flex-1 max-w-xl text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1C1C] mb-3">
            Multi-Company Support
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mb-3">
            Scalable support for multiple brands.
          </h3>
          <p className="text-[#1C1C1C] text-sm md:text-base">
            BizChat supports the management of multiple companies or departments
            under a single admin account. Each company can maintain its own
            branding, settings, and support workflows — making this ideal for
            agencies, BPOs, or organizations handling several client entities.
          </p>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src="/multicompany.png"
            alt="Multi-Company Support"
            className="w-full max-w-[420px] md:max-w-[480px] lg:max-w-[520px] h-auto"
          />
        </div>
      </section>

      {/* More Reasons to Love BizChat Section */}
      <section className="w-full bg-white py-24 px-4 md:px-12 lg:px-32">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-[#191919]">
          More Reasons to Love <span className="text-red-500">BizChat</span>
        </h2>
        <p className="text-center text-lg text-[#1C1C1C] mb-12 max-w-3xl mx-auto">
          We’ve built BizChat to not only be powerful, but also practical,
          secure, and easy to use. Here are a few more ways we make support
          smarter:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="flex flex-col h-full rounded-md overflow-hidden border border-black shadow-sm">
            <div className="bg-white w-full h-56">
              <img
                src="/works_with_mobile.png"
                alt="Works on Desktop & Mobile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-[#191919] p-6 flex-1 flex flex-col justify-start">
              <div className="text-orange-500 font-bold text-xl mb-2">
                Works on Desktop & Mobile
              </div>
              <div className="text-white text-base">
                Stay connected wherever you are. BizChat is fully responsive,
                giving you the same great experience on any device.
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex flex-col h-full rounded-md overflow-hidden border border-black shadow-sm">
            <div className="bg-white w-full h-56">
              <img
                src="/gdpr.png"
                alt="Secure & GDPR-Compliant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-[#191919] p-6 flex-1 flex flex-col justify-start">
              <div className="text-orange-500 font-bold text-xl mb-2">
                Secure & GDPR-Compliant
              </div>
              <div className="text-white text-base">
                Your data and your customers’ data are safe with us. We follow
                industry best practices and comply with global privacy
                standards.
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex flex-col h-full rounded-md overflow-hidden border border-black shadow-sm">
            <div className="bg-white w-full h-56">
              <img
                src="/ez.png"
                alt="Easy to Integrate"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-[#191919] p-6 flex-1 flex flex-col justify-start">
              <div className="text-orange-500 font-bold text-xl mb-2">
                Easy to Integrate
              </div>
              <div className="text-white text-base">
                Add BizChat to your website with just a few clicks. No
                complicated setup or coding required, get started in minutes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section: Ready to see BizChat in action? */}
      <section className="w-full bg-white flex flex-col items-center justify-center py-24 px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-6 text-[#191919]">
          Ready to see BizChat in action?
        </h2>
        <p className="text-center text-lg text-[#1C1C1C] mb-10 max-w-2xl">
          Discover how our powerful features come together to transform your
          customer support. Whether you're ready to dive in or want to explore
          your options, we’ve got you covered.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button className="border-2 border-red-500 text-[#191919] font-semibold rounded-lg px-8 py-3 bg-white hover:bg-red-50 transition-colors text-lg mb-2 sm:mb-0">
            Request a Demo
          </button>
          <span className="mx-2 font-bold text-[#191919]">OR</span>
          <Link
            href="/pricing"
            className="bg-red-500 text-white font-semibold rounded-lg px-8 py-3 hover:bg-red-600 transition-colors text-lg text-center"
          >
            View Pricing
          </Link>
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
    </div>
  );
}

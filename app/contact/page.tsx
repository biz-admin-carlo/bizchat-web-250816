"use client";
import Navbar from "../components/Navbar";
import type { FormEvent } from "react";

export default function ContactPage() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const name =
      (form.elements.namedItem("name") as HTMLInputElement)?.value || "";
    const email =
      (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const phone =
      (form.elements.namedItem("phone") as HTMLInputElement)?.value || "";
    const subjectInput =
      (form.elements.namedItem("subject") as HTMLInputElement)?.value || "";
    const message =
      (form.elements.namedItem("message") as HTMLTextAreaElement)?.value || "";

    const subject = subjectInput || "New contact form submission";
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      "",
      "Message:",
      message,
    ].filter(Boolean);

    const mailto = `mailto:info@bizsolutions.us?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    if (typeof window !== "undefined") {
      const link = document.createElement("a");
      link.href = mailto;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full">
      <Navbar active="contact" />
      <div className="h-16" />
      {/* Contact Header Section e*/}
      <section
        className="w-full bg-[#191919] flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-32 gap-10 md:gap-0 overflow-hidden"
        style={{ height: "300px" }}
      >
        {/* Left: Headline and Subheadline */}
        <div className="flex-1 max-w-2xl text-left">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            <span className="text-orange-500">Let's</span>{" "}
            <span className="text-red-500">Connect</span>
          </h1>
          <p className="text-white text-base md:text-lg">
            Have a question, need support, or want to learn more about BizChat?
            Our team is here to help. Choose the option that fits best, and
            we'll get back to you shortly.
          </p>
        </div>
        {/* Right: Cropped Robot Image */}
        <div className="flex-1 flex items-end justify-center relative h-full overflow-hidden">
          <img
            src="/robo_contact.png"
            alt="BizChat Contact Robot"
            className="h-full w-auto max-h-[300px] max-w-full object-contain object-right"
          />
        </div>
      </section>
      <section className="w-full flex flex-col md:flex-row items-start justify-center gap-12 py-24 px-4 md:px-12 lg:px-0 max-w-7xl mx-auto">
        {/* Left: Contact Info & Demo CTA */}
        <div className="flex-1 max-w-lg w-full">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#191919]">
              Contact our Team
            </h2>
            <p className="text-[#191919] text-base mb-6">
              Have questions or need support? Reach out to the BizChat team,
              we’re here to help.
            </p>
            <div className="mb-4">
              <div className="font-bold text-[#191919] mb-1">Email Us :</div>
              <div className="flex items-center gap-2 text-[#191919] mb-2">
                {/* Mail Icon */}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a3 3 0 003.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                info@bizsolutions.us
              </div>
            </div>
            <div className="mb-8">
              <div className="font-bold text-[#191919] mb-1">Call Us :</div>
              <div className="flex items-center gap-2 text-[#191919]">
                {/* Phone Icon */}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm16 14a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2zm-7-7a6 6 0 016 6v1a1 1 0 01-1 1h-1a16 16 0 01-16-16V5a1 1 0 011-1h1a6 6 0 016 6z"
                  />
                </svg>
                +1 833-249-7418
              </div>
            </div>
            <hr className="my-8 border-gray-200" />
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2 text-[#191919]">
                See <span className="text-orange-500">Biz</span>
                <span className="text-red-500">Chat</span> in Action
              </h3>
              <p className="text-[#191919] mb-4">
                Curious how BizChat can streamline your customer support? Let us
                show you.
                <br />
                Book a personalized demo and discover how our AI-powered
                platform works for your business.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button className="contact-page-button bg-red-500 text-white font-semibold rounded-lg px-6 py-3 hover:bg-red-600 transition-colors text-base flex items-center">
                  Request a Demo
                </button>
                <img
                  src="/arrow-contact.png"
                  alt="Arrow to demo"
                  className="w-10 h-10 md:w-12 md:h-12"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Right: Contact Form */}
        <div className="flex-1 w-full max-w-2xl">
          <form
            className="bg-white rounded-xl shadow-md p-8 flex flex-col gap-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-[#191919] font-semibold mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g John Doe"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-[#191919]"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-[#191919] font-semibold mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="e.g name@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-[#191919]"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-[#191919] font-semibold mb-2"
              >
                Phone Number{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder=""
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-[#191919]"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-[#191919] font-semibold mb-2"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-[#191919]"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-[#191919] font-semibold mb-2"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-[#191919] resize-none"
              />
            </div>
            <div className="text-xs text-gray-500 mb-2">
              By clicking submit, you agree to BizChat’s{" "}
              <a
                href="https://mybizsolutions.us/privacy-policy"
                className="text-orange-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>{" "}
              and consent to receive marketing emails and phone calls (if you
              provided a phone number). You can unsubscribe at any time.
            </div>
            <button
              type="submit"
              className="contact-page-button bg-red-500 text-white font-semibold rounded-lg px-8 py-3 hover:bg-red-600 transition-colors text-lg mt-2"
            >
              Submit
            </button>
          </form>
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
              <li>
                <a href="/contact" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          {/* Right: Help Links */}
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            <div className="font-bold text-lg mb-2 text-[#1C1C1C]">Help</div>
            <ul className="text-[#1C1C1C] space-y-1 text-base">
              <li>
                <a href="/contact" className="hover:underline">
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

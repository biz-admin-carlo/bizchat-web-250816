"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CompanyFormData {
  companyName: string;
  industry: string;
  industryOther: string;
  companySize: string;
  companyCode: string;
  ein: string;
  country: string;
  countryOther: string;
  companyAddress: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  phoneNumber: string;
  website: string;
}

interface CompanyFormErrors {
  companyName?: string;
  industry?: string;
  industryOther?: string;
  companySize?: string;
  companyCode?: string;
  ein?: string;
  country?: string;
  countryOther?: string;
  companyAddress?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminEmail?: string;
  adminPassword?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  website?: string;
}

export default function CompanyRegistrationForm() {
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    industry: "",
    industryOther: "",
    companySize: "",
    companyCode: "",
    ein: "",
    country: "",
    countryOther: "",
    companyAddress: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    phoneNumber: "",
    website: "",
  });

  const [errors, setErrors] = useState<CompanyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: CompanyFormErrors = {};

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
    }

    // Industry validation
    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    } else if (
      formData.industry === "other" &&
      !formData.industryOther.trim()
    ) {
      newErrors.industryOther = "Please specify your industry";
    }

    // Company size validation
    if (!formData.companySize) {
      newErrors.companySize = "Company size is required";
    }

    // Company code validation
    if (!formData.companyCode.trim()) {
      newErrors.companyCode = "Company code is required";
    } else if (formData.companyCode.trim().length < 3) {
      newErrors.companyCode = "Company code must be at least 3 characters";
    } else if (formData.companyCode.trim().length > 10) {
      newErrors.companyCode = "Company code must be 10 characters or less";
    } else if (!/^[A-Z0-9]+$/.test(formData.companyCode.trim())) {
      newErrors.companyCode =
        "Company code must contain only uppercase letters and numbers";
    }

    // EIN validation (optional but if provided, validate format)
    if (formData.ein && !/^\d{2}-\d{7}$/.test(formData.ein)) {
      newErrors.ein = "Please enter a valid EIN (format: XX-XXXXXXX)";
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country === "other" && !formData.countryOther.trim()) {
      newErrors.countryOther = "Please specify your country";
    }

    // Company address validation
    if (!formData.companyAddress.trim()) {
      newErrors.companyAddress = "Company address is required";
    } else if (formData.companyAddress.trim().length < 10) {
      newErrors.companyAddress = "Please enter a complete address";
    }

    // Admin full name validation
    if (!formData.adminFirstName.trim() || !formData.adminLastName.trim()) {
      newErrors.adminFirstName = "Admin full name is required";
      newErrors.adminLastName = "Admin full name is required";
    } else if (
      formData.adminFirstName.trim().length < 2 ||
      formData.adminLastName.trim().length < 2
    ) {
      newErrors.adminFirstName = "Admin name must be at least 2 characters";
      newErrors.adminLastName = "Admin name must be at least 2 characters";
    }

    // Admin email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.adminEmail) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!emailRegex.test(formData.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email address";
    }

    // Admin password validation
    if (!formData.adminPassword) {
      newErrors.adminPassword = "Admin password is required";
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(
        formData.adminPassword
      )
    ) {
      newErrors.adminPassword =
        "Password must contain at least one uppercase letter, one number, and one symbol";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone number validation (optional but if provided, validate format)
    if (
      formData.phoneNumber &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Website validation (optional but if provided, validate format)
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        "Please enter a valid website URL (include http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Convert company code to uppercase
    const processedValue = name === "companyCode" ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof CompanyFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear "other" field when switching away from "other" option
    if (name === "industry" && value !== "other") {
      setFormData((prev) => ({ ...prev, industryOther: "" }));
      setErrors((prev) => ({ ...prev, industryOther: undefined }));
    }
    if (name === "country" && value !== "other") {
      setFormData((prev) => ({ ...prev, countryOther: "" }));
      setErrors((prev) => ({ ...prev, countryOther: undefined }));
    }
  };

  const handlePostRegistration = (companyData: CompanyFormData) => {
    // TODO: Add logic to execute after company registration is complete
    // e.g., analytics, notifications, API calls, etc.
    console.log("Post-registration logic placeholder", companyData);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Check if admin email already exists
    try {
      const res = await fetch("/api/check-user-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.adminEmail }),
      });
      const data = await res.json();
      if (data.exists) {
        setErrors((prev) => ({
          ...prev,
          adminEmail: "An account with this email already exists.",
        }));
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        adminEmail: "Error checking email. Please try again.",
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      // Get the final values (use "other" text if "other" is selected)
      const finalIndustry =
        formData.industry === "other"
          ? formData.industryOther
          : formData.industry;
      const finalCountry =
        formData.country === "other" ? formData.countryOther : formData.country;

      // Create URL parameters with company data
      const params = new URLSearchParams({
        companyName: formData.companyName,
        industry: finalIndustry,
        companySize: formData.companySize,
        companyCode: formData.companyCode,
        ein: formData.ein,
        country: finalCountry,
        companyAddress: formData.companyAddress,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        phoneNumber: formData.phoneNumber,
        website: formData.website,
      });

      // Navigate to pricing-selection page with company data
      router.push(`/pricing-selection?${params.toString()}`);
      // Call post-registration logic skeleton
      handlePostRegistration(formData);
    } catch (error) {
      console.error("Navigation error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Register Your Company
          </h1>
          <p className="text-gray-600">Set up your organization on BizChat</p>
        </div>

        {/* Orange Hint Section */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Important Information
              </h3>
              <div className="mt-2 text-sm text-orange-800">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Create a unique company code (3-10 characters, letters and
                    numbers only)
                  </li>
                  <li>
                    Share this code with your team members for account creation
                  </li>
                  <li>
                    The admin account will have full control over company
                    settings
                  </li>
                  <li>You'll select your pricing plan in the next step</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleNext} className="space-y-6">
          {/* Company Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.companyName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Company Code */}
              <div>
                <label
                  htmlFor="companyCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Code *
                </label>
                <input
                  type="text"
                  id="companyCode"
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.companyCode ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., ABC123"
                  maxLength={10}
                />
                {errors.companyCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companyCode}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  3-10 characters, letters and numbers only
                </p>
              </div>

              {/* EIN */}
              <div>
                <label
                  htmlFor="ein"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  EIN (Employer Identification Number)
                </label>
                <input
                  type="text"
                  id="ein"
                  name="ein"
                  value={formData.ein}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.ein ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="XX-XXXXXXX"
                  maxLength={10}
                />
                {errors.ein && (
                  <p className="mt-1 text-sm text-red-600">{errors.ein}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optional - Format: XX-XXXXXXX
                </p>
              </div>

              {/* Industry */}
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Industry *
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-gray-900 ${
                    errors.industry ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
                )}
              </div>

              {/* Industry Other */}
              {formData.industry === "other" && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label
                    htmlFor="industryOther"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Specify Industry *
                  </label>
                  <input
                    type="text"
                    id="industryOther"
                    name="industryOther"
                    value={formData.industryOther}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                      errors.industryOther
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your industry"
                  />
                  {errors.industryOther && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.industryOther}
                    </p>
                  )}
                </div>
              )}

              {/* Company Size */}
              <div>
                <label
                  htmlFor="companySize"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Size *
                </label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-gray-900 ${
                    errors.companySize ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
                {errors.companySize && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companySize}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-gray-900 ${
                    errors.country ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Australia">Australia</option>
                  <option value="Japan">Japan</option>
                  <option value="India">India</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Mexico">Mexico</option>
                  <option value="other">Other</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </div>

              {/* Country Other */}
              {formData.country === "other" && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label
                    htmlFor="countryOther"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Specify Country *
                  </label>
                  <input
                    type="text"
                    id="countryOther"
                    name="countryOther"
                    value={formData.countryOther}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                      errors.countryOther ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your country"
                  />
                  {errors.countryOther && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.countryOther}
                    </p>
                  )}
                </div>
              )}

              {/* Company Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="companyAddress"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Address *
                </label>
                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.companyAddress ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter complete company address"
                />
                {errors.companyAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companyAddress}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.website ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="https://yourcompany.com"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Account Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Admin Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Full Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="adminFullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin Full Name *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      id="adminFirstName"
                      name="adminFirstName"
                      value={formData.adminFirstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                        errors.adminFirstName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="First Name"
                    />
                    {errors.adminFirstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.adminFirstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      id="adminLastName"
                      name="adminLastName"
                      value={formData.adminLastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                        errors.adminLastName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Last Name"
                    />
                    {errors.adminLastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.adminLastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Email */}
              <div>
                <label
                  htmlFor="adminEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin Email *
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.adminEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter admin email address"
                />
                {errors.adminEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.adminEmail}
                  </p>
                )}
              </div>

              {/* Admin Password */}
              <div>
                <label
                  htmlFor="adminPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin Password *
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.adminPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Create admin password"
                />
                {errors.adminPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.adminPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors placeholder-gray-600 text-gray-900 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm admin password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-form-button w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              "Next: Choose Your Plan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

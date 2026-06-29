// src/components/ForgotPassword.tsx
import React, { useState } from "react";

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
  onEmailSent: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onNavigateToLogin,
  onEmailSent,
}) => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);

    // Mock loading state to match user experience
    setTimeout(() => {
      setLoading(false);
      onEmailSent();
    }, 800);
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-white p-4 relative">
      <div className="w-full max-w-[320px] bg-white rounded-lg p-6 sm:shadow-md sm:border sm:border-gray-100 flex flex-col relative">
        
        {/* Back Arrow button */}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="absolute left-6 top-6 flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Back to login"
        >
          <img
            src="/Platzi_YardSale_Icons/flechita.svg"
            alt="Back"
            className="w-[8px] h-[14px] rotate-180 transform"
          />
        </button>

        {/* Logo at the top center */}
        <img
          src="/Platzi_YardSale_Logos/logo_yard_sale.svg"
          alt="Yard Sale Logo"
          className="w-[150px] mb-8 mt-6 mx-auto block"
        />

        <h1 className="text-xl font-bold mb-2 text-left text-[#000000]">
          Forgot my password
        </h1>
        
        <p className="text-gray-400 text-sm mb-6 text-left font-light leading-relaxed">
          Enter the email address associated with your account to receive instructions.
        </p>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-xs mb-4 font-medium">
              {error}
            </div>
          )}

          <label
            htmlFor="forgot-email"
            className="text-sm font-bold mb-1 text-[#000000]"
          >
            Email address
          </label>
          <input
            type="email"
            id="forgot-email"
            placeholder="account@ipn.mx"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="bg-[#f7f7f7] border-none rounded-lg h-[30px] text-base p-4 mb-3 focus:outline-none focus:ring-1 focus:ring-[#acd982] disabled:opacity-50"
          />

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#acd982] hover:bg-[#9bc771] text-white w-full h-[50px] rounded-lg font-bold text-base cursor-pointer transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

import React from "react";

interface EmailSentProps {
  onNavigateToLogin: () => void;
}

export const EmailSent: React.FC<EmailSentProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-white p-4 relative">
      <div className="w-full max-w-[300px] flex flex-col items-center">
        {/* Logo (Solo visible en Mobile, hidden en Desktop sm) */}
        <img
          src="/Platzi_YardSale_Logos/logo_yard_sale.svg"
          alt="Yard Sale Logo"
          className="w-[150px] mb-12 block sm:hidden"
        />

        <h1 className="text-lg font-bold mb-3 text-center text-[#000000]">
          Email has been sent
        </h1>

        <p className="text-[#c7c7c7] text-base font-light mb-8 mt-0 text-center">
          Please check your inbox for instruction on how to reset your password
        </p>

        <div className="w-[132px] h-[132px] rounded-full bg-[#f7f7f7] flex justify-center items-center mb-6">
          <img
            src="/Platzi_YardSale_Icons/email.svg"
            alt="Yard Sale mail"
            className="w-[80px]"
          />
        </div>

        {/* Botón Primario que regresa al Login */}
        <button
          onClick={onNavigateToLogin}
          className="bg-[#acd982] hover:bg-[#9bc771] text-white w-full h-[50px] rounded-lg font-bold text-base cursor-pointer mt-3.5 mb-[30px] transition-colors shadow-sm"
        >
          Back to login
        </button>

        <p className="text-sm text-center">
          <span className="text-[#c7c7c7]">Didn't receive the email? </span>
          <a
            href="/"
            onClick={(e) => e.preventDefault()}
            className="text-[#acd982] hover:text-[#9bc771] no-underline"
          >
            Resend
          </a>
        </p>
      </div>
    </div>
  );
};

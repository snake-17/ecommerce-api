import React, { useState } from "react";

import { ordersApi } from "../utils/api";

interface CheckoutPaymentSimulationProps {
  token: string | null;
  orderId: number;
  orderTotal: number;
  onPaymentSuccess: () => void;
  onCancelSuccess: (message: string) => void;
}

export const CheckoutPaymentSimulation: React.FC<CheckoutPaymentSimulationProps> = ({
  token,
  orderId,
  orderTotal,
  onPaymentSuccess,
  onCancelSuccess,
}) => {
  // Form values
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

  // States
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form input formatting handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    // Chunk into 4 digits
    const formatted = rawVal.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted.slice(0, 19)); // 16 digits + 3 spaces
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    let formatted = rawVal;
    if (rawVal.length > 2) {
      formatted = `${rawVal.slice(0, 2)}/${rawVal.slice(2, 4)}`;
    }
    setCardExpiry(formatted.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setCardCvv(rawVal.slice(0, 4));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCardName(rawVal.toUpperCase());
  };

  // Luhn algorithm check
  const validateLuhn = (num: string): boolean => {
    const digits = num.replace(/\s/g, "");
    if (digits.length !== 16) return false;
    
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Expiry date parse validation
  const validateExpiry = (expiry: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (month < 1 || month > 12) return false;

    // Get current date parts
    const currentYear = new Date().getFullYear() % 100; // e.g. 26
    const currentMonth = new Date().getMonth() + 1; // 1-12

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  // Overall form validity check
  const isFormValid = (): boolean => {
    const plainNumber = cardNumber.replace(/\s/g, "");
    const isNumValid = plainNumber.length === 16 && validateLuhn(cardNumber);
    const isNameValid = cardName.trim().length >= 3;
    const isExpValid = validateExpiry(cardExpiry);
    const isCvvValid = cardCvv.length === 3 || cardCvv.length === 4;

    return isNumValid && isNameValid && isExpValid && isCvvValid;
  };

  // Pay Action
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !token) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Fire Pay endpoint
      await ordersApi.payOrder(token, orderId);

      // Trigger beautiful local success overlay
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to process transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Action
  const handleCancel = async () => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Fire Cancel endpoint
      await ordersApi.cancelOrder(token, orderId);

      // Trigger callback with cancel notification
      onCancelSuccess("Order cancelled successfully, items returned to catalog");
    } catch (err: any) {
      setError(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 relative">
      {/* CSS flip stylesheet inside inline style block */}
      <style>{`
        .payment-card-perspective {
          perspective: 1000px;
        }
        .payment-card-inner {
          transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }
        .payment-card-flipped {
          transform: rotateY(180deg);
        }
        .payment-card-face {
          backface-visibility: hidden;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .payment-card-back {
          transform: rotateY(180deg);
        }
        
        /* Success checkmark keyframes */
        @keyframes draw-circle {
          0% { stroke-dashoffset: 166; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale-checkmark {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes pulse-success {
          0% { box-shadow: 0 0 0 0 rgba(172, 217, 130, 0.5); }
          70% { box-shadow: 0 0 0 15px rgba(172, 217, 130, 0); }
          100% { box-shadow: 0 0 0 0 rgba(172, 217, 130, 0); }
        }
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #acd982;
          fill: none;
          animation: draw-circle 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #fff;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #acd982;
          animation: scale-checkmark .3s ease-in-out .9s both, pulse-success 2s infinite;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: draw-check 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards;
        }
      `}</style>

      {/* Main Payment Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="relative border-b border-gray-100 px-6 py-5 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Checkout Step 2</h2>
            <p className="text-xs text-gray-400 mt-0.5">Order ID: #{orderId} • Total: ${orderTotal.toFixed(2)}</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Cancel transaction"
            disabled={isSubmitting}
          >
            <img
              src="/Platzi_YardSale_Icons/icon_close.png"
              alt="close"
              className="w-3.5 h-3.5 opacity-60"
            />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Section: Virtual Card Graphic Container */}
          <div className="w-full flex justify-center py-2">
            <div className="payment-card-perspective w-full max-w-[340px] h-[200px] relative">
              <div className={`payment-card-inner w-full h-full relative rounded-2xl shadow-2xl ${isFlipped ? "payment-card-flipped" : ""}`}>
                
                {/* CARD FRONT */}
                <div className="payment-card-face rounded-2xl bg-gradient-to-br from-[#202c17] via-[#10170a] to-[#364927] p-6 text-white flex flex-col justify-between overflow-hidden border border-[#acd982]/20">
                  {/* Neon top highlights */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#acd982]/5 blur-3xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    {/* Metal chip graphic */}
                    <svg className="w-10 h-8 rounded" viewBox="0 0 50 38" fill="none">
                      <rect width="50" height="38" rx="5" fill="url(#chip-grad)" />
                      <path d="M0 12H18V19H0V12Z" fill="#1b1b1b" fillOpacity="0.2" />
                      <path d="M0 26H18V33H0V26Z" fill="#1b1b1b" fillOpacity="0.2" />
                      <path d="M32 12H50V19H32V12Z" fill="#1b1b1b" fillOpacity="0.2" />
                      <path d="M32 26H50V33H32V26Z" fill="#1b1b1b" fillOpacity="0.2" />
                      <path d="M18 6H32V12H18V6Z" fill="#1b1b1b" fillOpacity="0.2" />
                      <path d="M18 26H32V32H18V26Z" fill="#1b1b1b" fillOpacity="0.2" />
                      <defs>
                        <linearGradient id="chip-grad" x1="0" y1="0" x2="50" y2="38" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FFE082" />
                          <stop offset="0.5" stopColor="#FFB300" />
                          <stop offset="1" stopColor="#FFA000" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Yard Sale Card Logo */}
                    <div className="text-right">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-[#acd982] block">YARD SALE</span>
                      <span className="text-[9px] text-gray-400 block -mt-1 font-semibold">PREMIUM CARD</span>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="my-4 text-center">
                    <span className="font-['Courier_New'] text-xl sm:text-2xl tracking-[0.18em] font-semibold text-gray-100 shadow-sm block">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </span>
                  </div>

                  {/* Name and Expiry */}
                  <div className="flex justify-between items-end">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] text-[#acd982] font-bold block uppercase tracking-wider mb-0.5">Cardholder</span>
                      <span className="text-xs font-bold font-mono tracking-wider truncate block">
                        {cardName || "CARDHOLDER NAME"}
                      </span>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-[9px] text-[#acd982] font-bold block uppercase tracking-wider mb-0.5">Expires</span>
                      <span className="text-xs font-bold font-mono tracking-wider block">
                        {cardExpiry || "MM/YY"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD BACK */}
                <div className="payment-card-face payment-card-back rounded-2xl bg-[#141b0e] border border-gray-900 text-white flex flex-col justify-between py-6 overflow-hidden">
                  {/* Magnetic Strip */}
                  <div className="w-full h-10 bg-black mt-2" />

                  {/* CVV panel */}
                  <div className="px-6 flex items-center justify-end gap-3">
                    <div className="flex-1 h-9 bg-gray-100 rounded flex justify-end items-center pr-3">
                      <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#ddd,#ddd_10px,#eee_10px,#eee_20px)] rounded" />
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-[#acd982] font-bold block uppercase tracking-wider mb-0.5">CVV</span>
                      <div className="w-12 h-9 bg-white rounded border border-[#acd982] flex items-center justify-center text-gray-900 font-bold font-mono text-sm">
                        {cardCvv || "•••"}
                      </div>
                    </div>
                  </div>

                  {/* Back text */}
                  <div className="px-6 text-[8px] text-gray-500 font-semibold tracking-wide">
                    This simulation is for demonstration purposes. Yard Sale does not save credit card information. Authorized signature required.
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handlePay} className="space-y-4">
            
            {/* Input: Cardholder Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="e.g. JUAN JOSE PEREZ"
                value={cardName}
                onChange={handleNameChange}
                className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] border border-gray-200 text-sm focus:outline-none focus:border-[#acd982] focus:ring-1 focus:ring-[#acd982] transition-all font-semibold uppercase"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Input: Card Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4532 7182 9381 2309"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] border border-gray-200 text-sm focus:outline-none focus:border-[#acd982] focus:ring-1 focus:ring-[#acd982] transition-all font-semibold tracking-wider font-mono"
                  required
                  disabled={isSubmitting}
                />
                {cardNumber.replace(/\s/g, "").length === 16 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold">
                    {validateLuhn(cardNumber) ? (
                      <span className="text-[#acd982]">✓ Valid</span>
                    ) : (
                      <span className="text-red-500">✗ Invalid Luhn</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Row Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] border border-gray-200 text-sm focus:outline-none focus:border-[#acd982] focus:ring-1 focus:ring-[#acd982] transition-all font-semibold font-mono text-center"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  CVV
                </label>
                <input
                  type="password"
                  placeholder="e.g. 123"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  onFocus={() => setIsFlipped(true)}
                  onBlur={() => setIsFlipped(false)}
                  className="w-full h-11 px-4 rounded-xl bg-[#f7f7f7] border border-gray-200 text-sm focus:outline-none focus:border-[#acd982] focus:ring-1 focus:ring-[#acd982] transition-all font-semibold font-mono text-center"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-medium animate-shake">
                {error}
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className={`w-full h-12 rounded-xl text-white font-bold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isSubmitting || !isFormValid()
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-[#acd982] hover:bg-[#9bc771]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay Now (${orderTotal.toFixed(2)})</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl text-red-500 bg-white hover:bg-red-50 font-bold transition-colors text-xs border border-transparent cursor-pointer text-center"
              >
                Cancel Order
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* GORGEOUS SUCCESS BADGE ANIMATION OVERLAY */}
      {showSuccess && (
        <div className="absolute inset-0 bg-white z-50 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="flex flex-col items-center max-w-sm space-y-6">
            
            {/* Pulsing Green Background for Checkmark */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#acd982]/10 rounded-full scale-125 animate-ping" />
              <div className="w-24 h-24 rounded-full bg-[#acd982] flex items-center justify-center shadow-lg relative">
                <svg className="checkmark" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" />
                  <path className="checkmark-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                Order Placed Successfully!
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Thank you for your purchase. Your payment was verified, stock was claimed, and order #{orderId} is now set to PAID.
              </p>
            </div>

            <button
              onClick={onPaymentSuccess}
              className="px-8 h-12 bg-[#acd982] hover:bg-[#9bc771] text-white font-bold rounded-xl transition-colors text-sm shadow-md cursor-pointer inline-flex items-center justify-center w-full"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// src/components/Login.tsx
import React, { useState } from "react";

interface LoginProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLogin,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onLogin({ email, password });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-white relative p-4">
      <div className="w-full max-w-[300px] flex flex-col">
        {/* Logo (Solo visible en Mobile, hidden en Desktop sm) */}
        <img
          src="/Platzi_YardSale_Logos/logo_yard_sale.svg"
          alt="Yard Sale Logo"
          className="w-[150px] mb-12 mx-auto block sm:hidden"
        />

        <form className="flex flex-col" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-xs mb-4 font-medium animate-shake">
              {error}
            </div>
          )}

          <label
            htmlFor="mail"
            className="text-sm font-bold mb-1 text-[#000000]"
          >
            Email account
          </label>
          <input
            type="text"
            id="mail"
            placeholder="account@ipn.mx"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="bg-[#f7f7f7] border-none rounded-lg h-[30px] text-base p-4 mb-3 focus:outline-none focus:ring-1 focus:ring-[#acd982] disabled:opacity-50"
          />

          <label
            htmlFor="password"
            className="text-sm font-bold mb-1 text-[#000000]"
          >
            Enter password
          </label>
          <input
            type="password"
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="bg-[#f7f7f7] border-none rounded-lg h-[30px] text-base p-4 mb-3 focus:outline-none focus:ring-1 focus:ring-[#acd982] disabled:opacity-50"
          />

          {/* Botón Primario */}
          <input
            type="submit"
            value={loading ? "Logging in..." : "Login"}
            disabled={loading}
            className="bg-[#acd982] hover:bg-[#9bc771] text-white w-full h-[50px] rounded-lg font-bold text-base cursor-pointer mt-3.5 mb-[30px] transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          />

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToForgotPassword();
            }}
            className="text-[#acd982] hover:text-[#9bc771] no-underline text-center text-sm mb-[52px]"
          >
            Forgot my password
          </a>
        </form>

        {/* Botón Secundario (Con absolute en mobile para mandarlo al fondo) */}
        <button
          type="button"
          onClick={onNavigateToSignUp}
          disabled={loading}
          className="bg-white border border-[#acd982] text-[#acd982] hover:bg-green-50 w-full sm:w-full h-[50px] rounded-lg font-bold text-base cursor-pointer transition-colors max-sm:absolute max-sm:bottom-6 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[300px] disabled:opacity-50"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

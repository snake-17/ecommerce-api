// src/components/SignUp.tsx
import React, { useState } from "react";

interface SignUpProps {
  onCreateAccount: (credentials: { name: string; email: string; password: string }) => Promise<void>;
}

export const SignUp: React.FC<SignUpProps> = ({ onCreateAccount }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [reEnterPassword, setReEnterPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !reEnterPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== reEnterPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onCreateAccount({ name, email, password });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-white p-4 relative">
      <div className="w-full max-w-[300px] flex flex-col">
        <h1 className="text-lg font-bold mb-6 text-left text-[#000000]">
          Create account
        </h1>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-xs mb-4 font-medium animate-shake">
              {error}
            </div>
          )}

          <label
            htmlFor="name"
            className="text-sm font-bold mb-1 text-[#000000]"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Juan José"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="bg-[#f7f7f7] border-none rounded-lg h-[30px] p-4 text-base mb-[34px] focus:outline-none focus:ring-1 focus:ring-[#acd982] disabled:opacity-50"
          />

          <label
            htmlFor="email"
            className="text-sm font-bold mb-1 text-[#000000]"
          >
            E-mail
          </label>
          <input
            type="text"
            id="email"
            placeholder="alumno@ipn.mx"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="bg-[#f7f7f7] border-none rounded-lg h-[30px] p-4 text-base mb-[34px] focus:outline-none focus:ring-1 focus:ring-[#acd982] disabled:opacity-50"
          />

          <label
            htmlFor="password"
            className="text-sm font-bold mb-1 text-[#000000]"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="bg-[#f7f7f7] border-none rounded-lg h-[30px] p-4 text-base mb-[34px] focus:outline-none focus:ring-1 focus:ring-[#acd982] disabled:opacity-50"
          />

          <label
            htmlFor="re-enter-password"
            className="text-sm font-bold mb-1 text-[#000000]"
          >
            Re-enter password
          </label>
          <input
            type="password"
            id="re-enter-password"
            placeholder="********"
            value={reEnterPassword}
            onChange={(e) => setReEnterPassword(e.target.value)}
            disabled={loading}
            className="bg-[#f7f7f7] border-none rounded-lg h-[30px] p-4 text-base mb-[34px] focus:outline-none focus:ring-1 focus:ring-[#acd982] disabled:opacity-50"
          />

          {/* Botón de Submit (se va al fondo en mobile) */}
          <input
            type="submit"
            value={loading ? "Creating..." : "Create account"}
            disabled={loading}
            className="bg-[#acd982] hover:bg-[#9bc771] text-white w-full h-[50px] rounded-lg font-bold text-base cursor-pointer transition-colors mt-3.5 mb-8 max-sm:absolute max-sm:bottom-6 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[300px] shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </form>
      </div>
    </div>
  );
};

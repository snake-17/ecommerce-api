import React, { useState } from "react";
import { authApi } from "../utils/api";

interface MyAccountProps {
  token: string;
  initialUserData: { name: string; email: string };
  onLogout: () => void;
  onBack: () => void;
}

export const MyAccount: React.FC<MyAccountProps> = ({
  token,
  initialUserData,
  onLogout,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(initialUserData.name);
  const [email, setEmail] = useState<string>(initialUserData.email);
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authApi.editProfile(token, name, email, password);
      onLogout();
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-white">
      <div className="w-[300px] flex flex-col">
        <h1 className="text-lg font-bold mb-8 text-left text-[#000000]">
          My account
        </h1>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col mb-8">
            <label className="text-sm font-bold mb-1 text-[#000000]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing || isLoading}
              className="w-full text-base text-[#000000] disabled:text-[#c7c7c7] bg-transparent border-b border-gray-200 disabled:border-transparent py-1 focus:outline-none focus:border-[#acd982] transition-all"
              required
            />
          </div>

          <div className="flex flex-col mb-8">
            <label className="text-sm font-bold mb-1 text-[#000000]">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing || isLoading}
              className="w-full text-base text-[#000000] disabled:text-[#c7c7c7] bg-transparent border-b border-gray-200 disabled:border-transparent py-1 focus:outline-none focus:border-[#acd982] transition-all"
              required
            />
          </div>

          <div className="flex flex-col mb-12">
            <label className="text-sm font-bold mb-1 text-[#000000]">
              Password
            </label>
            <input
              type="password"
              value={isEditing ? password : ""}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!isEditing || isLoading}
              placeholder="*********"
              className="w-full text-base text-[#000000] disabled:text-[#c7c7c7] bg-transparent border-b border-gray-200 disabled:border-transparent py-1 focus:outline-none focus:border-[#acd982] transition-all"
              required={isEditing}
            />
          </div>

          {/* Botón de Editar / Aceptar */}
          <button
            type={isEditing ? "submit" : "button"}
            onClick={!isEditing ? () => setIsEditing(true) : undefined}
            disabled={isLoading}
            className="w-full h-14 rounded-lg font-bold text-[#acd982] border-2 border-[#acd982] bg-white cursor-pointer hover:bg-green-50 transition-colors mb-4 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : isEditing ? "Accept" : "Edit"}
          </button>

          {/* Botón para volver (Sigue la paleta principal) */}
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="w-full h-14 bg-[#acd982] hover:bg-[#9bc771] text-white font-bold rounded-lg flex justify-center items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to homepage
          </button>
        </form>
      </div>
    </div>
  );
};

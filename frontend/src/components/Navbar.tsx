import React, { useState } from "react";

interface NavbarProps {
  isLoggedIn: boolean;
  onToggleCart: () => void;
  onNavigate: (
    view: "HOME" | "ACCOUNT" | "ORDERS" | "LOGIN" | "SIGNUP",
  ) => void;
  cartCount: number;
  onLogout: () => void;
  userEmail?: string;
  userName?: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  onToggleCart,
  onNavigate,
  cartCount,
  onLogout,
  userEmail = "alumno@ipn.mx",
  userName = "",
  selectedCategory,
  setSelectedCategory,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const categories = [
    "All",
    "Clothes",
    "Electronics",
    "Furnitures",
    "Toys",
    "Others",
  ];

  const handleNavigation = (
    view: "HOME" | "ACCOUNT" | "ORDERS" | "LOGIN" | "SIGNUP",
  ) => {
    onNavigate(view);
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="flex w-full h-[60px] justify-between items-center px-4 border-b border-[#c7c7c7] bg-white sticky top-0 z-30">
      <img
        src="/Platzi_YardSale_Icons/icon_menu.svg"
        alt="menu"
        className="block sm:hidden cursor-pointer"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex items-center">
        <img
          src="/Platzi_YardSale_Logos/logo_yard_sale.svg"
          alt="logo"
          className="w-[100px] cursor-pointer"
          onClick={() => handleNavigation("HOME")}
        />
        <ul className="hidden sm:flex items-center ml-3 space-x-1">
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  handleNavigation("HOME");
                }}
                className={`border p-2 rounded-lg transition-colors text-sm cursor-pointer ${
                  selectedCategory === category
                    ? "border-[#acd982] text-[#acd982] font-bold bg-[#acd982]/10"
                    : "text-[#c7c7c7] border-transparent hover:border-[#acd982] hover:text-[#acd982] font-medium"
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center">
        <ul className="flex items-center">
          {/* ESCRITORIO: Renderizado condicional */}
          <li className="relative hidden sm:block mr-4">
            {isLoggedIn ? (
              // Si ESTÁ logueado, mostramos el menú desplegable
              <>
                <div
                  className="text-[#c7c7c7] text-sm font-medium hover:text-[#acd982] transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {userName || userEmail}
                  <svg
                    className={`inline-block w-4 h-4 ml-1 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isMenuOpen && (
                  <div className="absolute right-0 top-8 w-32 bg-white border border-[#c7c7c7] rounded-lg shadow-lg p-5 z-40">
                    <ul className="list-none p-0 m-0 flex flex-col text-right">
                      <li className="mb-4">
                        <button
                          onClick={() => handleNavigation("ORDERS")}
                          className="inline-block no-underline text-[#000000] font-bold text-sm hover:text-[#acd982] transition-colors"
                        >
                          My orders
                        </button>
                      </li>
                      <li className="mb-4">
                        <button
                          onClick={() => handleNavigation("ACCOUNT")}
                          className="inline-block no-underline text-[#000000] font-bold text-sm hover:text-[#acd982] transition-colors"
                        >
                          My account
                        </button>
                      </li>
                      <li className="pt-4 border-t border-[#c7c7c7]">
                        <button
                          onClick={handleLogoutClick}
                          className="inline-block no-underline text-[#acd982] font-bold text-sm hover:text-[#9bc771] transition-colors cursor-pointer"
                        >
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              // Si NO está logueado, mostramos botón de Sign In
              <button
                onClick={() => handleNavigation("LOGIN")}
                className="text-[#c7c7c7] text-sm font-bold hover:text-[#acd982] transition-colors cursor-pointer"
              >
                Sign in
              </button>
            )}
          </li>

          <li
            onClick={onToggleCart}
            className="relative cursor-pointer hover:scale-105 transition-transform"
          >
            <img
              src="/Platzi_YardSale_Icons/icon_shopping_cart.svg"
              alt="cart"
              className="w-6 h-6"
            />
            {cartCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#acd982] text-[10px] font-bold text-white flex justify-center items-center animate-[pulse_1s_infinite]">
                {cartCount}
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* MENÚ MÓVIL (Full Screen) */}
      {isMobileMenuOpen && (
        <div className="absolute top-[60px] left-0 w-full h-[calc(100vh-60px)] bg-white z-40 p-6 flex flex-col justify-between sm:hidden">
          <div>
            <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-6">
              <li>
                <span className="font-bold text-base text-[#000000]">
                  CATEGORIES
                </span>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      handleNavigation("HOME");
                    }}
                    className={`font-bold text-base hover:text-[#acd982] text-left w-full transition-colors ${
                      selectedCategory === category
                        ? "text-[#acd982]"
                        : "text-[#000000]"
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>

            {/* Ocultamos las rutas privadas si no está logueado */}
            {isLoggedIn && (
              <ul className="list-none p-0 m-0 flex flex-col gap-6">
                <li>
                  <button
                    onClick={() => handleNavigation("ORDERS")}
                    className="font-bold text-base text-[#000000] hover:text-[#acd982]"
                  >
                    My orders
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("ACCOUNT")}
                    className="font-bold text-base text-[#000000] hover:text-[#acd982]"
                  >
                    My account
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* MÓVIL: Renderizado Condicional Inferior */}
          <ul className="list-none p-0 m-0 flex flex-col gap-6">
            {isLoggedIn ? (
              <>
                <li>
                  <span className="text-sm text-[#c7c7c7] font-medium">
                    {userName || userEmail}
                  </span>
                </li>
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className="font-bold text-sm text-[#acd982] hover:text-[#9bc771] cursor-pointer"
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => handleNavigation("LOGIN")}
                    className="font-bold text-base text-[#acd982] hover:text-[#9bc771]"
                  >
                    Sign in
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("SIGNUP")}
                    className="font-bold text-sm text-[#c7c7c7] hover:text-[#acd982]"
                  >
                    Sign up
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

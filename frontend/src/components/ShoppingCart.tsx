import React, { useState } from "react";
import type { CartItem } from "../App";
import { ordersApi } from "../utils/api";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string | number) => void;
  token: string | null;
  onCheckoutStart: (orderId: number) => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  token,
  onCheckoutStart,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCheckoutClick = async () => {
    if (!token) {
      setError("Please log in to check out.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Calls POST /api/order/
      const res = await ordersApi.createOrder(token);
      onCheckoutStart(res.orden);
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop oscuro */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel del carrito */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-[360px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } p-6 box-border`}
      >
        {/* Título y botón de cerrar (flechita) */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src="/Platzi_YardSale_Icons/flechita.svg"
            alt="arrow"
            onClick={onClose}
            className="w-4 h-4 transform rotate-180 cursor-pointer hover:scale-110 transition-transform"
          />
          <p className="font-bold text-lg m-0 text-[#000000]">My order</p>
        </div>

        {/* Lista de productos en el carrito */}
        <div className="flex-1 overflow-y-auto pr-2">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[70px_1fr_auto_auto] gap-4 items-center mb-6 animate-fadeIn"
            >
              <figure className="m-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[70px] h-[70px] rounded-[20px] object-cover"
                />
              </figure>
              <p className="text-[#c7c7c7] text-sm m-0">{item.name}</p>
              <p className="font-bold text-base m-0">
                ${item.price.toFixed(2)}
              </p>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="cursor-pointer hover:scale-110 active:scale-95 transition-transform p-1"
                aria-label="Remove item"
              >
                <img
                  src="/Platzi_YardSale_Icons/icon_close.png"
                  alt="close"
                  className="w-3 h-3"
                />
              </button>
            </div>
          ))}
          {cartItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-[#c7c7c7] text-center">
              <img
                src="/Platzi_YardSale_Icons/icon_shopping_cart.svg"
                alt="empty cart"
                className="w-16 h-16 opacity-30 mb-4"
              />
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Resumen y botón de Checkout */}
        <div className="mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2.5 text-xs mb-3 font-semibold text-center animate-shake">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-lg mb-4">
            <p className="m-0 font-bold text-base">
              <span>Total</span>
            </p>
            <p className="m-0 font-bold text-base">
              <span>${total.toFixed(2)}</span>
            </p>
          </div>

          <button
            onClick={handleCheckoutClick}
            disabled={cartItems.length === 0 || loading}
            className={`w-full h-14 font-bold rounded-lg text-base transition-all shadow-md flex items-center justify-center gap-2 ${
              cartItems.length === 0 || loading
                ? "bg-[#c7c7c7] text-white cursor-not-allowed"
                : "bg-[#acd982] hover:bg-[#9bc771] text-white cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <span>Checkout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};


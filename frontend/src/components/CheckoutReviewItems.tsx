import React, { useEffect, useState } from "react";
import type { CartItem } from "../App";
import { productsApi, ordersApi } from "../utils/api";

interface CheckoutReviewItemsProps {
  token: string | null;
  cartItems: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveItem: (id: string | number) => void;
  onNext: () => void;
  onCancel: () => void;
  orderId: number;
}

export const CheckoutReviewItems: React.FC<CheckoutReviewItemsProps> = ({
  token,
  cartItems,
  onAddToCart,
  onRemoveItem,
  onNext,
  onCancel,
  orderId,
}) => {
  const [recommendations, setRecommendations] = useState<CartItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products and select 3-4 random ones for recommendation
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) return;
      try {
        setLoadingRecs(true);
        const data = await productsApi.getProducts(token);
        
        // Map backend products to CartItem interface
        const mapped: CartItem[] = data.map((item) => ({
          id: String(item.id),
          name: item.name,
          price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
          image: item.img,
          category: item.category,
        }));

        // Filter out items already in the cart to recommend new items
        const inCartIds = new Set(cartItems.map((item) => String(item.id)));
        const available = mapped.filter((item) => !inCartIds.has(String(item.id)));


        // If not enough items outside cart, just use mapped
        const pool = available.length >= 3 ? available : mapped;

        // Shuffle and pick 3 or 4
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, 4));
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [token]); // Run once on mount, or if token changes

  // Group cart items to display with quantities
  const groupedItems = cartItems.reduce((acc, item) => {
    const key = String(item.id);
    if (!acc[key]) {
      acc[key] = {
        item,
        quantity: 0,
      };
    }
    acc[key].quantity += 1;
    return acc;
  }, {} as Record<string, { item: CartItem; quantity: number }>);

  const groupedList = Object.values(groupedItems);
  const orderTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleNextStep = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }
    if (!token) {
      setError("You must be logged in to proceed.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Build parameters: [{ productId, quantity }]
      const itemsPayload = Object.entries(groupedItems).map(([id, group]) => ({
        productId: Number(id),
        quantity: group.quantity,
      }));

      // Call API to add items & reserve stock
      await ordersApi.addItems(token, orderId, itemsPayload);

      // Proceed to Step 2
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to reserve stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Checkout Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="relative border-b border-gray-100 px-6 py-5 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Checkout Step 1</h2>
            <p className="text-xs text-gray-400 mt-0.5">Order ID: #{orderId}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Dismiss checkout"
          >
            <img
              src="/Platzi_YardSale_Icons/icon_close.png"
              alt="close"
              className="w-3.5 h-3.5 opacity-60"
            />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section: Review Items */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
              Review Your Items
            </h3>
            
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {groupedList.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border border-gray-100 p-3 rounded-2xl bg-white hover:border-[#acd982]/50 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ${item.price.toFixed(2)} x {quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${(item.price * quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-500 text-gray-400 text-xs transition-colors"
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onAddToCart(item)}
                        className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#acd982] hover:text-[#acd982] text-gray-400 text-xs transition-colors"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {groupedList.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No items in cart. Add products to get started.
                </p>
              )}
            </div>
          </div>

          {/* Section: Dynamic Recommendations Grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
              Add More Items
            </h3>
            
            {loadingRecs ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-50 border border-gray-100 rounded-2xl p-3 h-[72px]"
                  />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center gap-3 border border-gray-100 p-2.5 rounded-2xl hover:bg-gray-50/50 transition-colors group relative"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-xs font-bold text-gray-800 truncate">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-[#acd982] font-bold mt-0.5">
                        ${prod.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onAddToCart(prod)}
                      className="absolute right-2.5 w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border border-green-100 hover:bg-[#acd982]/10 transition-colors group-hover:scale-105 active:scale-95"
                      title="Add to order"
                    >
                      <img
                        src="/Platzi_YardSale_Icons/bt_add_to_cart.svg"
                        alt="add"
                        className="w-4 h-4"
                      />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No recommended items found.</p>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Summary Details */}
          <div className="flex justify-between items-center bg-[#f7f7f7] px-5 py-4 rounded-2xl">
            <span className="font-bold text-gray-700">Total</span>
            <span className="font-bold text-lg text-gray-900">
              ${orderTotal.toFixed(2)}
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl text-gray-500 bg-gray-50 hover:bg-gray-100 font-bold transition-colors text-sm border border-gray-200 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleNextStep}
              disabled={isSubmitting || cartItems.length === 0}
              className={`flex-1 h-12 rounded-xl text-white font-bold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isSubmitting || cartItems.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#acd982] hover:bg-[#9bc771]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Reserving stock...</span>
                </>
              ) : (
                <span>Next (Payment)</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

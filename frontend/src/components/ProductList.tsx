import React, { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import type { CartItem } from "../App";
import { productsApi } from "../utils/api";
import type { ApiProduct } from "../utils/api";

interface ProductListProps {
  token: string | null;
  onAddToCart: (item: CartItem) => void;
  selectedCategory: string;
}



export const ProductList: React.FC<ProductListProps> = ({
  token,
  onAddToCart,
  selectedCategory,
}) => {
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<"low-to-high" | "high-to-low" | null>(null);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!token) {
        setError("User token not found. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data: ApiProduct[] = await productsApi.getProducts(token);
        if (active) {
          // Map backend items to frontend CartItem structures
          const mappedItems: CartItem[] = data.map((item) => ({
            id: String(item.id),
            name: item.name,
            price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
            image: item.img,
            category: item.category,
          }));
          setProducts(mappedItems);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to fetch products from server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [token]);

  const toggleMenu = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSortSelection = (order: "low-to-high" | "high-to-low") => {
    setSortBy(order);
    setIsDropdownOpen(false);
  };

  // Perform category filter
  const categoryFiltered = products.filter((product) => {
    if (selectedCategory === "All") return true;
    return product.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Perform search filter
  const filteredProducts = categoryFiltered.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Perform price sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low-to-high") {
      return a.price - b.price;
    }
    if (sortBy === "high-to-low") {
      return b.price - a.price;
    }
    return 0;
  });

  if (loading) {
    return (
      <section className="w-full mt-6 mb-10 px-4 flex flex-col items-center justify-center min-h-[300px]">
        {/* Simple elegant CSS spinner */}
        <div className="w-12 h-12 border-4 border-[#acd982]/20 border-t-[#acd982] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium text-sm">Loading catalog...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full mt-6 mb-10 px-4 flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center max-w-md">
          <svg
            className="w-10 h-10 mx-auto text-red-500 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="font-bold text-base mb-1 text-red-800">Unable to load catalog</p>
          <p className="text-sm text-red-600/85 mb-4 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mt-6 mb-10 px-4">
      {/* Contenedor de Controles */}
      <div className="max-w-[1044px] mx-auto flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center mb-6">
        <div className="hidden sm:block" />

        {/* Controles: Buscador y Filtro */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end relative">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[240px] h-10 px-4 rounded-lg bg-[#f7f7f7] border border-[#c7c7c7] text-sm focus:outline-none focus:border-[#acd982] transition-colors"
          />

          <div className="relative">
            <button
              onClick={toggleMenu}
              className="h-10 px-4 flex items-center gap-2 bg-white border border-[#c7c7c7] rounded-lg text-sm text-[#000000] font-medium hover:border-[#acd982] transition-colors whitespace-nowrap"
            >
              <span>
                {sortBy === "low-to-high"
                  ? "Price: Low to High"
                  : sortBy === "high-to-low"
                    ? "Price: High to Low"
                    : "Order by"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
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
            </button>

            {isDropdownOpen && (
              <ul className="absolute right-0 mt-2 w-48 bg-white border border-[#c7c7c7] rounded-lg shadow-lg z-10 py-1 overflow-hidden animate-fadeIn">
                <li>
                  <button
                    onClick={() => handleSortSelection("low-to-high")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === "low-to-high" ? "bg-[#acd982]/10 text-[#acd982] font-bold" : "text-[#000000] hover:bg-[#f7f7f7] hover:text-[#acd982]"}`}
                  >
                    Price: Low to High
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSortSelection("high-to-low")}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === "high-to-low" ? "bg-[#acd982]/10 text-[#acd982] font-bold" : "text-[#000000] hover:bg-[#f7f7f7] hover:text-[#acd982]"}`}
                  >
                    Price: High to Low
                  </button>
                </li>
                {sortBy && (
                  <li className="border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSortBy(null);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-[#f7f7f7] hover:text-red-500 transition-colors"
                    >
                      Clear Sorting
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      {sortedProducts.length > 0 ? (
        <div className="max-w-[1044px] mx-auto grid grid-cols-[repeat(auto-fill,140px)] sm:grid-cols-[repeat(auto-fill,240px)] gap-6 sm:gap-7 justify-center">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={String(product.id)}
              price={product.price}
              title={product.name}
              image={product.image}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="w-full text-center py-16 text-gray-400">
          No products matched your search. Try another query!
        </div>
      )}
    </section>
  );
};

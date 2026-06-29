import React from "react";
import type { CartItem } from "../App";

interface ProductDetailProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    price: number;
    title: string;
    image: string;
  };
  onAddToCart: (item: CartItem) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Aside Barrido Lateral */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-[360px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex justify-center items-center cursor-pointer shadow-md hover:scale-105 transition-transform z-10"
        >
          <img
            src="/Platzi_YardSale_Icons/icon_close.png"
            alt="close"
            className="w-3 h-3"
          />
        </div>

        <img
          src={product.image}
          alt={product.title}
          className="w-full h-[360px] object-cover rounded-b-[20px]"
        />

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <p className="font-bold text-lg text-[#000000] m-0">
              ${product.price.toFixed(2)} MXN
            </p>
            <p className="text-base text-[#c7c7c7] font-medium m-0">
              {product.title}
            </p>
            <p className="text-sm text-[#c7c7c7] leading-relaxed mt-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam
              reprehenderit laudantium, beatae ratione ab tempore explicabo!
              Doloremque nesciunt dolorem molestiae.
            </p>
          </div>

          <button
            onClick={() => {
              onAddToCart({
                id: product.id,
                name: product.title,
                price: product.price,
                image: product.image,
              });
              onClose();
            }}
            className="w-full h-14 bg-[#acd982] hover:bg-[#9bc771] text-white font-bold rounded-lg flex justify-center items-center gap-3 transition-colors text-base shadow-md cursor-pointer"
          >
            <img
              src="/Platzi_YardSale_Icons/bt_add_to_cart.svg"
              alt="add to cart"
              className="w-6 h-6 brightness-0 invert"
            />
            Add to cart
          </button>
        </div>
      </aside>
    </>
  );
};

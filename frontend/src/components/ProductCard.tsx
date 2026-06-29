import React, { useState } from "react";
import { ProductDetail } from "./ProductDetail";
import type { CartItem } from "../App";

interface ProductCardProps {
  id: string;
  price: number;
  title: string;
  image: string;
  onAddToCart: (item: CartItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  price,
  title,
  image,
  onAddToCart,
}) => {
  // El estado de apertura del detalle ahora vive dentro de cada tarjeta
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  return (
    <>
      <div className="w-[140px] sm:w-[240px]">
        <img
          src={image}
          alt={title}
          className="w-full h-[140px] sm:h-[240px] rounded-[20px] object-cover"
        />
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="font-bold text-base mt-0 mb-1">
              ${price.toFixed(2)} MXN
            </p>
            <p className="text-sm text-[#c7c7c7] m-0">{title}</p>
          </div>

          {/* AQUÍ colocamos la acción de abrir al hacer clic en el icono verde */}
          <figure
            onClick={() => setIsDetailOpen(true)}
            className="m-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          >
            <img
              src="/Platzi_YardSale_Icons/bt_add_to_cart.svg"
              alt="Add to cart"
              className="w-[30px] h-[30px]"
            />
          </figure>
        </div>
      </div>

      {/* El componente del detalle se renderiza aquí y recibe los datos dinámicos */}
      <ProductDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={{ id, price, title, image }}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

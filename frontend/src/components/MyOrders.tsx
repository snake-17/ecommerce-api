import React from "react";

interface MyOrdersProps {
  onBack: () => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ onBack }) => {
  // Datos simulados de órdenes pasadas
  const orders = [
    { id: 1, date: "04.11.2023", articles: 6, total: 560.0 },
    { id: 2, date: "12.08.2023", articles: 2, total: 120.0 },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-white py-10">
      <div className="w-full max-w-sm px-4">
        <h1 className="text-lg font-bold mb-8 text-[#000000]">My orders</h1>

        <div className="flex flex-col gap-4 mb-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex justify-between items-center p-4 bg-[#f7f7f7] rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#000000]">
                  {order.date}
                </span>
                <span className="text-sm text-[#c7c7c7]">
                  {order.articles} articles
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-base text-[#000000]">
                  ${order.total.toFixed(2)}
                </span>
                <img
                  src="/Platzi_YardSale_Icons/flechita.svg"
                  alt="arrow"
                  className="w-3 h-3 transform -rotate-90"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botón para volver */}
        <button
          onClick={onBack}
          className="w-full h-14 bg-[#acd982] hover:bg-[#9bc771] text-white font-bold rounded-lg flex justify-center items-center transition-colors shadow-sm"
        >
          Back to homepage
        </button>
      </div>
    </div>
  );
};

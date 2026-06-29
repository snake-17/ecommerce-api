import React from "react";

interface HeroHomeProps {
  onExplore: () => void;
}

interface PreviewItem {
  id: string;
  title: string;
  price: number;
  image: string;
}

const PREVIEW_ITEMS: PreviewItem[] = [
  {
    id: "p1",
    title: "Retro Winter Jacket",
    price: 89.99,
    image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
  },
  {
    id: "p2",
    title: "Vintage Gaming Console",
    price: 159.0,
    image: "https://images.pexels.com/photos/35188/child-childrens-hands-play-station-joystick.jpg",
  },
  {
    id: "p3",
    title: "Handmade Oak Coffee Table",
    price: 240.0,
    image: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg",
  },
  {
    id: "p4",
    title: "Limited Edition Toy Robot",
    price: 45.5,
    image: "https://images.pexels.com/photos/1688667/pexels-photo-1688667.jpeg",
  },
];

export const HeroHome: React.FC<HeroHomeProps> = ({ onExplore }) => {
  return (
    <div className="w-full flex-1 flex flex-col items-center bg-white px-4 py-12 sm:py-16">
      {/* Hero Header Section */}
      <div className="max-w-3xl text-center flex flex-col items-center mb-12 sm:mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-[#acd982] border border-green-100 mb-6 animate-pulse">
          Welcome to Yard Sale
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#000000] mb-6 max-w-2xl leading-tight">
          Find the best deals on <span className="text-[#acd982]">unique items</span> nearby.
        </h1>
        <p className="text-base text-gray-500 max-w-xl leading-relaxed mb-8 px-2">
          An exclusive digital garage sale for your community. Outfits, high-end electronics, hand-crafted furniture, and more. Log in now to unlock our complete verified catalog.
        </p>
        <button
          onClick={onExplore}
          className="bg-[#acd982] hover:bg-[#9bc771] text-white px-8 py-4 rounded-xl font-bold text-base shadow-sm hover:shadow transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          Explore Catalog Now
        </button>
      </div>

      {/* Blurred Preview Grid Container */}
      <div className="w-full max-w-[1044px] relative bg-gray-50/50 rounded-3xl p-6 sm:p-8 border border-[#f0f0f0] overflow-hidden">
        {/* Absolute locked content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/30 backdrop-blur-[3px] z-10 p-4 text-center">
          <div className="bg-white/95 border border-gray-100 p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-[320px] transition-transform duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-green-50 text-[#acd982] rounded-full flex justify-center items-center mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="font-bold text-base text-[#000000] mb-2">Locked Content</p>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Sign in to view product descriptions, active availability, and buy items.
            </p>
            <button
              onClick={onExplore}
              className="w-full py-2.5 bg-[#acd982] hover:bg-[#9bc771] text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
            >
              Sign in to unlock
            </button>
          </div>
        </div>

        {/* Blurred product grid */}
        <div className="grid grid-cols-[repeat(auto-fill,140px)] sm:grid-cols-[repeat(auto-fill,240px)] gap-6 sm:gap-7 justify-center filter blur-md select-none pointer-events-none opacity-60">
          {PREVIEW_ITEMS.map((item) => (
            <div key={item.id} className="w-[140px] sm:w-[240px]">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[140px] sm:h-[240px] rounded-[20px] object-cover"
              />
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="font-bold text-base mt-0 mb-1">
                    ${item.price.toFixed(2)} MXN
                  </p>
                  <p className="text-sm text-[#c7c7c7] m-0">{item.title}</p>
                </div>
                <figure className="m-0">
                  <img
                    src="/Platzi_YardSale_Icons/bt_add_to_cart.svg"
                    alt="Add to cart"
                    className="w-[30px] h-[30px]"
                  />
                </figure>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

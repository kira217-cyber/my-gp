import React from "react";
import { useNavigate } from "react-router";
import { Flame } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import Sports from "../Sports/Sports";

const HotsGame = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const providerLogo =
    "https://images.6492394993.com//TCG_PROD_IMAGES/RNG_LIST_VENDOR/JL-COLOR.png";

  const games = [
    {
      id: 1,
      name: "Fortune Gems",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//49.png",
    },
    {
      id: 2,
      name: "Super Ace",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//27.png",
    },
    {
      id: 3,
      name: "Boxing King",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//144.png",
    },
    {
      id: 4,
      name: "Crazy Seven",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//409.png",
    },
    {
      id: 5,
      name: "Fortune Gems",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//302.png",
    },
    {
      id: 6,
      name: "Super Ace",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//116.png",
    },
    {
      id: 7,
      name: "Boxing King",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//26.png",
    },
    {
      id: 8,
      name: "Crazy Seven",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//82.png",
    },
    {
      id: 9,
      name: "Fortune Gems",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//191.png",
    },
    {
      id: 10,
      name: "Super Ace",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//58.png",
    },
    {
      id: 11,
      name: "Boxing King",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//233.png",
    },
    {
      id: 12,
      name: "Crazy Seven",
      image:
        "https://img.capalangresource.com/images/public/images/games/jilis//182.png",
    },
  ];

  const text = {
    title: isBangla ? "গরম খেলা" : "Hot Games",
    total: isBangla ? `মোট-${games.length}` : `TOTAL-${games.length}`,
    seeAll: isBangla ? "সব দেখুন" : "See All",
  };

  return (
    <>
      <Sports />
      <div className="w-full px-2 py-2">
        <div className="overflow-hidden rounded-[6px] bg-white">
          {/* Header */}
          <div className="flex items-stretch gap-[6px]">
            <div className="relative flex h-[44px] flex-1 items-center bg-gradient-to-r from-[#ff5a1f] to-[#ff8c1a] pl-3 pr-6">
              <div
                className="absolute right-0 top-0 h-full w-5 bg-white"
                style={{
                  clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                }}
              />

              <div className="mr-2 flex h-[24px] w-[24px] items-center justify-center text-white">
                <Flame className="h-[20px] w-[20px] fill-white text-white" />
              </div>

              <h2 className="truncate text-[22px] font-extrabold text-white">
                {text.title}
              </h2>
            </div>

            <div className="relative flex h-[44px] min-w-[110px] items-center justify-center bg-gradient-to-r from-[#ff5a1f] to-[#ffb01f] px-4">
              <div
                className="absolute left-0 top-0 h-full w-5 bg-white"
                style={{
                  clipPath: "polygon(0 0, 0 100%, 100% 0)",
                }}
              />
              <span className="text-[18px] font-extrabold text-white">
                {text.total}
              </span>
            </div>
          </div>

          {/* Game Grid */}
          <div className="mt-1 grid grid-cols-4 gap-2 bg-white px-1 pb-2 pt-1">
            {games.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => console.log("Game clicked:", game.name)}
                className="cursor-pointer overflow-hidden rounded-[6px] bg-white transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <div className="overflow-hidden rounded-t-[6px]">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="h-[92px] w-full object-cover"
                  />
                </div>

                <div className="flex h-[30px] items-center justify-center bg-[#2f79c9] px-1">
                  <img
                    src={providerLogo}
                    alt="JILI"
                    className="h-[20px] w-auto object-contain"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* See All */}
          <div className="px-2 pb-2 flex justify-center mt-2">
            <button
              type="button"
              onClick={() => navigate("/games")}
              className="w-20 cursor-pointer rounded-full bg-[#1f5f98] py-1 text-sm text-white transition hover:bg-[#184d7d]"
            >
              {text.seeAll}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HotsGame;

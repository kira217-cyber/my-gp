import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";


const Sports = () => {
  const { isBangla } = useLanguage();

  const sportsList = [
    {
      id: 1,
      name: "Lucky Sports",
      icon: "https://api.1onebet.com/uploads/1776365326725-68768726.png",
    },
    {
      id: 2,
      name: "Saba Sports",
      icon: "https://api.1onebet.com/uploads/1776365458206-833625691.png",
    },
    {
      id: 3,
      name: "VELKI",
      icon: "https://api.1onebet.com/uploads/1776365483058-616453906.png",
    },
    {
      id: 4,
      name: "9wicket",
      icon: "https://api.1onebet.com/uploads/1776365379309-698354557.png",
    },
  ];

  const text = {
    title: isBangla ? "জনপ্রিয় স্পোর্টস" : "Popular Sports",
    matches: isBangla ? "ম্যাচ-০৪" : "Match-04",
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-stretch gap-[6px]">
          {/* Left */}
          <div className="relative flex h-[44px] flex-[1.25] items-center bg-[#f56b1f] pl-3 pr-6">
            <div
              className="absolute right-0 top-0 h-full w-5 bg-white"
              style={{
                clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
              }}
            />

            <div className="mr-2 flex h-[32px] w-[32px] items-center justify-center rounded-sm bg-white/20">
              <img
                src="https://api.1onebet.com/uploads/sports/1776360641203-402926125.svg"
                alt="sports"
                className="h-[32px] w-[32px] object-contain brightness-0 invert"
              />
            </div>

            <h2 className="truncate text-[22px] font-extrabold text-white">
              {text.title}
            </h2>
          </div>

          {/* Right */}
          <div className="relative flex h-[44px] min-w-[118px] items-center justify-center bg-[#f56b1f] px-4">
            <div
              className="absolute left-0 top-0 h-full w-5 bg-white"
              style={{
                clipPath: "polygon(0 0, 0 100%, 100% 0)",
              }}
            />
            <span className="text-[18px] font-extrabold text-white">
              {text.matches}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-1 grid grid-cols-4 gap-2 bg-white px-1 pb-1 pt-1">
          {sportsList.map((item) => (
            <button
              key={item.id}
              type="button"
              className="cursor-pointer overflow-hidden rounded-[6px] border border-[#d59b72] bg-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              <div className="flex h-[80px] items-center justify-center bg-[#fffdf8] px-2">
                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[10px] border border-[#d8d8d8] bg-white shadow-sm">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="h-[60px] w-[60px] object-contain"
                  />
                </div>
              </div>

              <div className="bg-[#3f87d4] px-1 py-2">
                <p className="truncate text-center text-[11px] font-bold leading-none text-white">
                  {item.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sports;

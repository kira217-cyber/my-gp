import React, { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import Sports from "../Sports/Sports";
import HotsGame from "../HotsGame/HotsGame";
import Slider from "../Slider/Slider";

const Categories = () => {
  const { isBangla } = useLanguage();
  const scrollRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("hot");

  const categories = useMemo(
    () => [
      {
        key: "hot",
        label: isBangla ? "জনপ্রিয় গেম" : "Hot Games",
        icon: "https://melbets.live/fire-flame.gif",
      },
      {
        key: "casino",
        label: isBangla ? "ক্যাসিনো" : "Casino",
        icon: "https://api.1onebet.com/uploads/1776366139409-121059665.png",
      },
      {
        key: "slots",
        label: isBangla ? "স্লটস" : "Slots",
        icon: "https://api.1onebet.com/uploads/1776365827855-559530296.png",
      },
      {
        key: "fishing",
        label: isBangla ? "মাছ ধরা" : "Fishing",
        icon: "https://api.1onebet.com/uploads/1776359748419-805933936.svg",
      },
      {
        key: "sports",
        label: isBangla ? "স্পোর্টস" : "Sports",
        icon: "https://api.1onebet.com/uploads/sports/1776360641203-402926125.svg",
      },
      {
        key: "crash",
        label: isBangla ? "ক্র্যাশ" : "Crash",
        icon: "https://api.1onebet.com/uploads/1776365991653-848723889.png",
      },
      {
        key: "live",
        label: isBangla ? "লাইভ" : "Live",
        icon: "https://api.1onebet.com/uploads/1776359683563-933484237.svg",
      },
      {
        key: "table",
        label: isBangla ? "টেবিল" : "Table",
        icon: "https://api.1onebet.com/uploads/1776359711944-529730975.svg",
      },
      {
        key: "lottery",
        label: isBangla ? "লটারি" : "Lottery",
        icon: "https://api.1onebet.com/uploads/1776359778550-933102375.svg",
      },
    ],
    [isBangla],
  );

  const scrollByAmount = (amount) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  const selectedData = categories.find((item) => item.key === selectedCategory);

  const renderSelectedComponent = () => {
    switch (selectedCategory) {
      case "hot":
        return <HotsGame />;

      case "sports":
        return <Sports />;

      case "crash":
        return (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f5f98]">
              {isBangla ? "ক্র্যাশ" : "Crash"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isBangla
                ? "এইখানে Crash component show হবে।"
                : "Selected Crash component will show here."}
            </p>
          </div>
        );

      case "slots":
        return (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f5f98]">
              {isBangla ? "স্লটস" : "Slots"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isBangla
                ? "এইখানে Slots component show হবে।"
                : "Selected Slots component will show here."}
            </p>
          </div>
        );

      case "casino":
        return (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f5f98]">
              {isBangla ? "ক্যাসিনো" : "Casino"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isBangla
                ? "এইখানে Casino component show হবে।"
                : "Selected Casino component will show here."}
            </p>
          </div>
        );

      case "live":
        return (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f5f98]">
              {isBangla ? "লাইভ" : "Live"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isBangla
                ? "এইখানে Live component show হবে।"
                : "Selected Live component will show here."}
            </p>
          </div>
        );

      case "table":
        return (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f5f98]">
              {isBangla ? "টেবিল" : "Table"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isBangla
                ? "এইখানে Table component show হবে।"
                : "Selected Table component will show here."}
            </p>
          </div>
        );

      case "fishing":
        return (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f5f98]">
              {isBangla ? "মাছ ধরা" : "Fishing"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isBangla
                ? "এইখানে Fishing component show হবে।"
                : "Selected Fishing component will show here."}
            </p>
          </div>
        );

      case "lottery":
        return (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1f5f98]">
              {isBangla ? "লটারি" : "Lottery"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isBangla
                ? "এইখানে Lottery component show হবে।"
                : "Selected Lottery component will show here."}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Category Bar */}
      <div className="relative border border-[#8cb9e8] bg-[#2f79c9] px-2 sm:px-10 py-2 shadow-sm">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          className="hidden sm:block absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 cursor-pointer"
        >
          <span className="text-center flex justify-center">
            <ChevronLeft className="h-4 w-4" />
          </span>
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          className="hidden sm:block absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 cursor-pointer"
        >
          <span className="text-center flex justify-center">
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>

        {/* Scroll list */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((item) => {
            const isActive = selectedCategory === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedCategory(item.key)}
                className={`flex min-w-[78px] flex-col items-center justify-center rounded-[12px] border px-3 py-4 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-white/80 bg-[#2469a7] text-white shadow-md"
                    : "border-white/25 bg-[#2f79c9] text-white hover:bg-[#3f87d4]"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="mb-1 h-[26px] w-[26px] object-contain"
                />
                <span
                  className={`text-center text-[12px] text-nowrap font-semibold leading-[1.05] ${
                    isActive ? "text-white" : "text-white"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {selectedCategory === "hot" && <Slider />}

      {/* Selected category area */}
      <div className="mt-2">{renderSelectedComponent()}</div>

      {/* Optional selected summary */}
      {/* <div className="mt-3 px-2">
        <div className="rounded-xl bg-[#eef5fc] px-4 py-3 text-sm font-medium text-[#1f5f98]">
          {isBangla ? "নির্বাচিত ক্যাটাগরি:" : "Selected Category:"}{" "}
          <span className="font-bold">{selectedData?.label}</span>
        </div>
      </div> */}
    </div>
  );
};

export default Categories;

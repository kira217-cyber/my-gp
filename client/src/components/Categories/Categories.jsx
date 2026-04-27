import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import Sports from "../Sports/Sports";
import HotsGame from "../HotsGame/HotsGame";
import Slider from "../Slider/Slider";
import { api } from "../../api/axios";
import Providers from "../../pages/Providers/Providers";
import hot from '../../assets/hot.gif'
import sports from '../../assets/sports.png'

const Categories = () => {
  const { isBangla } = useLanguage();
  const scrollRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("hot");
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/game-categories");
        setDbCategories(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setDbCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const categories = useMemo(() => {
    const defaultCategories = [
      {
        key: "hot",
        label: isBangla ? "জনপ্রিয় গেম" : "Hot Games",
        icon: hot,
        type: "default",
      },
      {
        key: "sports",
        label: isBangla ? "স্পোর্টস" : "Sports",
        icon: sports,
        type: "default",
      },
    ];

    const dynamicCategories = dbCategories.map((item) => ({
      key: item._id,
      categoryId: item._id,
      label: isBangla
        ? item?.categoryName?.bn || item?.categoryTitle?.bn || "ক্যাটাগরি"
        : item?.categoryName?.en || item?.categoryTitle?.en || "Category",
      icon: item?.iconImageUrl || item?.iconImage || "",
      type: "dynamic",
      raw: item,
    }));

    return [...defaultCategories, ...dynamicCategories];
  }, [isBangla, dbCategories]);

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

      default:
        if (selectedData?.type === "dynamic") {
          return (
            <Providers
              categoryId={selectedData.categoryId}
              category={selectedData.raw}
            />
          );
        }

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
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="mb-1 h-[26px] w-[26px] object-contain"
                  />
                ) : (
                  <div className="mb-1 h-[26px] w-[26px] rounded-full bg-white/20" />
                )}

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
    </div>
  );
};

export default Categories;

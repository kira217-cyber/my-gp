import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const Sports = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [sportsList, setSportsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/sports");
        setSportsList(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch sports:", error);
        setSportsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  const text = useMemo(
    () => ({
      title: isBangla ? "জনপ্রিয় স্পোর্টস" : "Popular Sports",
      matches: isBangla
        ? `ম্যাচ-${String(sportsList.length).padStart(2, "0")}`
        : `Match-${String(sportsList.length).padStart(2, "0")}`,
    }),
    [isBangla, sportsList.length],
  );

  const getName = (item) => {
    return isBangla
      ? item?.name?.bn || item?.name?.en
      : item?.name?.en || item?.name?.bn;
  };

  const handleClick = (item) => {
    if (!item?.gameId) return;
    navigate(`/sports/${item.gameId}`);
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
                src="https://beit365.bet/assets/images/home-page-menu/Sports.svg"
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
        <div className="mt-1 grid grid-cols-4 gap-2 bg-white px-2 pb-1 pt-1">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[116px] animate-pulse rounded-[6px] bg-slate-200"
                />
              ))
            : sportsList.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleClick(item)}
                  className="cursor-pointer overflow-hidden rounded-[6px] border border-[#d59b72] bg-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                >
                  <div className="flex h-[80px] items-center justify-center bg-[#fffdf8] px-2">
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[10px] border border-[#d8d8d8] bg-white shadow-sm">
                      {item.iconImageUrl ? (
                        <img
                          src={item.iconImageUrl}
                          alt={getName(item)}
                          className="h-[60px] w-[60px] object-contain"
                        />
                      ) : (
                        <img
                          src="https://beit365.bet/assets/images/home-page-menu/Sports.svg"
                          alt={getName(item)}
                          className="h-[60px] w-[60px] object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-[#3f87d4] px-1 py-2">
                    <p className="truncate text-center text-[11px] font-bold leading-none text-white">
                      {getName(item)}
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

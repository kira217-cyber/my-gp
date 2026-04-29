import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import sports from '../../assets/sports.png'
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
        ? `মোট-${String(sportsList.length).padStart(2, "0")}`
        : `Total-${String(sportsList.length).padStart(2, "0")}`,
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
    navigate(`/play-game/${item.gameId}`);
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-gradient-to-br from-black via-[#2f79c9]/70 to-black">
        {/* Header */}
        <div className="flex items-stretch">
          {/* Left */}
          <div className="relative flex h-[44px] flex-[1.25] items-center bg-gradient-to-r from-[#2f79c9] to-[#5aa2e6] pl-3 pr-6">
            <div
              className="absolute right-0 top-0 h-full w-5 bg-white"
              style={{
                clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
              }}
            />

            <div className="mr-2 flex h-[32px] w-[32px] items-center justify-center rounded-sm">
              <img
                src={sports}
                alt="sports"
                className="h-[32px] w-[32px] object-contain brightness-0 invert"
              />
            </div>

            <h2 className="truncate text-[20px] font-extrabold text-white">
              {text.title}
            </h2>
          </div>

          {/* Right */}
          <div className="relative flex h-[44px] min-w-[118px] items-center justify-center bg-gradient-to-r from-[#2f79c9] to-[#5aa2e6] px-4">
            <div
              className="absolute left-0 top-0 h-full w-5 bg-white"
              style={{
                clipPath: "polygon(0 0, 0 100%, 100% 0)",
              }}
            />
            <span className="text-[16px] font-extrabold text-white">
              {text.matches}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-1 grid grid-cols-4 gap-2 bg-gradient-to-br from-black via-[#2f79c9]/70 to-black px-2 pb-1 pt-1">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[110px] animate-pulse rounded-[6px] bg-slate-200"
                />
              ))
            : sportsList.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleClick(item)}
                  className="cursor-pointer overflow-hidden rounded-[8px] border border-[#2f79c9]/30 bg-[#2f79c9] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                >
                  {/* Top */}
                  <div className="flex h-[70px] items-center justify-center bg-[#3f8fe0] px-1">
                    <div className="flex h-[60px] w-[60px] items-center justify-center">
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

                  {/* Bottom */}
                  <div className="bg-gradient-to-r from-[#2f79c9] to-[#1f5f98] px-1 py-2">
                    <p className="truncate text-center text-[11px] font-bold text-white">
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

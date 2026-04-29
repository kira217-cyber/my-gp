import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FaImage } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import hot from '../../assets/hot.gif'

const INITIAL_VISIBLE = 12;

const HomeProviders = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    const fetchHomeProviders = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          "/api/game-providers?status=active&isHome=true",
        );

        setProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch home providers:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProviders();
  }, []);

  const visibleProviders = useMemo(() => {
    return providers.slice(0, visibleCount);
  }, [providers, visibleCount]);

  const hasMoreProviders = providers.length > visibleCount;

  const text = {
    title: isBangla ? "জনপ্রিয় প্রোভাইডার" : "Popular Providers",
    matches: isBangla
      ? `মোট-${String(providers.length).padStart(2, "0")}`
      : `Total-${String(providers.length).padStart(2, "0")}`,
    showMore: isBangla ? "আরও দেখান" : "Show More",
  };

  const handleProviderClick = (provider) => {
    const categoryId = provider?.categoryId?._id || provider?.categoryId;
    const providerId = provider?._id;

    if (!categoryId || !providerId) return;

    navigate(`/games/${categoryId}?provider=${providerId}`);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + INITIAL_VISIBLE);
  };

  return (
    <div className="w-full">
      <style>
        {`
    @keyframes providerGlassShine {
      0% {
        transform: translateX(-260%) skewX(-22deg);
        opacity: 0;
      }
      12% {
        opacity: 1;
      }
      50% {
        opacity: 1;
      }
      82% {
        transform: translateX(360%) skewX(-22deg);
        opacity: 1;
      }
      100% {
        transform: translateX(360%) skewX(-22deg);
        opacity: 0;
      }
    }

    .provider-glass-shine::after {
      content: "";
      position: absolute;
      top: -35%;
      left: -85%;
      width: 55%;
      height: 170%;
      pointer-events: none;
      z-index: 2;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.08) 18%,
        rgba(255, 255, 255, 0.55) 38%,
        rgba(255, 255, 255, 0.95) 50%,
        rgba(255, 255, 255, 0.55) 62%,
        rgba(255, 255, 255, 0.08) 82%,
        transparent 100%
      );
      filter: blur(0.4px);
      mix-blend-mode: screen;
      animation: providerGlassShine 3s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
    }

    .provider-glass-shine img {
      position: relative;
      z-index: 1;
    }
  `}
      </style>

      <div className="overflow-hidden bg-[#1D5389]">
        {/* Header */}
        <div className="flex items-stretch bg-[#1f5f98]">
          {/* Left */}
          <div className="relative flex h-[44px] flex-[1.25] items-center bg-gradient-to-r from-[#2f79c9] to-[#5aa2e6] pl-3 pr-6">
            <div
              className="absolute right-0 top-0 h-full w-5 bg-white"
              style={{
                clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
              }}
            />

            <div className="mr-2 flex h-[30px] w-[30px] items-center justify-center rounded-sm">
              <img
                src={hot}
                alt="providers"
                className="h-[30px] w-[30px] object-contain brightness-0 invert"
              />
            </div>

            <h2 className="truncate text-[20px] font-extrabold text-white drop-shadow">
              {text.title}
            </h2>
          </div>

          {/* Right */}
          <div className="relative flex h-[44px] min-w-[108px] items-center justify-center bg-gradient-to-r from-[#2f79c9] to-[#5aa2e6] px-3">
            <div
              className="absolute left-0 top-0 h-full w-5 bg-white"
              style={{
                clipPath: "polygon(0 0, 0 100%, 100% 0)",
              }}
            />

            <span className="text-[16px] font-extrabold text-white drop-shadow">
              {text.matches}
            </span>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-4 gap-2 bg-gradient-to-br from-black via-[#2f79c9]/70 to-black px-2 py-2 pb-2 pt-2 sm:px-4">
          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[122px] animate-pulse rounded-[8px] bg-[#3f8fe0]"
                />
              ))
            : visibleProviders.map((provider) => {
                const image =
                  provider?.providerImageUrl ||
                  provider?.providerImage ||
                  provider?.providerIconUrl ||
                  provider?.providerIcon ||
                  "";

                return (
                  <button
                    key={provider._id}
                    type="button"
                    onClick={() => handleProviderClick(provider)}
                    className="cursor-pointer overflow-hidden rounded-[8px] bg-[#2f79c9] transition hover:-translate-y-[1px] hover:shadow-lg"
                  >
                    <div className="provider-glass-shine relative flex h-[122px] items-center justify-center overflow-hidden rounded-[8px] bg-[#eef5fc]">
                      {image ? (
                        <img
                          src={image}
                          alt={provider?.providerId || "Provider"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaImage className="text-3xl text-[#2f79c9]/60" />
                      )}
                    </div>
                  </button>
                );
              })}
        </div>

        {!loading && providers.length === 0 && (
          <div className="bg-[#1f5f98] px-3 py-6 text-center text-sm font-semibold text-white">
            {isBangla
              ? "কোনো হোম প্রোভাইডার পাওয়া যায়নি।"
              : "No home providers found."}
          </div>
        )}

        {!loading && hasMoreProviders && (
          <div className="flex justify-center bg-[#1D5389] px-2 pb-3 pt-1">
            <button
              type="button"
              onClick={handleShowMore}
              className="w-28 cursor-pointer rounded-full bg-[#2f79c9] py-1.5 text-sm font-bold text-white shadow transition hover:bg-[#184d7d]"
            >
              {text.showMore}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeProviders;

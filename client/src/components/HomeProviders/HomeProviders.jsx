import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FaImage } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

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
    <div className="w-full px-2 py-2">
      <div className="overflow-hidden rounded-[6px] bg-white">
        {/* Header */}
        <div className="flex items-stretch gap-[6px] ">
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
                src="https://beit365.bet/assets/images/home-page-menu/Casino.svg"
                alt="providers"
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

        {/* Provider Cards */}
        <div className="mt-1 grid grid-cols-4 gap-2 bg-white px-1 pb-2 pt-1">
          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[122px] animate-pulse rounded-[6px] bg-slate-200"
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
                    className="cursor-pointer overflow-hidden rounded-[6px] bg-white transition hover:-translate-y-[1px] hover:shadow-md"
                  >
                    <div className="flex h-[122px] items-center justify-center overflow-hidden rounded-[6px] bg-[#eef5fc]">
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
          <div className="px-3 py-6 text-center text-sm font-semibold text-[#1f5f98]">
            {isBangla
              ? "কোনো হোম প্রোভাইডার পাওয়া যায়নি।"
              : "No home providers found."}
          </div>
        )}

        {!loading && hasMoreProviders && (
          <div className="px-2 pb-2 flex justify-center mt-2">
            <button
              type="button"
              onClick={handleShowMore}
              className="w-24 cursor-pointer rounded-full bg-[#1f5f98] py-1 text-sm text-white transition hover:bg-[#184d7d]"
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

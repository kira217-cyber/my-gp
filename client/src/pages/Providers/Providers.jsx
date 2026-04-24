import React, { useEffect, useMemo, useState } from "react";
import { FaImage } from "react-icons/fa";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";


const Providers = ({ categoryId, category }) => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (isBangla) {
      return (
        category?.categoryTitle?.bn ||
        category?.categoryName?.bn ||
        "প্রোভাইডার"
      );
    }

    return (
      category?.categoryTitle?.en || category?.categoryName?.en || "Providers"
    );
  }, [category, isBangla]);

  useEffect(() => {
    const fetchProviders = async () => {
      if (!categoryId) {
        setProviders([]);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(
          `/api/game-providers?categoryId=${categoryId}&status=active`,
        );

        setProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [categoryId]);

  const goToGames = (providerDbId) => {
    navigate(`/games/${categoryId}?provider=${providerDbId}`);
  };

  if (loading) {
    return (
      <div className="px-2 py-3">

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="h-[96px] rounded-2xl bg-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!providers.length) {
    return (
      <div className="px-2 py-3">
        <h2 className="mb-3 text-yellow-400 font-semibold text-lg">{title}</h2>

        <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#1f5f98]">
            {isBangla
              ? "এই ক্যাটাগরিতে এখনো কোনো প্রোভাইডার নেই।"
              : "No providers found in this category."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {providers.map((provider) => {
          const image =
            provider?.providerImageUrl ||
            provider?.providerIconUrl ||
            provider?.providerImage ||
            provider?.providerIcon ||
            "";

          return (
            <button
              key={provider._id}
              type="button"
              onClick={() => goToGames(provider._id)}
              className="cursor-pointer overflow-hidden"
            >
              <div className="flex h-[120px] items-center justify-center bg-[#eef5fc]">
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
    </div>
  );
};

export default Providers;

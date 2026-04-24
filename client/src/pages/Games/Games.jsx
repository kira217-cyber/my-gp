import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { FaImage, FaSearch, FaStar } from "react-icons/fa";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ORACLE_BY_IDS_API = "https://api.oraclegames.live/api/games/by-ids";
const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;

const GAMES_PER_PAGE = 32;
const ORACLE_CHUNK_SIZE = 100;

const Games = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBangla } = useLanguage();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const providerScrollRef = useRef(null);

  const providerFromQuery = searchParams.get("provider") || "";

  const [category, setCategory] = useState(null);
  const [providers, setProviders] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [dbGames, setDbGames] = useState([]);
  const [oracleGameMap, setOracleGameMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  const [selectedProviderDbId, setSelectedProviderDbId] =
    useState(providerFromQuery);

  const [searchOpen, setSearchOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSelectedProviderDbId(providerFromQuery);
  }, [providerFromQuery]);

  useEffect(() => {
    const loadCategory = async () => {
      if (!categoryId) return;

      try {
        const res = await api.get(`/api/game-categories/${categoryId}`);
        setCategory(res?.data?.data || null);
      } catch (error) {
        console.error("Failed to load category:", error);
        setCategory(null);
      }
    };

    loadCategory();
  }, [categoryId]);

  useEffect(() => {
    const loadProviders = async () => {
      if (!categoryId) {
        setProviders([]);
        return;
      }

      try {
        setProviderLoading(true);

        const res = await api.get(
          `/api/game-providers?categoryId=${categoryId}&status=active`,
        );

        setProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to load providers:", error);
        setProviders([]);
      } finally {
        setProviderLoading(false);
      }
    };

    loadProviders();
  }, [categoryId]);

  useEffect(() => {
    const loadOracleProviders = async () => {
      try {
        const res = await axios.get(ORACLE_PROVIDER_API, {
          headers: {
            "x-api-key": ORACLE_KEY,
          },
        });

        setOracleProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to load oracle providers:", error);
        setOracleProviders([]);
      }
    };

    loadOracleProviders();
  }, []);

  const providerNameMap = useMemo(() => {
    const map = new Map();

    for (const item of oracleProviders) {
      if (item?.providerCode) {
        map.set(
          String(item.providerCode),
          item?.providerName || item.providerCode,
        );
      }
    }

    return map;
  }, [oracleProviders]);

  const getProviderName = (providerId) => {
    return providerNameMap.get(String(providerId)) || providerId || "Provider";
  };

  useEffect(() => {
    const loadDbGames = async () => {
      if (!categoryId) {
        setDbGames([]);
        setOracleGameMap({});
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(
          `/api/games?categoryId=${categoryId}&status=active`,
        );

        const gamesFromDb = res?.data?.data || [];
        setDbGames(gamesFromDb);

        const uniqueIds = [
          ...new Set(
            gamesFromDb
              .map((item) => item?.gameId)
              .filter(Boolean)
              .map((id) => String(id)),
          ),
        ];

        if (!uniqueIds.length) {
          setOracleGameMap({});
          return;
        }

        const chunks = [];

        for (let i = 0; i < uniqueIds.length; i += ORACLE_CHUNK_SIZE) {
          chunks.push(uniqueIds.slice(i, i + ORACLE_CHUNK_SIZE));
        }

        const results = await Promise.all(
          chunks.map((chunk) =>
            axios.post(
              ORACLE_BY_IDS_API,
              { ids: chunk },
              {
                headers: {
                  "x-api-key": ORACLE_KEY,
                },
              },
            ),
          ),
        );

        const fullMap = {};

        for (const response of results) {
          const list = response?.data?.data || [];

          for (const game of list) {
            fullMap[String(game._id)] = game;
          }
        }

        setOracleGameMap(fullMap);
      } catch (error) {
        console.error("Failed to load games:", error);
        setDbGames([]);
        setOracleGameMap({});
      } finally {
        setLoading(false);
      }
    };

    loadDbGames();
  }, [categoryId]);

  const categoryTitle = useMemo(() => {
    if (isBangla) {
      return (
        category?.categoryTitle?.bn || category?.categoryName?.bn || "গেমস"
      );
    }

    return category?.categoryTitle?.en || category?.categoryName?.en || "Games";
  }, [category, isBangla]);

  const mergedGames = useMemo(() => {
    return dbGames.map((dbGame) => {
      const oracleGame = oracleGameMap[String(dbGame.gameId)] || null;

      const provider =
        providers.find(
          (p) =>
            String(p._id) ===
            String(dbGame?.providerDbId?._id || dbGame?.providerDbId),
        ) ||
        dbGame?.providerDbId ||
        null;

      const finalImage = dbGame?.imageUrl
        ? dbGame.imageUrl
        : oracleGame?.image || oracleGame?.img || oracleGame?.thumbnail || "";

      return {
        ...dbGame,
        provider,
        oracleGame,
        displayName:
          oracleGame?.gameName ||
          oracleGame?.name ||
          oracleGame?.game_code ||
          "Unnamed Game",
        displayImage: finalImage,
        displayGameCode: oracleGame?.game_code || "",
        providerIcon:
          provider?.providerIconUrl ||
          provider?.providerIcon ||
          dbGame?.providerDbId?.providerIconUrl ||
          "",
      };
    });
  }, [dbGames, oracleGameMap, providers]);

  const filteredByProvider = useMemo(() => {
    if (!selectedProviderDbId) return mergedGames;

    return mergedGames.filter(
      (item) =>
        String(item?.providerDbId?._id || item?.providerDbId) ===
        String(selectedProviderDbId),
    );
  }, [mergedGames, selectedProviderDbId]);

  const finalFilteredGames = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    let filtered = filteredByProvider;

    if (keyword) {
      filtered = filtered.filter((item) => {
        const name = String(item.displayName || "").toLowerCase();
        const code = String(item.displayGameCode || "").toLowerCase();
        const gameId = String(item.gameId || "").toLowerCase();

        return (
          name.includes(keyword) ||
          code.includes(keyword) ||
          gameId.includes(keyword)
        );
      });
    }

    return [...filtered].sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [filteredByProvider, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProviderDbId, searchText, categoryId]);

  const totalPages = Math.ceil(finalFilteredGames.length / GAMES_PER_PAGE) || 1;

  const paginatedGames = finalFilteredGames.slice(
    (currentPage - 1) * GAMES_PER_PAGE,
    currentPage * GAMES_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleProviderTabClick = (providerDbId) => {
    setSelectedProviderDbId(providerDbId);

    if (providerDbId) {
      setSearchParams({ provider: providerDbId });
    } else {
      setSearchParams({});
    }
  };

  const handleGameClick = (game) => {
    if (!isAuthenticated) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to continue");
      navigate("/login");
      return;
    }

    const targetId = game?._id || game?.gameId;

    if (!targetId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game id not found");
      return;
    }

    navigate(`/play-game/${targetId}`);
  };

  if (!categoryId) return null;

  if (loading || providerLoading) {
    return (
      <div className="px-3 pb-4">
        <div className="h-10 w-40 rounded-xl bg-white/10 animate-pulse mb-2" />

        <div className="flex gap-2 overflow-x-auto bg-[#2f79c9] p-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[54px] min-w-[78px] rounded-xl bg-white/15 animate-pulse"
            />
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mt-2">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="bg-[#2f79c9]/60 p-[3px] animate-pulse">
              <div className="h-[95px] bg-white/15" />
              <div className="h-[22px] bg-white/15 mt-[3px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="py-2 text-white text-center font-bold text-2xl bg-[#2469A7]  mb-2">
      ----  {categoryTitle}  ----
      </h2>
      <div className="px-3 pb-4 mb-32">
        {/* Provider Tabs */}
        {/* Provider Tabs */}
        <div className="relative border border-[#8cb9e8] bg-[#2f79c9] px-2 sm:px-10 py-2 shadow-sm rounded-md">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => {
              if (!providerScrollRef.current) return;
              providerScrollRef.current.scrollBy({
                left: -180,
                behavior: "smooth",
              });
            }}
            className="hidden sm:block absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 cursor-pointer"
          >
            <span className="text-center flex justify-center">
              <ChevronLeft className="h-4 w-4" />
            </span>
          </button>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => {
              if (!providerScrollRef.current) return;
              providerScrollRef.current.scrollBy({
                left: 180,
                behavior: "smooth",
              });
            }}
            className="hidden sm:block absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 cursor-pointer"
          >
            <span className="text-center flex justify-center">
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>

          {/* Scroll list */}
          <div
            ref={providerScrollRef}
            className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              onClick={() => handleProviderTabClick("")}
              className={`flex min-w-[78px] flex-col items-center justify-center rounded-[12px] border px-3 py-4 transition-all duration-200 cursor-pointer ${
                !selectedProviderDbId
                  ? "border-white/80 bg-[#2469a7] text-white shadow-md"
                  : "border-white/25 bg-[#2f79c9] text-white hover:bg-[#3f87d4]"
              }`}
            >
              <div className="mb-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                ALL
              </div>

              <span className="text-center text-[12px] text-nowrap font-semibold leading-[1.05] text-white">
                {isBangla ? "সব" : "All"}
              </span>
            </button>

            {providers.map((provider) => {
              const active =
                String(selectedProviderDbId) === String(provider._id);

              const icon =
                provider?.providerIconUrl ||
                provider?.providerIcon ||
                provider?.providerImageUrl ||
                "";

              return (
                <button
                  key={provider._id}
                  type="button"
                  onClick={() => handleProviderTabClick(provider._id)}
                  className={`flex min-w-[78px] flex-col items-center justify-center rounded-[12px] border transition-all duration-200 cursor-pointer ${
                    active
                      ? "border-white/80 bg-[#2469a7] text-white shadow-md"
                      : "border-white/25 bg-[#2f79c9] text-white hover:bg-[#3f87d4]"
                  }`}
                >
                  {icon ? (
                    <img
                      src={icon}
                      alt={provider?.providerId || "Provider"}
                      className="mb-1 h-[32px] w-[72px] object-contain"
                    />
                  ) : (
                    <FaImage className="mb-1 h-[32px] w-[72px] text-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className={`cursor-pointer h-[40px] w-[44px] shrink-0 rounded-[8px] flex items-center justify-center transition-all duration-200 ${
              searchOpen
                ? "bg-[#2469a7] text-white"
                : "bg-[#2f79c9] text-white hover:bg-[#3f87d4]"
            }`}
          >
            <FaSearch className="text-[16px]" />
          </button>

          {searchOpen && (
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2f79c9]/70 text-[14px]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={isBangla ? "গেম খুঁজুন..." : "Search games..."}
                className="h-[40px] w-full rounded-[8px] border border-[#8cb9e8] bg-white pl-11 pr-4 text-[#1f5f98] outline-none placeholder:text-[#1f5f98]/50"
              />
            </div>
          )}
        </div>

        {/* Games */}
        {/* Games */}
        {finalFilteredGames.length === 0 ? (
          <div className="rounded-2xl border border-[#2f79c9]/20 bg-white p-5 text-center shadow-sm mt-2">
            <p className="text-sm font-semibold text-[#1f5f98]">
              {isBangla ? "কোনো গেম পাওয়া যায়নি।" : "No games found."}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-2 overflow-hidden rounded-[6px] bg-white">
              <div className="mt-1 grid grid-cols-4 gap-2 bg-white px-1 pb-2 pt-1">
                {paginatedGames.map((game) => (
                  <button
                    key={game._id}
                    type="button"
                    onClick={() => handleGameClick(game)}
                    className="cursor-pointer overflow-hidden rounded-[6px] bg-white transition hover:-translate-y-[1px] hover:shadow-md"
                  >
                    <div className="overflow-hidden rounded-t-[6px]">
                      {game.displayImage ? (
                        <img
                          src={game.displayImage}
                          alt={game.displayName}
                          className="h-[92px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[92px] w-full items-center justify-center bg-[#eef5fc]">
                          <FaImage className="text-2xl text-[#2f79c9]/60" />
                        </div>
                      )}
                    </div>

                    <div className="flex h-[30px] items-center justify-center bg-[#2f79c9] px-1">
                      {game.providerIcon ? (
                        <img
                          src={game.providerIcon}
                          alt="provider"
                          className="h-[20px] w-auto object-contain"
                        />
                      ) : (
                        <span className="truncate text-[10px] font-bold text-white">
                          {game.displayName}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-[#2f79c9] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isBangla ? "আগে" : "Previous"}
                </button>

                <span className="text-white text-sm font-semibold">
                  {isBangla
                    ? `পৃষ্ঠা ${currentPage} / ${totalPages}`
                    : `Page ${currentPage} / ${totalPages}`}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-[#2f79c9] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isBangla ? "পরে" : "Next"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Games;

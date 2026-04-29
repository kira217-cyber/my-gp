import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Flame } from "lucide-react";
import { FaImage } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import Sports from "../Sports/Sports";
import { api } from "../../api/axios";
import { toast } from "react-toastify";
import HomeProviders from "../HomeProviders/HomeProviders";
import Footer from "../Footer/Footer";
import hot from "../../assets/hot.gif";
import JiliGames from "../JiliGames/JiliGames";
import PgGames from "../PgGames/PgGames";
import PokerGames from "../PokerGames/PokerGames";
import CrashGames from "../CrashGames/CrashGames";
import LiveCasinoGames from "../LiveCasinoGames/LiveCasinoGames";
import FishGames from "../FishGames/FishGames";

const ORACLE_BY_IDS_API = "https://api.oraclegames.live/api/games/by-ids";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;
const ORACLE_CHUNK_SIZE = 100;

const getFileUrl = (filePath = "") => {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const baseUrl = import.meta.env.VITE_API_URL || "";
  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  return `${baseUrl}${cleanPath}`;
};

const HotsGame = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [dbGames, setDbGames] = useState([]);
  const [oracleGameMap, setOracleGameMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchHotGames = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/games?isHot=true&status=active");
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
        console.error("Failed to fetch hot games:", error);
        setDbGames([]);
        setOracleGameMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchHotGames();
  }, []);

  const games = useMemo(() => {
    return dbGames.map((dbGame) => {
      const oracleGame = oracleGameMap[String(dbGame.gameId)] || null;

      const providerIcon =
        dbGame?.providerDbId?.providerIconUrl ||
        getFileUrl(dbGame?.providerDbId?.providerIcon) ||
        "";

      return {
        ...dbGame,
        name:
          oracleGame?.gameName ||
          oracleGame?.name ||
          oracleGame?.game_code ||
          "Unnamed Game",
        image:
          dbGame?.imageUrl ||
          oracleGame?.image ||
          oracleGame?.img ||
          oracleGame?.thumbnail ||
          "",
        providerLogo: providerIcon,
      };
    });
  }, [dbGames, oracleGameMap]);

  const visibleGames = useMemo(() => {
    return games.slice(0, visibleCount);
  }, [games, visibleCount]);

  const hasMoreGames = games.length > visibleCount;

  const text = {
    title: isBangla ? "জনপ্রিয় গরম খেলা" : "Popular Hot Games",
    total: isBangla
      ? `মোট-${String(games.length).padStart(2, "0")}`
      : `Total-${String(games.length).padStart(2, "0")}`,
    seeAll: isBangla ? "আরও দেখান" : "Show More",
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleGameClick = (game) => {
    const targetId = game?._id;

    if (!targetId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game id not found");
      return;
    }

    navigate(`/play-game/${targetId}`);
  };

  return (
    <>
      <style>
        {`
        @keyframes providerGlassShine {
          0% { transform: translateX(-260%) skewX(-22deg); opacity: 0; }
          12% { opacity: 1; }
          50% { opacity: 1; }
          82% { transform: translateX(360%) skewX(-22deg); opacity: 1; }
          100% { transform: translateX(360%) skewX(-22deg); opacity: 0; }
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
            rgba(255,255,255,0.08) 18%,
            rgba(255,255,255,0.55) 38%,
            rgba(255,255,255,0.95) 50%,
            rgba(255,255,255,0.55) 62%,
            rgba(255,255,255,0.08) 82%,
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
      <Sports />
      <HomeProviders />

      <div className="w-full mt-1">
        <div className="overflow-hidden  bg-gradient-to-br from-black via-[#2f79c9]/70 to-black">
          {/* Header */}
          <div className="flex items-stretch bg-[#1f5f98]">
            <div className="relative flex h-[44px] flex-1 items-center bg-gradient-to-r from-[#2f79c9] to-[#5aa2e6] pl-3 pr-6">
              <div
                className="absolute right-0 top-0 h-full w-5 bg-white"
                style={{
                  clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                }}
              />

              <div className="mr-2 flex h-[28px] w-[28px] items-center justify-center text-white">
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

            <div className="relative flex h-[44px] min-w-[108px] items-center justify-center bg-gradient-to-r from-[#2f79c9] to-[#5aa2e6] px-3">
              <div
                className="absolute left-0 top-0 h-full w-5 bg-white"
                style={{
                  clipPath: "polygon(0 0, 0 100%, 100% 0)",
                }}
              />

              <span className="text-[16px] font-extrabold text-white drop-shadow">
                {text.total}
              </span>
            </div>
          </div>

          {/* Games */}
          <div className="grid grid-cols-4 gap-2 bg-gradient-to-br from-black via-[#2f79c9]/70 to-black px-2 sm:px-4 pb-2 pt-2  py-2">
            {loading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[132px] animate-pulse rounded-[8px] bg-[#3f8fe0]"
                  />
                ))
              : visibleGames.map((game) => (
                  <button
                    key={game._id}
                    type="button"
                    onClick={() => handleGameClick(game)}
                    className="cursor-pointer overflow-hidden rounded-[8px] bg-[#2f79c9] transition hover:-translate-y-[1px] hover:shadow-lg"
                  >
                    <div className="provider-glass-shine relative overflow-hidden rounded-t-[8px] bg-[#3f8fe0]">
                      {game.image ? (
                        <img
                          src={game.image}
                          alt={game.name}
                          className="h-[100px] sm:h-[110px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[100px] w-full items-center justify-center bg-[#eef5fc]">
                          <FaImage className="text-2xl text-[#2f79c9]/60" />
                        </div>
                      )}
                    </div>

                    <div className="flex h-[30px] items-center justify-center bg-gradient-to-r from-[#2f79c9] to-[#1f5f98] px-1">
                      {game.providerLogo ? (
                        <img
                          src={game.providerLogo}
                          alt="Provider"
                          className="h-[18px] w-auto object-contain"
                        />
                      ) : (
                        <span className="truncate text-[10px] font-bold text-white">
                          {game.name}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
          </div>

          {!loading && games.length === 0 && (
            <div className="bg-[#1f5f98] px-3 py-6 text-center text-sm font-semibold text-white">
              {isBangla ? "কোনো হট গেম পাওয়া যায়নি।" : "No hot games found."}
            </div>
          )}

          {!loading && hasMoreGames && (
            <div className="flex justify-center px-2 pb-3 pt-1">
              <button
                type="button"
                onClick={handleShowMore}
                className="w-28 cursor-pointer rounded-full bg-[#2f79c9] py-1.5 text-sm font-bold text-white shadow transition hover:bg-[#184d7d]"
              >
                {text.seeAll}
              </button>
            </div>
          )}
        </div>
      </div>

      
      <JiliGames />
      <PgGames />
      <PokerGames />
      <CrashGames />
      <LiveCasinoGames />
      <FishGames />
      <Footer />
    </>
  );
};

export default HotsGame;

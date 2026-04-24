import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Flame } from "lucide-react";
import { FaImage } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import Sports from "../Sports/Sports";
import { api } from "../../api/axios";

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

  const text = {
    title: isBangla ? "গরম খেলা" : "Hot Games",
    total: isBangla ? `মোট-${games.length}` : `TOTAL-${games.length}`,
    seeAll: isBangla ? "সব দেখুন" : "See All",
  };

  const handleGameClick = (game) => {
    const targetId = game?._id || game?.gameId;
    if (!targetId) return;

    navigate(`/play-game/${targetId}`);
  };

  return (
    <>
      <Sports />

      <div className="w-full px-2 py-2">
        <div className="overflow-hidden rounded-[6px] bg-white">
          {/* Header */}
          <div className="flex items-stretch gap-[6px]">
            <div className="relative flex h-[44px] flex-1 items-center bg-gradient-to-r from-[#ff5a1f] to-[#ff8c1a] pl-3 pr-6">
              <div
                className="absolute right-0 top-0 h-full w-5 bg-white"
                style={{
                  clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                }}
              />

              <div className="mr-2 flex h-[24px] w-[24px] items-center justify-center text-white">
                <Flame className="h-[20px] w-[20px] fill-white text-white" />
              </div>

              <h2 className="truncate text-[22px] font-extrabold text-white">
                {text.title}
              </h2>
            </div>

            <div className="relative flex h-[44px] min-w-[110px] items-center justify-center bg-gradient-to-r from-[#ff5a1f] to-[#ffb01f] px-4">
              <div
                className="absolute left-0 top-0 h-full w-5 bg-white"
                style={{
                  clipPath: "polygon(0 0, 0 100%, 100% 0)",
                }}
              />

              <span className="text-[18px] font-extrabold text-white">
                {text.total}
              </span>
            </div>
          </div>

          {/* Game Grid */}
          <div className="mt-1 grid grid-cols-4 gap-2 bg-white px-1 pb-2 pt-1">
            {loading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[122px] animate-pulse rounded-[6px] bg-slate-200"
                  />
                ))
              : games.map((game) => (
                  <button
                    key={game._id}
                    type="button"
                    onClick={() => handleGameClick(game)}
                    className="cursor-pointer overflow-hidden rounded-[6px] bg-white transition hover:-translate-y-[1px] hover:shadow-md"
                  >
                    <div className="overflow-hidden rounded-t-[6px]">
                      {game.image ? (
                        <img
                          src={game.image}
                          alt={game.name}
                          className="h-[92px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[92px] w-full items-center justify-center bg-[#eef5fc]">
                          <FaImage className="text-2xl text-[#2f79c9]/60" />
                        </div>
                      )}
                    </div>

                    <div className="flex h-[30px] items-center justify-center bg-[#2f79c9] px-1">
                      {game.providerLogo ? (
                        <img
                          src={game.providerLogo}
                          alt="Provider"
                          className="h-[20px] w-auto object-contain"
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
            <div className="px-3 py-6 text-center text-sm font-semibold text-[#1f5f98]">
              {isBangla ? "কোনো হট গেম পাওয়া যায়নি।" : "No hot games found."}
            </div>
          )}

          {/* See All */}
          <div className="px-2 pb-2 flex justify-center mt-2">
            <button
              type="button"
              onClick={() => navigate("/games")}
              className="w-20 cursor-pointer rounded-full bg-[#1f5f98] py-1 text-sm text-white transition hover:bg-[#184d7d]"
            >
              {text.seeAll}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HotsGame;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";

const PlayGame = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { isBangla } = useLanguage();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

  const [gameUrl, setGameUrl] = useState("");

  const t = (bn, en) => (isBangla ? bn : en);

  const realUser = reduxUser || null;

  const isActiveUser = useMemo(() => {
    if (!realUser) return true;
    return realUser?.isActive !== false;
  }, [realUser]);

  const API_BASE =
    import.meta.env.VITE_API_URL;

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${API_BASE}/api/play-game/playgame`,
        { gameID: gameId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    },
    onSuccess: (data) => {
      if (data?.gameUrl) {
        setGameUrl(data.gameUrl);
      } else {
        toast.error(t("গেম URL পাওয়া যায়নি", "No game URL received"));
        navigate("/");
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          t("গেম চালু হয়নি", "Failed to start game"),
      );
      navigate("/");
    },
  });

  useEffect(() => {
    if (!gameId) {
      toast.error(t("গেম আইডি পাওয়া যায়নি", "Game id not found"));
      navigate("/");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error(t("খেলতে লগইন করুন", "Please login to play"));
      navigate("/login");
      return;
    }

    if (!isActiveUser) {
      toast.error(
        t("আপনার একাউন্ট অ্যাক্টিভ নয়", "Your account is not active"),
      );
      navigate("/");
      return;
    }

    if (!gameUrl && !playMutation.isPending) {
      playMutation.mutate();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, isAuthenticated, token, isActiveUser, gameUrl]);

  const isLoading = playMutation.isPending || !gameUrl;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="mb-4 flex h-20 w-40 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/70">
              {t("লোড হচ্ছে...", "Loading...")}
            </div>

            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-yellow-400/25 border-t-yellow-400" />
          </div>

          <p className="mt-2 text-sm text-white/65">
            {t(
              "অনুগ্রহ করে অপেক্ষা করুন",
              "Please wait while your game is being prepared",
            )}
          </p>

          <button
            type="button"
            onClick={() => playMutation.mutate()}
            disabled={playMutation.isPending}
            className="mt-6 cursor-pointer rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-60"
          >
            {t("রিফ্রেশ", "Refresh")}
          </button>
        </div>
      ) : (
        <iframe
          src={gameUrl}
          title="Game"
          className="h-full w-full border-0"
          allow="fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default PlayGame;

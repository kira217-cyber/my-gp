import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaGamepad,
  FaImage,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSearch,
  FaSyncAlt,
  FaFire,
  FaFish,
  FaDice,
  FaBolt,
} from "react-icons/fa";

const ORACLE_BASE = "https://api.oraclegames.live/api";
const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;
const GAMES_PER_PAGE = 50;

const inputClass =
  "w-full rounded-2xl border border-blue-300/20 bg-black/45 px-4 py-3 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/30";

const FLAG_FIELDS = [
  {
    key: "isHot",
    label: "Hot",
    icon: <FaFire />,
    activeClass: "bg-red-500 text-white",
    textClass: "text-red-200",
    accent: "accent-red-500",
  },
  {
    key: "isJili",
    label: "JILI",
    icon: <FaGamepad />,
    activeClass: "bg-emerald-500 text-white",
    textClass: "text-emerald-200",
    accent: "accent-emerald-500",
  },
  {
    key: "isPg",
    label: "PG",
    icon: <FaDice />,
    activeClass: "bg-purple-500 text-white",
    textClass: "text-purple-200",
    accent: "accent-purple-500",
  },
  {
    key: "isPoker",
    label: "Poker",
    icon: <FaDice />,
    activeClass: "bg-yellow-500 text-black",
    textClass: "text-yellow-200",
    accent: "accent-yellow-500",
  },
  {
    key: "isCrash",
    label: "Crash",
    icon: <FaBolt />,
    activeClass: "bg-orange-500 text-white",
    textClass: "text-orange-200",
    accent: "accent-orange-500",
  },
  {
    key: "isLiveCasino",
    label: "Live Casino",
    icon: <FaGamepad />,
    activeClass: "bg-pink-500 text-white",
    textClass: "text-pink-200",
    accent: "accent-pink-500",
  },
  {
    key: "isFish",
    label: "Fish",
    icon: <FaFish />,
    activeClass: "bg-cyan-500 text-white",
    textClass: "text-cyan-200",
    accent: "accent-cyan-500",
  },
];

const getDefaultFlags = () =>
  FLAG_FIELDS.reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {});

const AddGames = () => {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProviderDbId, setSelectedProviderDbId] = useState("");

  const [providerGames, setProviderGames] = useState([]);
  const [savedGames, setSavedGames] = useState([]);

  const [pageLoading, setPageLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState({
    image: null,
    status: "active",
    ...getDefaultFlags(),
  });

  const [editPreview, setEditPreview] = useState("");
  const [removeOldImage, setRemoveOldImage] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    title: "",
  });

  const selectedProvider = useMemo(
    () => providers.find((p) => p._id === selectedProviderDbId),
    [providers, selectedProviderDbId],
  );

  const providerNameMap = useMemo(() => {
    const map = new Map();

    for (const item of oracleProviders) {
      if (item?.providerCode) {
        map.set(
          String(item.providerCode),
          item?.providerName || item?.providerCode,
        );
      }
    }

    return map;
  }, [oracleProviders]);

  const selectedProviderName = useMemo(() => {
    if (!selectedProvider?.providerId) return "";

    return (
      providerNameMap.get(String(selectedProvider.providerId)) ||
      selectedProvider.providerId
    );
  }, [selectedProvider, providerNameMap]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/game-categories/admin/all");
      setCategories(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load categories",
      );
    }
  };

  const loadOracleProviders = async () => {
    try {
      const res = await axios.get(ORACLE_PROVIDER_API, {
        headers: { "x-api-key": ORACLE_KEY },
      });

      setOracleProviders(res?.data?.data || []);
    } catch (error) {
      toast.error("Failed to load oracle providers");
    }
  };

  const loadPageData = async () => {
    try {
      setPageLoading(true);
      await Promise.all([loadCategories(), loadOracleProviders()]);
    } finally {
      setPageLoading(false);
    }
  };

  const loadProvidersByCategory = async (categoryId) => {
    if (!categoryId) {
      setProviders([]);
      setSelectedProviderDbId("");
      return;
    }

    try {
      setLoadingProviders(true);

      const res = await api.get(`/api/game-providers?categoryId=${categoryId}`);
      setProviders(res?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load providers");
    } finally {
      setLoadingProviders(false);
    }
  };

  const loadSavedGames = async (providerDbId) => {
    if (!providerDbId) {
      setSavedGames([]);
      return;
    }

    try {
      setLoadingSaved(true);

      const res = await api.get(`/api/games?providerDbId=${providerDbId}`);
      setSavedGames(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load saved games",
      );
    } finally {
      setLoadingSaved(false);
    }
  };

  const loadOracleGames = async (providerId) => {
    if (!providerId) {
      setProviderGames([]);
      setCurrentPage(1);
      return;
    }

    try {
      setLoadingGames(true);

      const res = await axios.get(`${ORACLE_BASE}/providers/${providerId}`, {
        headers: { "x-api-key": ORACLE_KEY },
      });

      setProviderGames(res?.data?.games || []);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to load games from provider");
      setProviderGames([]);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    loadProvidersByCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    loadSavedGames(selectedProviderDbId);
  }, [selectedProviderDbId]);

  useEffect(() => {
    if (!selectedProvider?.providerId) {
      setProviderGames([]);
      setCurrentPage(1);
      return;
    }

    loadOracleGames(selectedProvider.providerId);
  }, [selectedProvider]);

  useEffect(() => {
    if (!editForm.image) return;

    const url = URL.createObjectURL(editForm.image);
    setEditPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [editForm.image]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const getGameDisplayName = (game) => {
    return game?.gameName || game?.name || game?.game_code || "Unnamed Game";
  };

  const getOracleImage = (game) => {
    return game?.image || game?.img || game?.thumbnail || "";
  };

  const filteredGames = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return providerGames;

    return providerGames.filter((game) => {
      const name = getGameDisplayName(game).toLowerCase();
      const gameCode = String(game?.game_code || "").toLowerCase();
      const gameId = String(game?._id || "").toLowerCase();

      return (
        name.includes(keyword) ||
        gameCode.includes(keyword) ||
        gameId.includes(keyword)
      );
    });
  }, [providerGames, searchText]);

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;

  const paginatedGames = filteredGames.slice(
    startIndex,
    startIndex + GAMES_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const isGameSelected = (oracleGameId) => {
    return savedGames.some((item) => item.gameId === oracleGameId);
  };

  const getSelectedGame = (oracleGameId) => {
    return savedGames.find((item) => item.gameId === oracleGameId);
  };

  const selectedCountThisPage = useMemo(() => {
    return paginatedGames.reduce(
      (acc, game) => (isGameSelected(game._id) ? acc + 1 : acc),
      0,
    );
  }, [paginatedGames, savedGames]);

  const allSelectedThisPage =
    paginatedGames.length > 0 &&
    selectedCountThisPage === paginatedGames.length;

  const getActiveFlags = (gameDoc) => {
    return FLAG_FIELDS.filter((item) => Boolean(gameDoc?.[item.key]));
  };

  const handleSelectGame = async (game) => {
    const oracleGameId = game?._id;

    if (!selectedCategoryId || !selectedProviderDbId) {
      toast.error("Please select category and provider first");
      return;
    }

    if (!oracleGameId) {
      toast.error("Game id not found");
      return;
    }

    const alreadySelected = isGameSelected(oracleGameId);

    try {
      if (alreadySelected) {
        const existingDoc = getSelectedGame(oracleGameId);

        if (!existingDoc?._id) return;

        await api.delete(`/api/games/${existingDoc._id}`);

        setSavedGames((prev) =>
          prev.filter((item) => item._id !== existingDoc._id),
        );

        toast.success("Game removed successfully");
        return;
      }

      const payload = {
        categoryId: selectedCategoryId,
        providerDbId: selectedProviderDbId,
        gameId: oracleGameId,
        status: "active",
      };

      const res = await api.post("/api/games", payload);

      setSavedGames((prev) => [res?.data?.data, ...prev]);
      toast.success("Game added successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleSelectAllThisPage = async () => {
    if (bulkLoading || !paginatedGames.length) return;

    if (!selectedCategoryId || !selectedProviderDbId) {
      toast.error("Please select category and provider first");
      return;
    }

    setBulkLoading(true);

    let added = 0;
    let skipped = 0;
    let failed = 0;

    try {
      for (const game of paginatedGames) {
        if (isGameSelected(game._id)) {
          skipped++;
          continue;
        }

        try {
          const res = await api.post("/api/games", {
            categoryId: selectedCategoryId,
            providerDbId: selectedProviderDbId,
            gameId: game._id,
            status: "active",
          });

          setSavedGames((prev) => [res?.data?.data, ...prev]);
          added++;
        } catch (err) {
          failed++;
        }
      }

      if (added) toast.success(`${added} game selected successfully`);
      if (skipped) toast.info(`${skipped} game already selected`);
      if (failed) toast.error(`${failed} game failed`);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRemoveSelectedAllThisPage = async () => {
    if (bulkLoading || !paginatedGames.length) return;

    setBulkLoading(true);

    let removed = 0;
    let skipped = 0;
    let failed = 0;

    try {
      for (const game of paginatedGames) {
        const existingDoc = getSelectedGame(game._id);

        if (!existingDoc?._id) {
          skipped++;
          continue;
        }

        try {
          await api.delete(`/api/games/${existingDoc._id}`);

          setSavedGames((prev) =>
            prev.filter((item) => item._id !== existingDoc._id),
          );

          removed++;
        } catch (err) {
          failed++;
        }
      }

      if (removed) toast.success(`${removed} game removed successfully`);
      if (skipped) toast.info(`${skipped} game not selected`);
      if (failed) toast.error(`${failed} game remove failed`);
    } finally {
      setBulkLoading(false);
    }
  };

  const openEditModal = (gameDoc) => {
    setEditingGame(gameDoc);

    const flags = FLAG_FIELDS.reduce((acc, item) => {
      acc[item.key] = Boolean(gameDoc?.[item.key]);
      return acc;
    }, {});

    setEditForm({
      image: null,
      status: gameDoc?.status || "active",
      ...flags,
    });

    setRemoveOldImage(false);
    setEditPreview(gameDoc?.imageUrl || "");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingGame(null);
    setEditModalOpen(false);

    setEditForm({
      image: null,
      status: "active",
      ...getDefaultFlags(),
    });

    setEditPreview("");
    setRemoveOldImage(false);
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();

    if (!editingGame?._id) return;

    try {
      const fd = new FormData();
      fd.append("status", editForm.status);
      fd.append("removeOldImage", removeOldImage ? "true" : "false");

      FLAG_FIELDS.forEach((item) => {
        fd.append(item.key, String(Boolean(editForm[item.key])));
      });

      if (editForm.image instanceof File) {
        fd.append("image", editForm.image);
      }

      const res = await api.put(`/api/games/${editingGame._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSavedGames((prev) =>
        prev.map((item) =>
          item._id === editingGame._id ? res?.data?.data : item,
        ),
      );

      toast.success(res?.data?.message || "Game updated successfully");
      closeEditModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update game");
    }
  };

  const openDeleteModal = (gameDoc, oracleGame) => {
    setDeleteModal({
      open: true,
      id: gameDoc._id,
      title: getGameDisplayName(oracleGame),
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
      title: "",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/api/games/${deleteModal.id}`);

      toast.success(res?.data?.message || "Game deleted successfully");

      setSavedGames((prev) =>
        prev.filter((item) => item._id !== deleteModal.id),
      );

      if (editingGame?._id === deleteModal.id) {
        closeEditModal();
      }

      closeDeleteModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete game");
    }
  };

  const Pagination = () => {
    if (totalPages <= 1 || !selectedProviderDbId) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer rounded-xl border border-blue-300/20 bg-black/50 px-5 py-2.5 font-bold text-blue-100 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="rounded-xl border border-blue-300/20 bg-black/35 px-4 py-2 text-sm font-bold text-blue-100">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer rounded-xl border border-blue-300/20 bg-black/50 px-5 py-2.5 font-bold text-blue-100 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

        <div className="text-sm text-blue-100/75">
          Selected This Page:{" "}
          <span className="font-black text-[#8fc2f5]">
            {selectedCountThisPage}/{paginatedGames.length}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/25 to-black shadow-2xl shadow-blue-950/40">
          <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/80 via-[#2f79c9]/40 to-black/80 px-5 py-5 md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/40">
                  <FaGamepad className="text-2xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                    Add Games
                  </h1>
                  <p className="mt-1 text-sm text-blue-100/80">
                    Category → Provider select করে Oracle games add/manage করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadPageData}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-300/20 bg-black/35 px-5 py-3 font-bold text-blue-100 transition-all hover:bg-white/10"
              >
                <FaSyncAlt className={pageLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="space-y-5 border-b border-blue-300/20 p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-blue-100">
                  Select Category
                </label>

                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedProviderDbId("");
                    setProviderGames([]);
                    setSavedGames([]);
                    setCurrentPage(1);
                    setSearchText("");
                  }}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-black" value="">
                    Choose category...
                  </option>

                  {categories.map((cat) => (
                    <option className="bg-black" key={cat._id} value={cat._id}>
                      {cat?.categoryName?.en} • {cat?.categoryName?.bn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-blue-100">
                  Select Provider
                </label>

                <select
                  value={selectedProviderDbId}
                  onChange={(e) => {
                    setSelectedProviderDbId(e.target.value);
                    setProviderGames([]);
                    setSavedGames([]);
                    setCurrentPage(1);
                    setSearchText("");
                  }}
                  disabled={!selectedCategoryId || loadingProviders}
                  className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option className="bg-black" value="">
                    {loadingProviders
                      ? "Loading providers..."
                      : "Choose provider..."}
                  </option>

                  {providers.map((provider) => (
                    <option
                      className="bg-black"
                      key={provider._id}
                      value={provider._id}
                    >
                      {providerNameMap.get(String(provider.providerId)) ||
                        provider.providerId}{" "}
                      ({provider.providerId})
                    </option>
                  ))}
                </select>

                {selectedProvider && (
                  <p className="mt-2 text-xs text-blue-100/75">
                    Selected Provider:{" "}
                    <span className="font-bold text-[#8fc2f5]">
                      {selectedProviderName}
                    </span>{" "}
                    • Code:{" "}
                    <span className="font-mono text-white">
                      {selectedProvider.providerId}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {selectedProviderDbId && (
              <>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <label className="mb-2 block text-sm font-bold text-blue-100">
                      Search Game
                    </label>

                    <div className="relative">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fc2f5]" />

                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by game name, code, or id..."
                        className={`${inputClass} pl-12`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-3 lg:col-span-2">
                    <button
                      type="button"
                      onClick={handleSelectAllThisPage}
                      disabled={
                        bulkLoading ||
                        allSelectedThisPage ||
                        !paginatedGames.length
                      }
                      className="cursor-pointer rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-black text-white shadow-lg shadow-blue-700/40 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {bulkLoading ? "Working..." : "Select All Game"}
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveSelectedAllThisPage}
                      disabled={bulkLoading || selectedCountThisPage === 0}
                      className="cursor-pointer rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-3 font-black text-red-200 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {bulkLoading ? "Working..." : "Remove Selected All"}
                    </button>
                  </div>
                </div>

                <Pagination />
              </>
            )}
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            {!selectedProviderDbId ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                Select category and provider first
              </div>
            ) : loadingGames ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                Loading games from provider...
              </div>
            ) : loadingSaved ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                Loading saved games...
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="rounded-3xl border border-blue-300/20 bg-black/30 py-12 text-center text-blue-100">
                {searchText
                  ? "No matching games found"
                  : "No games found for this provider"}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {paginatedGames.map((game) => {
                  const selected = isGameSelected(game._id);
                  const selectedDoc = getSelectedGame(game._id);
                  const displayName = getGameDisplayName(game);

                  const activeFlags = getActiveFlags(selectedDoc);

                  const imageToShow =
                    selected && selectedDoc?.imageUrl
                      ? selectedDoc.imageUrl
                      : getOracleImage(game);

                  return (
                    <div
                      key={game._id}
                      className={`overflow-hidden rounded-3xl border bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-xl shadow-blue-950/30 transition-all ${
                        selected
                          ? "border-[#63a8ee] ring-2 ring-[#63a8ee]/30"
                          : "border-blue-300/20"
                      }`}
                    >
                      <div className="relative">
                        {imageToShow ? (
                          <img
                            src={imageToShow}
                            alt={displayName}
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-black/45">
                            <FaImage className="text-5xl text-[#8fc2f5]/80" />
                          </div>
                        )}

                        {selected && (
                          <div className="absolute right-3 top-3 rounded-full bg-[#63a8ee] px-3 py-1 text-xs font-black text-white">
                            SELECTED
                          </div>
                        )}

                        {activeFlags.length > 0 && (
                          <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-1.5">
                            {activeFlags.slice(0, 3).map((flag) => (
                              <span
                                key={flag.key}
                                className={`rounded-full px-3 py-1 text-xs font-black shadow-lg ${flag.activeClass}`}
                              >
                                {flag.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="line-clamp-2 text-lg font-black text-white">
                          {displayName}
                        </h3>

                        <div className="mt-2 space-y-1 text-xs text-blue-100/70">
                          <div className="break-all">gameId: {game._id}</div>

                          {game?.game_code && (
                            <div className="break-all">
                              game_code: {game.game_code}
                            </div>
                          )}

                          {selected && (
                            <>
                              <div>Status: {selectedDoc?.status}</div>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {activeFlags.length > 0 ? (
                                  activeFlags.map((flag) => (
                                    <span
                                      key={flag.key}
                                      className="rounded-full border border-blue-300/20 bg-black/40 px-2.5 py-1 text-[11px] font-bold text-blue-100"
                                    >
                                      {flag.label}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-blue-100/50">
                                    No flags selected
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        <label className="mt-4 flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleSelectGame(game)}
                            className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                          />

                          <span className="font-bold text-blue-100">
                            {selected ? "Selected" : "Add to Platform"}
                          </span>
                        </label>

                        {selected && (
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(selectedDoc)}
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-3 font-black text-white shadow-md shadow-blue-700/30 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db]"
                            >
                              <FaEdit />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(selectedDoc, game)}
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-black text-red-200 transition-all hover:bg-red-500/20"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Pagination />
        </div>
      </div>

      {editModalOpen && editingGame && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/25 to-black p-6 shadow-2xl">
            <h3 className="mb-5 text-2xl font-black text-white">Edit Game</h3>

            <form onSubmit={handleUpdateGame} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-blue-100">
                  Replace Image
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-300/25 bg-black/35 p-6 text-center transition-all hover:border-[#63a8ee] hover:bg-white/10">
                  <FaImage className="mb-3 text-4xl text-[#8fc2f5]" />

                  <span className="text-base font-bold text-white">
                    Click to upload new image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        image: e.target.files?.[0] || null,
                      }))
                    }
                    className="hidden"
                  />
                </label>

                {editPreview && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-blue-300/20">
                    <img
                      src={editPreview}
                      alt="Edit Preview"
                      className="h-56 w-full object-cover"
                    />
                  </div>
                )}

                {(editPreview || editingGame?.imageUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm((prev) => ({ ...prev, image: null }));
                      setEditPreview("");
                      setRemoveOldImage(true);
                    }}
                    className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-2.5 font-bold text-yellow-200 transition-all hover:bg-yellow-500/20"
                  >
                    Remove Old Image
                  </button>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-blue-100">
                  Status
                </label>

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-black" value="active">
                    Active
                  </option>
                  <option className="bg-black" value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-blue-100">
                  Game Flags
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {FLAG_FIELDS.map((flag) => (
                    <label
                      key={flag.key}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-blue-300/20 bg-black/35 px-4 py-3 transition-all hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(editForm[flag.key])}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            [flag.key]: e.target.checked,
                          }))
                        }
                        className={`h-5 w-5 cursor-pointer ${flag.accent}`}
                      />

                      <span
                        className={`inline-flex items-center gap-2 font-bold ${flag.textClass}`}
                      >
                        {flag.icon}
                        Mark as {flag.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 font-black text-white shadow-lg shadow-blue-700/40 transition-all hover:from-[#7bb7f1] hover:to-[#3b88db]"
                >
                  <FaSave />
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-3 font-bold text-red-200 transition-all hover:bg-red-500/20"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-400/30 bg-gradient-to-br from-black via-red-950/20 to-black p-6 shadow-2xl">
            <h3 className="text-2xl font-black text-white">Confirm Delete</h3>

            <p className="mt-3 text-red-100/85">
              তুমি কি নিশ্চিত{" "}
              <span className="font-bold text-white">{deleteModal.title}</span>{" "}
              game delete করতে চাও?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition-all hover:bg-red-500"
              >
                <FaTrash />
                Yes, Delete
              </button>

              <button
                type="button"
                onClick={closeDeleteModal}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-blue-300/20 bg-black/45 px-5 py-3 font-bold text-white transition-all hover:bg-white/10"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGames;

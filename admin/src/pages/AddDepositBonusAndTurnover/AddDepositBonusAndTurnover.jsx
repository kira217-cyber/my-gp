import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaGift,
  FaImage,
  FaLayerGroup,
  FaPlus,
  FaSave,
  FaSyncAlt,
} from "react-icons/fa";
import { api } from "../../api/axios";

const emptyBi = { bn: "", en: "" };

const defaultChannel = () => ({
  id: "",
  name: { ...emptyBi },
  tagText: "+0%",
  bonusTitle: { ...emptyBi },
  bonusPercent: 0,
  isActive: true,
});

const defaultPromotion = () => ({
  id: "",
  name: { ...emptyBi },
  bonusType: "fixed",
  bonusValue: 0,
  turnoverMultiplier: 1,
  sort: 0,
  isActive: true,
});

const sectionCard =
  "rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-lg shadow-blue-900/20";
const inputBase =
  "w-full h-11 rounded-xl border border-blue-300/20 bg-black/40 px-4 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";
const labelCls = "mb-2 block text-sm font-medium text-blue-100";

const btnBase =
  "cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300";
const btnPrimary = `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db] shadow-lg shadow-blue-700/30`;
const btnGhost = `${btnBase} border border-blue-300/20 bg-black/30 text-blue-100 hover:bg-blue-900/20`;
const btnDanger = `${btnBase} border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20`;

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const BiInput = ({ title, value, onChangeBn, onChangeEn }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className={labelCls}>{title} (BN)</label>
      <input
        className={inputBase}
        value={value?.bn || ""}
        onChange={(e) => onChangeBn(e.target.value)}
      />
    </div>
    <div>
      <label className={labelCls}>{title} (EN)</label>
      <input
        className={inputBase}
        value={value?.en || ""}
        onChange={(e) => onChangeEn(e.target.value)}
      />
    </div>
  </div>
);

const AddDepositBonusAndTurnover = () => {
  const qc = useQueryClient();
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [turnoverMultiplier, setTurnoverMultiplier] = useState(1);
  const [channels, setChannels] = useState([defaultChannel()]);
  const [promotions, setPromotions] = useState([defaultPromotion()]);

  const { data: methodsRes = {}, refetch: refetchMethods } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
      return res.data;
    },
  });

  const methods = useMemo(() => methodsRes?.data || [], [methodsRes]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m._id === selectedMethodId) || null,
    [methods, selectedMethodId],
  );

  const {
    data: bonusRes,
    refetch: refetchBonus,
    isFetching,
  } = useQuery({
    queryKey: ["deposit-bonus-config", selectedMethodId],
    queryFn: async () => {
      const res = await api.get(
        `/api/deposit-bonus-turnover/method/${selectedMethodId}`,
      );
      return res.data;
    },
    enabled: !!selectedMethodId,
  });

  useEffect(() => {
    const data = bonusRes?.data;
    if (!data) {
      setTurnoverMultiplier(1);
      setChannels([defaultChannel()]);
      setPromotions([defaultPromotion()]);
      return;
    }

    setTurnoverMultiplier(Number(data.turnoverMultiplier ?? 1));
    setChannels(data.channels?.length ? data.channels : [defaultChannel()]);
    setPromotions(
      data.promotions?.length ? data.promotions : [defaultPromotion()],
    );
  }, [bonusRes]);

  const patchChannel = (idx, key, value) => {
    setChannels((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchChannelBi = (idx, key, lang, value) => {
    setChannels((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [key]: { ...(item[key] || emptyBi), [lang]: value } }
          : item,
      ),
    );
  };

  const patchPromotion = (idx, key, value) => {
    setPromotions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchPromotionBi = (idx, key, lang, value) => {
    setPromotions((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [key]: { ...(item[key] || emptyBi), [lang]: value } }
          : item,
      ),
    );
  };

  const validateBeforeSave = () => {
    if (!selectedMethodId) return "একটা deposit method select করো";

    for (const c of channels) {
      if (!String(c.id || "").trim()) return "Channel ID লাগবে";
      if (
        !String(c.name?.bn || "").trim() ||
        !String(c.name?.en || "").trim()
      ) {
        return "Channel name এর BN / EN লাগবে";
      }
    }

    for (const p of promotions) {
      if (!String(p.id || "").trim()) return "Promotion ID লাগবে";
      if (
        !String(p.name?.bn || "").trim() ||
        !String(p.name?.en || "").trim()
      ) {
        return "Promotion name এর BN / EN লাগবে";
      }
    }

    return null;
  };

  const onSave = async () => {
    const errorMessage = validateBeforeSave();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const res = await api.post("/api/deposit-bonus-turnover", {
        depositMethod: selectedMethodId,
        turnoverMultiplier,
        channels: JSON.stringify(channels),
        promotions: JSON.stringify(promotions),
      });

      toast.success(res?.data?.message || "Bonus & turnover saved");
      qc.invalidateQueries({
        queryKey: ["deposit-bonus-config", selectedMethodId],
      });
      refetchBonus();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                <FaGift className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Add Deposit Bonus & Turnover
                </h1>
                <p className="text-sm text-blue-100/80">
                  Deposit method select করে bonus / turnover configure করো
                </p>
              </div>
            </div>

            <button onClick={refetchMethods} className={btnGhost}>
              <span className="flex items-center gap-2">
                <FaSyncAlt />
                Refresh
              </span>
            </button>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <label className={labelCls}>Select Deposit Method</label>
          <select
            className={inputBase}
            value={selectedMethodId}
            onChange={(e) => setSelectedMethodId(e.target.value)}
          >
            <option value="">-- Select Deposit Method --</option>
            {methods.map((method) => (
              <option key={method._id} value={method._id}>
                {method.methodName?.en ||
                  method.methodName?.bn ||
                  method.methodId}
              </option>
            ))}
          </select>

          {selectedMethod && (
            <div className="mt-6 rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-blue-300/20 bg-black/40">
                  {selectedMethod.logoUrl ? (
                    <img
                      src={getImageUrl(selectedMethod.logoUrl)}
                      alt="method"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <FaImage className="text-2xl text-blue-200/60" />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedMethod.methodName?.bn ||
                      selectedMethod.methodName?.en ||
                      selectedMethod.methodId}
                  </h2>
                  <p className="text-sm text-blue-100/70">
                    ID: {selectedMethod.methodId}
                  </p>
                  <p className="text-sm text-blue-100/70">
                    Type: {selectedMethod.methodType}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedMethodId && (
            <div className="mt-8 space-y-8">
              <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
                <label className={labelCls}>Method Turnover Multiplier</label>
                <input
                  type="number"
                  className={inputBase}
                  value={Number(turnoverMultiplier ?? 1)}
                  onChange={(e) =>
                    setTurnoverMultiplier(Number(e.target.value || 1))
                  }
                />
              </div>

              <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaLayerGroup className="text-blue-200" />
                    <h3 className="text-lg font-semibold text-blue-100">
                      Channels
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setChannels((prev) => [...prev, defaultChannel()])
                    }
                    className={btnGhost}
                  >
                    <span className="flex items-center gap-2">
                      <FaPlus />
                      Add Channel
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  {channels.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-semibold text-blue-100">
                          Channel #{idx + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            setChannels((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          disabled={channels.length === 1}
                          className={btnDanger}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelCls}>Channel ID</label>
                          <input
                            className={inputBase}
                            value={item.id || ""}
                            onChange={(e) =>
                              patchChannel(idx, "id", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Tag Text</label>
                          <input
                            className={inputBase}
                            value={item.tagText || ""}
                            onChange={(e) =>
                              patchChannel(idx, "tagText", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <BiInput
                          title="Channel Name"
                          value={item.name}
                          onChangeBn={(v) =>
                            patchChannelBi(idx, "name", "bn", v)
                          }
                          onChangeEn={(v) =>
                            patchChannelBi(idx, "name", "en", v)
                          }
                        />
                      </div>

                      <div className="mt-4">
                        <BiInput
                          title="Bonus Title"
                          value={item.bonusTitle}
                          onChangeBn={(v) =>
                            patchChannelBi(idx, "bonusTitle", "bn", v)
                          }
                          onChangeEn={(v) =>
                            patchChannelBi(idx, "bonusTitle", "en", v)
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelCls}>Bonus Percent</label>
                          <input
                            type="number"
                            className={inputBase}
                            value={Number(item.bonusPercent ?? 0)}
                            onChange={(e) =>
                              patchChannel(
                                idx,
                                "bonusPercent",
                                Number(e.target.value || 0),
                              )
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                              checked={item.isActive ?? true}
                              onChange={(e) =>
                                patchChannel(idx, "isActive", e.target.checked)
                              }
                            />
                            <span className="font-medium text-blue-100">
                              Active
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaGift className="text-blue-200" />
                    <h3 className="text-lg font-semibold text-blue-100">
                      Promotions
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPromotions((prev) => [...prev, defaultPromotion()])
                    }
                    className={btnGhost}
                  >
                    <span className="flex items-center gap-2">
                      <FaPlus />
                      Add Promotion
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  {promotions.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-semibold text-blue-100">
                          Promotion #{idx + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            setPromotions((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          disabled={promotions.length === 1}
                          className={btnDanger}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelCls}>Promotion ID</label>
                          <input
                            className={inputBase}
                            value={item.id || ""}
                            onChange={(e) =>
                              patchPromotion(
                                idx,
                                "id",
                                String(e.target.value || "").toLowerCase(),
                              )
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                              checked={item.isActive ?? true}
                              onChange={(e) =>
                                patchPromotion(
                                  idx,
                                  "isActive",
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="font-medium text-blue-100">
                              Active
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-4">
                        <BiInput
                          title="Promotion Name"
                          value={item.name}
                          onChangeBn={(v) =>
                            patchPromotionBi(idx, "name", "bn", v)
                          }
                          onChangeEn={(v) =>
                            patchPromotionBi(idx, "name", "en", v)
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                          <label className={labelCls}>Bonus Type</label>
                          <select
                            className={inputBase}
                            value={item.bonusType || "fixed"}
                            onChange={(e) =>
                              patchPromotion(idx, "bonusType", e.target.value)
                            }
                          >
                            <option value="fixed">fixed</option>
                            <option value="percent">percent</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelCls}>Bonus Value</label>
                          <input
                            type="number"
                            className={inputBase}
                            value={Number(item.bonusValue ?? 0)}
                            onChange={(e) =>
                              patchPromotion(
                                idx,
                                "bonusValue",
                                Number(e.target.value || 0),
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Promotion Turnover</label>
                          <input
                            type="number"
                            className={inputBase}
                            value={Number(item.turnoverMultiplier ?? 1)}
                            onChange={(e) =>
                              patchPromotion(
                                idx,
                                "turnoverMultiplier",
                                Number(e.target.value || 1),
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Sort</label>
                          <input
                            type="number"
                            className={inputBase}
                            value={Number(item.sort ?? 0)}
                            onChange={(e) =>
                              patchPromotion(
                                idx,
                                "sort",
                                Number(e.target.value || 0),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button onClick={onSave} className={btnPrimary}>
                    <span className="flex items-center gap-2">
                      <FaSave />
                      {isFetching ? "Saving..." : "Save Bonus & Turnover"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDepositBonusAndTurnover;

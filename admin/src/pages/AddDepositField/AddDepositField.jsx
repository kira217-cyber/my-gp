import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaListAlt, FaPlus, FaSave, FaSyncAlt, FaImage } from "react-icons/fa";
import { api } from "../../api/axios";

const emptyBi = { bn: "", en: "" };

const defaultInput = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
  minLength: 0,
  maxLength: 0,
});

const sectionCard =
  "rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-lg shadow-blue-900/20";
const inputBase =
  "w-full h-11 rounded-xl border border-blue-300/20 bg-black/40 px-4 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";
const textAreaBase =
  "w-full min-h-[110px] rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";
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

const AddDepositField = () => {
  const qc = useQueryClient();
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [instructions, setInstructions] = useState({ bn: "", en: "" });
  const [inputs, setInputs] = useState([defaultInput()]);

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
    data: fieldRes,
    refetch: refetchField,
    isFetching,
  } = useQuery({
    queryKey: ["deposit-field-config", selectedMethodId],
    queryFn: async () => {
      const res = await api.get(
        `/api/deposit-fields/method/${selectedMethodId}`,
      );
      return res.data;
    },
    enabled: !!selectedMethodId,
  });

  useEffect(() => {
    const data = fieldRes?.data;
    if (!data) {
      setInstructions({ bn: "", en: "" });
      setInputs([defaultInput()]);
      return;
    }

    setInstructions(data.instructions || { bn: "", en: "" });
    setInputs(data.inputs?.length ? data.inputs : [defaultInput()]);
  }, [fieldRes]);

  const patchInput = (idx, key, value) => {
    setInputs((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchInputBi = (idx, key, lang, value) => {
    setInputs((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [key]: { ...(item[key] || emptyBi), [lang]: value } }
          : item,
      ),
    );
  };

  const validateBeforeSave = () => {
    if (!selectedMethodId) return "একটা deposit method select করো";

    for (const f of inputs) {
      if (!String(f.key || "").trim()) return "Input key ফাঁকা রাখা যাবে না";
      if (
        !String(f.label?.bn || "").trim() ||
        !String(f.label?.en || "").trim()
      ) {
        return "Input label এর BN / EN লাগবে";
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
      const res = await api.post("/api/deposit-fields", {
        depositMethod: selectedMethodId,
        instructions: JSON.stringify(instructions),
        inputs: JSON.stringify(inputs),
      });

      toast.success(res?.data?.message || "Deposit field config saved");
      qc.invalidateQueries({
        queryKey: ["deposit-field-config", selectedMethodId],
      });
      refetchField();
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
                <FaListAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Add Deposit Field
                </h1>
                <p className="text-sm text-blue-100/80">
                  Deposit method select করে input field configure করো
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
                <h3 className="mb-4 text-lg font-semibold text-blue-100">
                  Instructions
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls}>Instruction (BN)</label>
                    <textarea
                      className={textAreaBase}
                      value={instructions.bn}
                      onChange={(e) =>
                        setInstructions((prev) => ({
                          ...prev,
                          bn: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Instruction (EN)</label>
                    <textarea
                      className={textAreaBase}
                      value={instructions.en}
                      onChange={(e) =>
                        setInstructions((prev) => ({
                          ...prev,
                          en: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-100">
                    Deposit Input Fields
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setInputs((prev) => [...prev, defaultInput()])
                    }
                    className={btnGhost}
                  >
                    <span className="flex items-center gap-2">
                      <FaPlus />
                      Add Field
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  {inputs.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-semibold text-blue-100">
                          Field #{idx + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            setInputs((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          disabled={inputs.length === 1}
                          className={btnDanger}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelCls}>Key</label>
                          <input
                            className={inputBase}
                            value={item.key || ""}
                            onChange={(e) =>
                              patchInput(idx, "key", e.target.value)
                            }
                            placeholder="amount / senderNumber / trxId"
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Type</label>
                          <select
                            className={inputBase}
                            value={item.type || "text"}
                            onChange={(e) =>
                              patchInput(idx, "type", e.target.value)
                            }
                          >
                            <option value="text">text</option>
                            <option value="number">number</option>
                            <option value="tel">tel</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <BiInput
                          title="Label"
                          value={item.label}
                          onChangeBn={(v) =>
                            patchInputBi(idx, "label", "bn", v)
                          }
                          onChangeEn={(v) =>
                            patchInputBi(idx, "label", "en", v)
                          }
                        />
                      </div>

                      <div className="mt-4">
                        <BiInput
                          title="Placeholder"
                          value={item.placeholder}
                          onChangeBn={(v) =>
                            patchInputBi(idx, "placeholder", "bn", v)
                          }
                          onChangeEn={(v) =>
                            patchInputBi(idx, "placeholder", "en", v)
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-end">
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                              checked={!!item.required}
                              onChange={(e) =>
                                patchInput(idx, "required", e.target.checked)
                              }
                            />
                            <span className="font-medium text-blue-100">
                              Required
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className={labelCls}>Min Length</label>
                          <input
                            type="number"
                            className={inputBase}
                            value={Number(item.minLength ?? 0)}
                            onChange={(e) =>
                              patchInput(
                                idx,
                                "minLength",
                                Number(e.target.value || 0),
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Max Length</label>
                          <input
                            type="number"
                            className={inputBase}
                            value={Number(item.maxLength ?? 0)}
                            onChange={(e) =>
                              patchInput(
                                idx,
                                "maxLength",
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
                      {isFetching ? "Saving..." : "Save Fields"}
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

export default AddDepositField;

import React, { useEffect, useMemo, useState } from "react";
import {
  FaQuestionCircle,
  FaSyncAlt,
  FaWallet,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { api } from "../../api/axios";
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

const card =
  "rounded-3xl border border-blue-200/15 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/30 overflow-hidden";

const labelCls = "text-sm font-semibold text-blue-100/85";

const inputCls =
  "mt-2 w-full h-[46px] rounded-2xl border border-blue-200/15 bg-black/45 px-4 text-sm text-white outline-none placeholder-blue-100/35 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/30 transition-all";

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold bg-black/35 text-blue-100 border border-blue-200/15 hover:bg-black/55 transition disabled:opacity-60 disabled:cursor-not-allowed";

const symbolByCurrency = (currency = "BDT") =>
  String(currency).toUpperCase() === "USDT" ? "$" : "৳";

const formatMoney = (value, currency = "BDT") => {
  const sym = symbolByCurrency(currency);
  const num = Number(value || 0);

  if (!Number.isFinite(num)) return `${sym} 0.00`;

  return `${sym} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Withdraw = () => {
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const token = auth?.token;

  const isAuthed = useSelector(selectIsAuthenticated);
  const me = useSelector(selectUser);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const notices = useMemo(
    () => [
      {
        title: "Bulk Adjustment First",
        body: "Bulk Adjustment complete না থাকলে affiliate withdraw submit করা যাবে না।",
      },
      {
        title: "Use Official Withdrawal Method",
        body: "শুধু system-এর official withdraw method ব্যবহার করুন।",
      },
      {
        title: "Correct Account Information",
        body: "ভুল account number বা wallet information দিলে processing delay হতে পারে।",
      },
    ],
    [],
  );

  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methods, setMethods] = useState([]);

  const [eligLoading, setEligLoading] = useState(false);
  const [elig, setElig] = useState({
    eligible: false,
    remaining: 0,
    message: "",
  });

  const [selectedId, setSelectedId] = useState("");
  const [formValues, setFormValues] = useState({});
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const accountOk = !!token && !!isAuthed;

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.get("/api/aff-withdraw-methods");
      const rows = res?.data?.data || res?.data || [];
      setMethods(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setMethods([]);
      console.error(e);
    } finally {
      setLoadingMethods(false);
    }
  };

  const loadEligibility = async () => {
    if (!token) {
      setElig({
        eligible: false,
        remaining: 0,
        message: "Please login to withdraw.",
      });
      return;
    }

    try {
      setEligLoading(true);

      const { data } = await api.get("/api/aff-withdraw-requests/eligibility", {
        headers,
      });

      const payload = data?.data || data || {};

      setElig({
        eligible: !!payload.eligible,
        remaining: Number(payload.remaining || 0),
        message: payload.message || "",
      });
    } catch (e) {
      setElig({
        eligible: false,
        remaining: 0,
        message: e?.response?.data?.message || "Unable to check eligibility.",
      });
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  useEffect(() => {
    if (token) {
      loadEligibility();
    } else {
      setElig({
        eligible: false,
        remaining: 0,
        message: "Please login to withdraw.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedMethod = useMemo(() => {
    if (!methods.length) return null;
    return (
      methods.find((m) => String(m.methodId) === String(selectedId)) || null
    );
  }, [methods, selectedId]);

  useEffect(() => {
    if (!selectedId && methods.length) {
      setSelectedId(methods[0]?.methodId || "");
    }
  }, [methods, selectedId]);

  useEffect(() => {
    if (!selectedMethod) return;

    const next = {};
    (selectedMethod.fields || []).forEach((f) => {
      next[f.key] = "";
    });
    setFormValues(next);
  }, [selectedMethod?._id]);

  const setVal = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const amountNum = Number(amount || 0);

  const min = useMemo(() => {
    const v = Number(selectedMethod?.minimumWithdrawAmount ?? 0);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [selectedMethod]);

  const max = useMemo(() => {
    const v = Number(selectedMethod?.maximumWithdrawAmount ?? 0);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [selectedMethod]);

  const hasMax = Number(max) > 0;

  const validAmount = useMemo(() => {
    if (!Number.isFinite(amountNum) || amountNum <= 0) return false;
    if (amountNum < Number(min)) return false;
    if (hasMax && amountNum > Number(max)) return false;
    if (amountNum > Number(elig.remaining || 0)) return false;
    return true;
  }, [amountNum, min, max, hasMax, elig.remaining]);

  const amountErrorText = useMemo(() => {
    if (!amount) return "";

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return "Enter a valid amount.";
    }

    if (amountNum < Number(min)) {
      return `Minimum withdraw amount is ${formatMoney(min)}.`;
    }

    if (hasMax && amountNum > Number(max)) {
      return `Maximum withdraw amount is ${formatMoney(max)}.`;
    }

    if (amountNum > Number(elig.remaining || 0)) {
      return `You cannot withdraw more than ${formatMoney(
        elig.remaining || 0,
      )}.`;
    }

    return "";
  }, [amount, amountNum, min, max, hasMax, elig.remaining]);

  const fieldErrors = useMemo(() => {
    const errs = {};
    const fields = selectedMethod?.fields || [];

    fields.forEach((f) => {
      const v = String(formValues?.[f.key] ?? "").trim();

      if (f.required !== false && !v) {
        errs[f.key] = "This field is required";
        return;
      }

      if (!v) return;

      if (f.type === "email") {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (!ok) errs[f.key] = "Enter a valid email";
      }

      if (f.type === "number") {
        const num = Number(v);
        if (!Number.isFinite(num)) errs[f.key] = "Numbers only";
      }

      if (f.type === "tel") {
        const bdOk = /^01[3-9]\d{8}$/.test(v);
        if (v.startsWith("01") && v.length >= 11 && !bdOk) {
          errs[f.key] = "Enter a valid Bangladeshi phone number";
        }
      }
    });

    return errs;
  }, [selectedMethod, formValues]);

  const allRequiredOk = useMemo(() => {
    const fields = selectedMethod?.fields || [];

    for (const f of fields) {
      if (f.required !== false) {
        const v = String(formValues?.[f.key] ?? "").trim();
        if (!v) return false;
      }
    }

    return true;
  }, [selectedMethod, formValues]);

  const noTypeErrors = Object.keys(fieldErrors).length === 0;

  const canSubmit =
    accountOk &&
    !!selectedMethod &&
    validAmount &&
    allRequiredOk &&
    noTypeErrors &&
    elig.eligible &&
    !eligLoading;

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;

    const payload = {
      methodId: selectedMethod?.methodId,
      amount: amountNum,
      fields: { ...formValues },
    };

    try {
      setSubmitting(true);

      await api.post("/api/aff-withdraw-requests", payload, { headers });

      toast.success("Withdraw request submitted!");
      navigate("/dashboard/withdraw-history");

      setAmount("");

      const next = {};
      (selectedMethod?.fields || []).forEach((f) => {
        next[f.key] = "";
      });
      setFormValues(next);

      loadEligibility();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Withdraw request failed");
      loadEligibility();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className={card}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/45 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Withdraw
                </div>
                <div className="mt-1 text-sm text-blue-100/75">
                  Submit your affiliate withdraw request
                </div>
              </div>

              <button
                type="button"
                onClick={loadMethods}
                className={btnSecondary}
                disabled={loadingMethods}
              >
                <FaSyncAlt className={loadingMethods ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {!accountOk && (
              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
                <div className="text-sm font-extrabold text-amber-200">
                  Login Required
                </div>
                <div className="mt-1 text-sm text-amber-100/85">
                  Please login to submit a withdraw request.
                </div>
              </div>
            )}

            {accountOk && !eligLoading && !elig.eligible && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4">
                <div className="text-sm font-extrabold text-red-200">
                  Withdrawal Not Allowed
                </div>
                <div className="mt-1 text-sm text-red-100/85">
                  {elig.message || "You are not eligible right now."}
                </div>
              </div>
            )}

            {accountOk && eligLoading && (
              <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4 text-sm text-blue-100/70">
                Checking eligibility...
              </div>
            )}

            {accountOk && !eligLoading && elig.eligible && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-emerald-200">
                      Withdrawable Balance
                    </div>
                    <div className="mt-1 text-xl font-extrabold text-white">
                      {formatMoney(elig.remaining || 0, me?.currency || "BDT")}
                    </div>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 border border-emerald-400/20">
                    <FaWallet />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>
                Withdrawal Options <span className="text-red-400">*</span>
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                {loadingMethods ? (
                  <div className="text-sm text-blue-100/65">
                    Loading methods...
                  </div>
                ) : methods.length ? (
                  methods.map((m) => {
                    const active = String(selectedId) === String(m.methodId);
                    const logo = m.logoUrl
                      ? `${import.meta.env.VITE_API_URL}${m.logoUrl}`
                      : "";

                    return (
                      <button
                        key={m._id || m.methodId}
                        type="button"
                        onClick={() => setSelectedId(m.methodId)}
                        disabled={!accountOk}
                        className={`h-[84px] w-[190px] rounded-2xl border bg-black/35 flex items-center justify-center transition ${
                          active
                            ? "border-[#63a8ee] shadow-[0_10px_30px_rgba(47,121,201,0.25)]"
                            : "border-blue-200/10 hover:border-blue-300/25"
                        } ${
                          !accountOk
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {logo ? (
                          <img
                            src={logo}
                            alt={m?.name?.en || m?.methodId}
                            className="max-h-[76px] max-w-[182px] object-contain"
                          />
                        ) : (
                          <div className="text-xs font-extrabold text-blue-100/80 px-3 text-center">
                            {m?.name?.en || m?.methodId}
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-sm text-blue-100/65">
                    No withdraw methods found.
                  </div>
                )}
              </div>

              {!!selectedMethod && (
                <div className="mt-3 text-sm text-blue-100/70">
                  Selected:{" "}
                  <span className="font-bold text-white">
                    {selectedMethod?.name?.en || selectedMethod?.methodId}
                  </span>
                </div>
              )}
            </div>

            {!!selectedMethod?.fields?.length && (
              <div>
                <div className="text-base font-semibold text-white">
                  Account Information <span className="text-red-400">*</span>
                </div>

                <div className="mt-4 max-w-[560px] space-y-4">
                  {selectedMethod.fields.map((f) => {
                    const label = f?.label?.en || f.key;
                    const placeholder = f?.placeholder?.en || "";
                    const err = fieldErrors?.[f.key];

                    return (
                      <div key={f.key}>
                        <label className={labelCls}>
                          {label}{" "}
                          {f.required !== false && (
                            <span className="text-red-400">*</span>
                          )}
                        </label>

                        <input
                          disabled={!accountOk}
                          type={f.type === "number" ? "text" : f.type}
                          value={formValues?.[f.key] ?? ""}
                          onChange={(e) => setVal(f.key, e.target.value)}
                          placeholder={placeholder}
                          className={`${inputCls} ${
                            !accountOk ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                          inputMode={
                            f.type === "number" ? "numeric" : undefined
                          }
                        />

                        {!!err && (
                          <div className="mt-2 text-xs text-red-300">{err}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="max-w-[560px]">
              <div className="flex items-center justify-between gap-3">
                <label className={labelCls}>
                  Withdraw Amount <span className="text-red-400">*</span>
                </label>
                <FaQuestionCircle className="text-blue-100/60" />
              </div>

              <input
                disabled={!accountOk}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={
                  hasMax
                    ? `Min ${formatMoney(min)} - Max ${formatMoney(max)}`
                    : `Min ${formatMoney(min)}`
                }
                className={`${inputCls} ${
                  !accountOk ? "opacity-60 cursor-not-allowed" : ""
                }`}
                inputMode="numeric"
              />

              {!!amountErrorText && (
                <div className="mt-2 text-xs text-red-300">
                  {amountErrorText}
                </div>
              )}
            </div>

            <div className="max-w-[560px]">
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={onSubmit}
                className={`w-full h-[52px] rounded-2xl text-sm font-extrabold transition ${
                  canSubmit && !submitting
                    ? "bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] text-white shadow-lg shadow-blue-800/30 border border-blue-300/20 cursor-pointer"
                    : "bg-gray-800/60 text-white/30 border border-blue-900/30 cursor-not-allowed"
                }`}
              >
                {submitting ? "Submitting..." : "WITHDRAW"}
              </button>

              {!canSubmit && !submitting && (
                <div className="mt-3 text-xs text-blue-100/60">
                  {!accountOk
                    ? "Please login."
                    : !elig.eligible
                      ? elig.message || "Not eligible right now."
                      : !selectedMethod
                        ? "Select a method."
                        : !allRequiredOk
                          ? "Fill all required fields."
                          : !noTypeErrors
                            ? "Some inputs are invalid."
                            : !validAmount
                              ? "Amount is invalid."
                              : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/35 to-black/70 px-5 py-5">
            <div className="text-lg font-extrabold text-white">
              Important Notice
            </div>
            <div className="mt-1 text-sm text-blue-100/70">
              Please read before submitting a request
            </div>
          </div>

          <div className="p-5 space-y-4 text-sm leading-7 text-blue-100/80">
            {notices.map((n, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-blue-200/10 bg-black/25 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[#8fc2f5]">
                    <FaInfoCircle />
                  </div>
                  <div>
                    <div className="font-extrabold text-white">
                      {idx + 1}. {n.title}
                    </div>
                    <p className="mt-1">{n.body}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
              <div className="font-extrabold text-white">Quick Tip</div>
              <p className="mt-1">
                Withdraw request submit করার আগে method, amount, এবং account
                info আবার check করে নাও।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;

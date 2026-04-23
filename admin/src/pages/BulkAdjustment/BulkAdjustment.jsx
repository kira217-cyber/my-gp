import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  FaSearch,
  FaSyncAlt,
  FaBolt,
  FaUser,
  FaPhoneAlt,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEnvelope,
  FaIdCard,
  FaWallet,
} from "react-icons/fa";
import { PiBridgeBold } from "react-icons/pi";
import { selectAuth } from "../../features/auth/authSelectors";
import { api } from "../../api/axios";

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const money = (v, currency = "BDT") => {
  const symbol = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = n(v);

  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "positive") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/25";
  }

  if (s === "negative") {
    return "bg-red-500/15 text-red-300 border-red-400/25";
  }

  return "bg-amber-500/15 text-amber-300 border-amber-400/25";
};

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-blue-200/10 last:border-b-0">
    <div className="text-[13px] font-semibold text-blue-100/70">{k}</div>
    <div className="text-[13px] font-extrabold text-white text-right break-all">
      {v}
    </div>
  </div>
);

const StatCard = ({ title, value, sub, icon }) => (
  <div className="rounded-2xl border border-blue-200/15 bg-gradient-to-br from-black/60 via-[#2f79c9]/10 to-black/60 p-4 shadow-lg shadow-blue-900/20">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm text-blue-100/70 font-medium">{title}</div>
        <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
          {value}
        </div>
        {sub ? (
          <div className="text-xs text-blue-100/50 mt-1">{sub}</div>
        ) : null}
      </div>

      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#63a8ee]/25 to-[#2f79c9]/25 border border-blue-300/15 flex items-center justify-center text-[#8fc2f5] text-lg shadow-md shadow-blue-900/20 shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

const Skeleton = () => (
  <div className="p-5 sm:p-6 space-y-4">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="h-20 w-full rounded-2xl bg-white/5 animate-pulse border border-blue-200/10"
      />
    ))}
  </div>
);

const ConfirmModal = ({
  open,
  title,
  desc,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-200/15 bg-gradient-to-b from-black via-[#18345e] to-black text-white shadow-2xl shadow-blue-900/40">
        <div className="px-6 py-5 border-b border-blue-200/10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
            <FaExclamationTriangle className="text-amber-300 text-xl" />
          </div>

          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-tight">{title}</div>
            {desc ? (
              <div className="text-sm text-blue-100/70 mt-1 leading-6">
                {desc}
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-6 py-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm disabled:opacity-50 transition"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] border border-blue-300/20 text-white font-semibold text-sm disabled:opacity-50 inline-flex items-center gap-2 shadow-lg shadow-blue-800/30 transition"
          >
            {loading ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <FaCheckCircle />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkAdjustment = () => {
  const auth = useSelector(selectAuth);

  const headers = useMemo(
    () => (auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    [auth?.token],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [expandedId, setExpandedId] = useState("");
  const [singleModal, setSingleModal] = useState({ open: false, user: null });
  const [allModal, setAllModal] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  const page = pagination.page;
  const limit = pagination.limit;
  const totalPages = pagination.totalPages;

  const computePreview = (u) => {
    const gross =
      n(u?.gameLossCommissionBalance) +
      n(u?.depositCommissionBalance) +
      n(u?.referCommissionBalance);

    const net = gross - n(u?.gameWinCommissionBalance);

    return { gross, net };
  };

  const fetchData = async (
    { page: p = page, limit: l = limit, query = q } = {},
    isRefresh = false,
  ) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = { page: p, limit: l };
      if (query) params.q = query;

      const { data } = await api.get("/api/admin/bulk-adjustment/users", {
        params,
        headers,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Fetch failed");
      }

      setRows(Array.isArray(data?.data) ? data.data : []);
      setPagination({
        page: data?.pagination?.page || p,
        limit: data?.pagination?.limit || l,
        total: data?.pagination?.total || 0,
        totalPages: data?.pagination?.totalPages || 1,
      });

      setExpandedId("");
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const query = qInput.trim();
    setQ(query);
    fetchData({ page: 1, query }, true);
  };

  const onRefresh = async () => {
    await fetchData({ page }, true);
    toast.info("Refreshed");
  };

  const onPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchData({ page: newPage }, true);
  };

  const openSingleAdjust = (user) => {
    setSingleModal({ open: true, user });
  };

  const closeSingleAdjust = () => {
    setSingleModal({ open: false, user: null });
  };

  const doAdjustSingle = async () => {
    const user = singleModal.user;
    if (!user?._id) return;

    try {
      setAdjusting(true);

      const { data } = await api.post(
        `/api/admin/bulk-adjustment/adjust/${user._id}`,
        {},
        { headers },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Adjustment failed");
      }

      toast.success("Bulk adjustment completed");
      closeSingleAdjust();
      await fetchData({ page }, true);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setAdjusting(false);
    }
  };

  const doAdjustAll = async () => {
    try {
      setAdjusting(true);

      const body = q ? { q } : {};

      const { data } = await api.post(
        "/api/admin/bulk-adjustment/adjust-all",
        body,
        { headers },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Bulk adjustment failed");
      }

      toast.success(
        `Adjusted ${data?.data?.adjustedUsers ?? 0} affiliate users successfully`,
      );

      setAllModal(false);
      await fetchData({ page: 1 }, true);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setAdjusting(false);
    }
  };

  const headerStats = useMemo(() => {
    const total = n(pagination.total);
    const showing = rows.length;

    let pageGross = 0;
    let pageNet = 0;

    rows.forEach((u) => {
      const { gross, net } = computePreview(u);
      pageGross += gross;
      pageNet += net;
    });

    return { total, showing, pageGross, pageNet };
  }, [pagination.total, rows]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-200/15 bg-gradient-to-b from-black via-[#1d4175]/25 to-black shadow-2xl shadow-blue-900/30 text-white backdrop-blur-sm">
        <div className="px-5 py-5 sm:px-6 sm:py-6 border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/55 to-black/70">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] border border-blue-300/20 shadow-lg shadow-blue-800/30 shrink-0">
                <PiBridgeBold className="text-white text-3xl" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Bulk Adjustment
                </h1>
                <p className="text-sm text-blue-100/80 mt-1 leading-6">
                  Move affiliate commission balances to{" "}
                  <span className="font-semibold text-white">
                    wallet balance
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-black/35 hover:bg-black/55 border border-blue-200/15 disabled:opacity-60 transition shadow-sm"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                onClick={() => setAllModal(true)}
                disabled={loading || refreshing || adjusting}
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] border border-blue-300/20 shadow-lg shadow-blue-800/30 disabled:opacity-60 transition"
              >
                <FaBolt className="text-base" />
                Adjust All
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 border-b border-blue-200/10 bg-black/30">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <form onSubmit={onSearch} className="relative xl:col-span-2">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fc2f5] text-lg" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search by userId / phone / email..."
                className="w-full pl-12 pr-5 py-3 rounded-2xl bg-black/45 border border-blue-200/15 text-white placeholder-blue-100/40 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition"
              />
            </form>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-blue-100/85 whitespace-nowrap">
                Per Page
              </label>

              <select
                value={limit}
                onChange={(e) =>
                  fetchData({ page: 1, limit: Number(e.target.value) }, true)
                }
                className="cursor-pointer w-full py-3 px-4 rounded-2xl bg-black/45 border border-blue-200/15 text-white outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="rounded-2xl border border-blue-200/15 bg-gradient-to-br from-black/50 via-[#2f79c9]/10 to-black/50 p-4 flex flex-col justify-center">
              <div className="text-sm text-blue-100/75 font-medium">
                Current Page Preview
              </div>
              <div className="text-[11px] text-blue-100/45 mt-1">
                gross / net
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white mt-2 tracking-tight">
                {money(headerStats.pageGross)}{" "}
                <span className="text-blue-200/35">/</span>{" "}
                {money(headerStats.pageNet)}
              </div>
              <div className="text-[11px] text-blue-100/45 mt-1">
                gross = loss + deposit + refer • net = gross − win
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <StatCard
              title="Total Affiliates"
              value={headerStats.total}
              sub="All matched records"
              icon={<FaUser />}
            />
            <StatCard
              title="Showing Now"
              value={headerStats.showing}
              sub={`Page ${page} of ${totalPages}`}
              icon={<FaIdCard />}
            />
            <StatCard
              title="Page Net Preview"
              value={money(headerStats.pageNet)}
              sub="Expected net wallet movement"
              icon={<FaWallet />}
            />
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : rows.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#63a8ee]/20 to-[#2f79c9]/20 border border-blue-300/15 flex items-center justify-center text-4xl shadow-lg shadow-blue-900/20">
              📭
            </div>
            <h3 className="text-2xl font-bold text-white mt-6 mb-3">
              No affiliate users found
            </h3>
            <p className="text-blue-100/65 max-w-md mx-auto">
              Try changing your search keyword or refresh the list again.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200/10">
                <thead className="bg-black/35">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#a8d1fb]">
                      Affiliate
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#a8d1fb]">
                      Wallet
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#a8d1fb]">
                      Gross
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#a8d1fb]">
                      Win Deduct
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#a8d1fb]">
                      Net
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#a8d1fb]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-blue-200/8">
                  {rows.map((u) => {
                    const id = String(u?._id || "");
                    const isExpanded = expandedId === id;
                    const currency = u?.currency || "BDT";

                    const { gross, net } = computePreview(u);
                    const netType =
                      net > 0 ? "positive" : net < 0 ? "negative" : "zero";

                    return (
                      <React.Fragment key={id}>
                        <tr
                          className={`transition-colors ${
                            isExpanded
                              ? "bg-[#2f79c9]/10"
                              : "hover:bg-[#2f79c9]/8"
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee]/20 to-[#2f79c9]/20 border border-blue-300/15 shrink-0">
                                <FaUser className="text-[#8fc2f5]" />
                              </div>

                              <div className="min-w-0">
                                <div className="font-bold text-white truncate">
                                  {u?.fullName || "No name"}
                                </div>

                                <div className="text-sm text-blue-100/65 flex items-center gap-2 mt-1">
                                  <FaIdCard className="text-xs shrink-0" />
                                  <span className="truncate">
                                    {u?.userId || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 font-bold text-white">
                            {money(u?.balance ?? 0, currency)}
                          </td>

                          <td className="px-6 py-5 font-bold text-emerald-300">
                            {money(gross, currency)}
                          </td>

                          <td className="px-6 py-5 font-bold text-amber-300">
                            {money(u?.gameWinCommissionBalance ?? 0, currency)}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold border ${chipClass(
                                netType,
                              )}`}
                            >
                              {money(net, currency)}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openSingleAdjust(u)}
                                disabled={adjusting}
                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] text-white text-sm font-semibold border border-blue-300/20 shadow-lg shadow-blue-800/20 transition disabled:opacity-60"
                              >
                                <FaBolt />
                                Adjust
                              </button>

                              <button
                                onClick={() =>
                                  setExpandedId(isExpanded ? "" : id)
                                }
                                className="cursor-pointer p-2.5 rounded-xl text-[#8fc2f5] hover:text-white hover:bg-white/5 transition"
                              >
                                {isExpanded ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="p-0 bg-black/25">
                              <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="rounded-2xl border border-blue-200/10 bg-gradient-to-b from-black/50 to-[#2f79c9]/8 p-5">
                                  <h3 className="text-base font-bold text-[#a8d1fb] mb-4">
                                    Affiliate Information
                                  </h3>

                                  <FieldRow
                                    k="Full Name"
                                    v={u?.fullName || "—"}
                                  />
                                  <FieldRow k="User ID" v={u?.userId || "—"} />
                                  <FieldRow
                                    k="Phone"
                                    v={
                                      <span className="inline-flex items-center gap-2">
                                        <FaPhoneAlt />
                                        {u?.phone || "—"}
                                      </span>
                                    }
                                  />
                                  <FieldRow
                                    k="Email"
                                    v={
                                      <span className="inline-flex items-center gap-2">
                                        <FaEnvelope />
                                        {u?.email || "—"}
                                      </span>
                                    }
                                  />
                                </div>

                                <div className="rounded-2xl border border-blue-200/10 bg-gradient-to-b from-black/50 to-[#2f79c9]/8 p-5">
                                  <h3 className="text-base font-bold text-[#a8d1fb] mb-4">
                                    Commission Breakdown
                                  </h3>

                                  <FieldRow
                                    k="Game Loss"
                                    v={money(
                                      u?.gameLossCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Deposit"
                                    v={money(
                                      u?.depositCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Referral"
                                    v={money(
                                      u?.referCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Game Win (deduct)"
                                    v={money(
                                      u?.gameWinCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Gross"
                                    v={money(gross, currency)}
                                  />
                                  <FieldRow k="Net" v={money(net, currency)} />
                                  <FieldRow
                                    k="Current Balance"
                                    v={money(u?.balance ?? 0, currency)}
                                  />
                                  <FieldRow
                                    k="Expected Balance"
                                    v={money(n(u?.balance) + net, currency)}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden p-4 sm:p-5 space-y-4">
              {rows.map((u) => {
                const id = String(u?._id || "");
                const isExpanded = expandedId === id;
                const currency = u?.currency || "BDT";
                const { gross, net } = computePreview(u);
                const netType =
                  net > 0 ? "positive" : net < 0 ? "negative" : "zero";

                return (
                  <div
                    key={id}
                    className="rounded-3xl border border-blue-200/12 bg-gradient-to-b from-black/75 to-[#2f79c9]/10 overflow-hidden shadow-lg shadow-blue-900/10"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee]/20 to-[#2f79c9]/20 border border-blue-300/15 shrink-0">
                            <FaUser className="text-[#8fc2f5]" />
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">
                              {u?.fullName || "No name"}
                            </div>
                            <div className="text-sm text-blue-100/65 truncate mt-1">
                              ID: {u?.userId || "—"}
                            </div>
                            <div className="text-sm text-blue-100/65 truncate">
                              {u?.phone || "—"}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${chipClass(
                            netType,
                          )}`}
                        >
                          {money(net, currency)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="rounded-2xl bg-black/35 border border-blue-200/10 p-3">
                          <div className="text-xs text-blue-100/60">Wallet</div>
                          <div className="text-sm font-bold text-white mt-1">
                            {money(u?.balance ?? 0, currency)}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-black/35 border border-blue-200/10 p-3">
                          <div className="text-xs text-blue-100/60">Gross</div>
                          <div className="text-sm font-bold text-emerald-300 mt-1">
                            {money(gross, currency)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => openSingleAdjust(u)}
                          disabled={adjusting}
                          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] text-white text-sm font-semibold border border-blue-300/20 shadow-lg shadow-blue-800/20 transition disabled:opacity-60"
                        >
                          <FaBolt />
                          Adjust
                        </button>

                        <button
                          onClick={() => setExpandedId(isExpanded ? "" : id)}
                          className="cursor-pointer px-4 py-3 rounded-2xl bg-black/35 border border-blue-200/10 text-[#8fc2f5] hover:text-white hover:bg-white/5 transition"
                        >
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-blue-200/10 p-4 space-y-4 bg-black/20">
                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                          <h3 className="text-sm font-bold text-[#a8d1fb] mb-3">
                            User Info
                          </h3>
                          <FieldRow k="Full Name" v={u?.fullName || "—"} />
                          <FieldRow k="User ID" v={u?.userId || "—"} />
                          <FieldRow k="Phone" v={u?.phone || "—"} />
                          <FieldRow k="Email" v={u?.email || "—"} />
                        </div>

                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                          <h3 className="text-sm font-bold text-[#a8d1fb] mb-3">
                            Adjustment Preview
                          </h3>
                          <FieldRow
                            k="Game Loss"
                            v={money(
                              u?.gameLossCommissionBalance ?? 0,
                              currency,
                            )}
                          />
                          <FieldRow
                            k="Deposit"
                            v={money(
                              u?.depositCommissionBalance ?? 0,
                              currency,
                            )}
                          />
                          <FieldRow
                            k="Referral"
                            v={money(u?.referCommissionBalance ?? 0, currency)}
                          />
                          <FieldRow
                            k="Game Win"
                            v={money(
                              u?.gameWinCommissionBalance ?? 0,
                              currency,
                            )}
                          />
                          <FieldRow k="Gross" v={money(gross, currency)} />
                          <FieldRow k="Net" v={money(net, currency)} />
                          <FieldRow
                            k="Expected Wallet"
                            v={money(n(u?.balance) + net, currency)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-5 border-t border-blue-200/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/25">
                <div className="text-sm text-blue-100/70 order-2 sm:order-1">
                  Showing{" "}
                  <strong className="text-white">
                    {(page - 1) * limit + 1}
                  </strong>
                  {" - "}
                  <strong className="text-white">
                    {Math.min(page * limit, pagination.total)}
                  </strong>{" "}
                  of <strong className="text-white">{pagination.total}</strong>
                </div>

                <div className="flex items-center gap-3 order-1 sm:order-2">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1 || refreshing}
                    className="cursor-pointer px-5 py-2.5 rounded-xl bg-black/45 border border-blue-200/12 text-white disabled:opacity-40 hover:bg-white/5 transition"
                  >
                    Previous
                  </button>

                  <span className="px-5 py-2.5 font-semibold text-white">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || refreshing}
                    className="cursor-pointer px-5 py-2.5 rounded-xl bg-black/45 border border-blue-200/12 text-white disabled:opacity-40 hover:bg-white/5 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={singleModal.open}
        title={`Adjust: ${singleModal.user?.userId || "Affiliate User"}`}
        desc={
          singleModal.user
            ? (() => {
                const u = singleModal.user;
                const currency = u?.currency || "BDT";
                const { gross, net } = computePreview(u);

                return `Gross: ${money(gross, currency)}, Net: ${money(
                  net,
                  currency,
                )}. Net amount will be added to wallet balance and source balances will reset to 0.`;
              })()
            : ""
        }
        confirmText="Adjust Now"
        loading={adjusting}
        onClose={adjusting ? undefined : closeSingleAdjust}
        onConfirm={doAdjustSingle}
      />

      <ConfirmModal
        open={allModal}
        title="Adjust ALL Affiliates?"
        desc={
          q
            ? `This will process all affiliates matching: "${q}". Net amounts will be added to balance.`
            : "This action will process all affiliate users. Net amounts will be added to balance and all source balances will reset to 0."
        }
        confirmText="Confirm Adjust All"
        loading={adjusting}
        onClose={adjusting ? undefined : () => setAllModal(false)}
        onConfirm={doAdjustAll}
      />
    </div>
  );
};

export default BulkAdjustment;

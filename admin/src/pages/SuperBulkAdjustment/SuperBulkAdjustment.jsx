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
  <div className="flex items-start justify-between gap-4 border-b border-blue-200/10 py-3 last:border-b-0">
    <div className="text-[13px] font-semibold text-blue-100/70">{k}</div>
    <div className="break-all text-right text-[13px] font-extrabold text-white">
      {v}
    </div>
  </div>
);

const StatCard = ({ title, value, sub, icon }) => (
  <div className="rounded-2xl border border-blue-200/15 bg-gradient-to-br from-black/60 via-[#2f79c9]/10 to-black/60 p-4 shadow-lg shadow-blue-900/20">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-blue-100/70">{title}</div>
        <div className="mt-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {value}
        </div>
        {sub ? (
          <div className="mt-1 text-xs text-blue-100/50">{sub}</div>
        ) : null}
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-300/15 bg-gradient-to-br from-[#63a8ee]/25 to-[#2f79c9]/25 text-lg text-[#8fc2f5] shadow-md shadow-blue-900/20">
        {icon}
      </div>
    </div>
  </div>
);

const Skeleton = () => (
  <div className="space-y-4 p-5 sm:p-6">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="h-20 w-full animate-pulse rounded-2xl border border-blue-200/10 bg-white/5"
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
        <div className="flex items-start gap-4 border-b border-blue-200/10 px-6 py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/15">
            <FaExclamationTriangle className="text-xl text-amber-300" />
          </div>

          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-tight">{title}</div>
            {desc ? (
              <div className="mt-1 text-sm leading-6 text-blue-100/70">
                {desc}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-800/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:opacity-50"
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

const SuperBulkAdjustment = () => {
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

      const { data } = await api.get("/api/admin/super-bulk-adjustment/users", {
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
        `/api/admin/super-bulk-adjustment/adjust/${user._id}`,
        {},
        { headers },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Adjustment failed");
      }

      toast.success("Super bulk adjustment completed");
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
        "/api/admin/super-bulk-adjustment/adjust-all",
        body,
        { headers },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Super bulk adjustment failed");
      }

      toast.success(
        `Adjusted ${data?.data?.adjustedUsers ?? 0} super affiliate users successfully`,
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
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-200/15 bg-gradient-to-b from-black via-[#1d4175]/25 to-black text-white shadow-2xl shadow-blue-900/30 backdrop-blur-sm">
        <div className="border-b border-blue-200/10 bg-gradient-to-r from-black/70 via-[#2f79c9]/55 to-black/70 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-800/30">
                <PiBridgeBold className="text-3xl text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Super Bulk Adjustment
                </h1>
                <p className="mt-1 text-sm leading-6 text-blue-100/80">
                  Move super affiliate commission balances to{" "}
                  <span className="font-semibold text-white">
                    wallet balance
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200/15 bg-black/35 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-black/55 disabled:opacity-60"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setAllModal(true)}
                disabled={loading || refreshing || adjusting}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-800/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:opacity-60"
              >
                <FaBolt className="text-base" />
                Adjust All
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-blue-200/10 bg-black/30 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <form onSubmit={onSearch} className="relative xl:col-span-2">
              <FaSearch className="absolute left-4 top-6 -translate-y-1/2 text-lg text-[#8fc2f5]" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search by super userId / phone / email..."
                className="w-full rounded-2xl border border-blue-200/15 bg-black/45 py-3 pl-12 pr-5 text-white placeholder-blue-100/40 outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
              />
            </form>

            <div className="flex items-center gap-3">
              <label className="whitespace-nowrap text-sm font-semibold text-blue-100/85">
                Per Page
              </label>

              <select
                value={limit}
                onChange={(e) =>
                  fetchData({ page: 1, limit: Number(e.target.value) }, true)
                }
                className="w-full cursor-pointer rounded-2xl border border-blue-200/15 bg-black/45 px-4 py-3 text-white outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-blue-200/15 bg-gradient-to-br from-black/50 via-[#2f79c9]/10 to-black/50 p-4">
              <div className="text-sm font-medium text-blue-100/75">
                Current Page Preview
              </div>
              <div className="mt-1 text-[11px] text-blue-100/45">
                gross / net
              </div>
              <div className="mt-2 text-lg font-extrabold tracking-tight text-white sm:text-xl">
                {money(headerStats.pageGross)}{" "}
                <span className="text-blue-200/35">/</span>{" "}
                {money(headerStats.pageNet)}
              </div>
              <div className="mt-1 text-[11px] text-blue-100/45">
                gross = loss + deposit + refer • net = gross − win
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Super Affiliates"
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
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-300/15 bg-gradient-to-br from-[#63a8ee]/20 to-[#2f79c9]/20 text-4xl shadow-lg shadow-blue-900/20">
              📭
            </div>
            <h3 className="mb-3 mt-6 text-2xl font-bold text-white">
              No super affiliate users found
            </h3>
            <p className="mx-auto max-w-md text-blue-100/65">
              Try changing your search keyword or refresh the list again.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-blue-200/10">
                <thead className="bg-black/35">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#a8d1fb]">
                      Super Affiliate
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
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#63a8ee]/20 to-[#2f79c9]/20">
                                <FaUser className="text-[#8fc2f5]" />
                              </div>

                              <div className="min-w-0">
                                <div className="truncate font-bold text-white">
                                  {u?.fullName || "No name"}
                                </div>

                                <div className="mt-1 flex items-center gap-2 text-sm text-blue-100/65">
                                  <FaIdCard className="shrink-0 text-xs" />
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
                              className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${chipClass(
                                netType,
                              )}`}
                            >
                              {money(net, currency)}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => openSingleAdjust(u)}
                                disabled={adjusting}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:opacity-60"
                              >
                                <FaBolt />
                                Adjust
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(isExpanded ? "" : id)
                                }
                                className="cursor-pointer rounded-xl p-2.5 text-[#8fc2f5] transition hover:bg-white/5 hover:text-white"
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
                            <td colSpan={6} className="bg-black/25 p-0">
                              <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-2">
                                <div className="rounded-2xl border border-blue-200/10 bg-gradient-to-b from-black/50 to-[#2f79c9]/8 p-5">
                                  <h3 className="mb-4 text-base font-bold text-[#a8d1fb]">
                                    Super Affiliate Information
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
                                  <h3 className="mb-4 text-base font-bold text-[#a8d1fb]">
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

            <div className="space-y-4 p-4 sm:p-5 lg:hidden">
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
                    className="overflow-hidden rounded-3xl border border-blue-200/12 bg-gradient-to-b from-black/75 to-[#2f79c9]/10 shadow-lg shadow-blue-900/10"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-300/15 bg-gradient-to-br from-[#63a8ee]/20 to-[#2f79c9]/20">
                            <FaUser className="text-[#8fc2f5]" />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate font-bold text-white">
                              {u?.fullName || "No name"}
                            </div>
                            <div className="mt-1 truncate text-sm text-blue-100/65">
                              ID: {u?.userId || "—"}
                            </div>
                            <div className="truncate text-sm text-blue-100/65">
                              {u?.phone || "—"}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${chipClass(
                            netType,
                          )}`}
                        >
                          {money(net, currency)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-blue-200/10 bg-black/35 p-3">
                          <div className="text-xs text-blue-100/60">Wallet</div>
                          <div className="mt-1 text-sm font-bold text-white">
                            {money(u?.balance ?? 0, currency)}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-blue-200/10 bg-black/35 p-3">
                          <div className="text-xs text-blue-100/60">Gross</div>
                          <div className="mt-1 text-sm font-bold text-emerald-300">
                            {money(gross, currency)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openSingleAdjust(u)}
                          disabled={adjusting}
                          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-300/20 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:opacity-60"
                        >
                          <FaBolt />
                          Adjust
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? "" : id)}
                          className="cursor-pointer rounded-2xl border border-blue-200/10 bg-black/35 px-4 py-3 text-[#8fc2f5] transition hover:bg-white/5 hover:text-white"
                        >
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-4 border-t border-blue-200/10 bg-black/20 p-4">
                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                          <h3 className="mb-3 text-sm font-bold text-[#a8d1fb]">
                            User Info
                          </h3>
                          <FieldRow k="Full Name" v={u?.fullName || "—"} />
                          <FieldRow k="User ID" v={u?.userId || "—"} />
                          <FieldRow k="Phone" v={u?.phone || "—"} />
                          <FieldRow k="Email" v={u?.email || "—"} />
                        </div>

                        <div className="rounded-2xl border border-blue-200/10 bg-black/25 p-4">
                          <h3 className="mb-3 text-sm font-bold text-[#a8d1fb]">
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
              <div className="flex flex-col items-center justify-between gap-4 border-t border-blue-200/10 bg-black/25 px-6 py-5 sm:flex-row">
                <div className="order-2 text-sm text-blue-100/70 sm:order-1">
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

                <div className="order-1 flex items-center gap-3 sm:order-2">
                  <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1 || refreshing}
                    className="cursor-pointer rounded-xl border border-blue-200/12 bg-black/45 px-5 py-2.5 text-white transition hover:bg-white/5 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-5 py-2.5 font-semibold text-white">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || refreshing}
                    className="cursor-pointer rounded-xl border border-blue-200/12 bg-black/45 px-5 py-2.5 text-white transition hover:bg-white/5 disabled:opacity-40"
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
        title={`Adjust: ${singleModal.user?.userId || "Super Affiliate User"}`}
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
        title="Adjust ALL Super Affiliates?"
        desc={
          q
            ? `This will process all super affiliates matching: "${q}". Net amounts will be added to balance.`
            : "This action will process all super affiliate users. Net amounts will be added to balance and all source balances will reset to 0."
        }
        confirmText="Confirm Adjust All"
        loading={adjusting}
        onClose={adjusting ? undefined : () => setAllModal(false)}
        onConfirm={doAdjustAll}
      />
    </div>
  );
};

export default SuperBulkAdjustment;
